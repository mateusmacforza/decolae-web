
if (
  process.env.NODE_ENV !== 'production' &&
  (!process.env.DATABASE_URL || !process.env.SESSION_SECRET)
) {
  process.loadEnvFile('.env.local');
}

const { Pool } = require('pg');
const { randomBytes } = require('node:crypto');
const { verificarToken } = require('../lib/sessao');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 3,
  connectionTimeoutMillis: 10000
});

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      erro: 'Método não permitido.'
    });
  }

  // Identifica o cliente pela sessão
  const cookie = String(req.headers.cookie || '')
    .split(';')
    .map(item => item.trim())
    .find(item => item.startsWith('decolae_cliente='));

  const token = cookie
    ? cookie.slice('decolae_cliente='.length)
    : null;

  let sessao = null;

  try {
    sessao = token ? verificarToken(token) : null;
  } catch {
    sessao = null;
  }

  if (!sessao) {
    return res.status(401).json({
      erro: 'Faça login como cliente para comprar.'
    });
  }

  // Recebe os dados da passagem
  let corpo;

  try {
    corpo = typeof req.body === 'string'
      ? JSON.parse(req.body)
      : req.body || {};
  } catch {
    return res.status(400).json({
      erro: 'Dados da compra inválidos.'
    });
  }

  const codigoVoo = Number(corpo.codigo_voo);
  const assento = Number(corpo.numero_assento);

  // CPF vem exclusivamente da sessão autenticada
  const cpf = sessao.cpf;

  if (
    !Number.isSafeInteger(codigoVoo) ||
    codigoVoo <= 0 ||
    !Number.isSafeInteger(assento) ||
    assento <= 0
  ) {
    return res.status(400).json({
      erro: 'Dados da passagem inválidos.'
    });
  }

  let client;

  try {
    client = await pool.connect();

    await client.query('BEGIN');

    // Bloqueia o voo para evitar compras simultâneas
    // do mesmo assento
    const resultadoVoo = await client.query(`
      SELECT
        v.codigo_voo,
        a.qtd_assentos AS capacidade
      FROM voo v
      JOIN aeronave a
        ON a.numero_serie = v.numero_serie_aeronave
      WHERE v.codigo_voo = $1
      FOR UPDATE OF v
    `, [codigoVoo]);

    if (resultadoVoo.rows.length === 0) {
      await client.query('ROLLBACK');

      return res.status(404).json({
        erro: 'Voo não encontrado.'
      });
    }

    const capacidade = Number(
      resultadoVoo.rows[0].capacidade
    );

    if (assento > capacidade) {
      await client.query('ROLLBACK');

      return res.status(400).json({
        erro: 'Assento fora da capacidade da aeronave.'
      });
    }

    // Verifica se a conta do cliente continua ativa
    const resultadoCliente = await client.query(`
      SELECT 1
      FROM cliente c
      JOIN cliente_acesso ca
        ON ca.cpf_cliente = c.cpf
      WHERE c.cpf = $1
        AND ca.ativo = TRUE
    `, [cpf]);

    if (resultadoCliente.rows.length === 0) {
      await client.query('ROLLBACK');

      return res.status(401).json({
        erro: 'Conta do cliente não encontrada ou desativada.'
      });
    }

    // Verifica se o assento já foi vendido
    const ocupado = await client.query(`
      SELECT 1
      FROM passagem
      WHERE codigo_voo = $1
        AND numero_assento = $2
    `, [codigoVoo, assento]);

    if (ocupado.rows.length > 0) {
      await client.query('ROLLBACK');

      return res.status(409).json({
        erro: 'Este assento já está ocupado.'
      });
    }

    // Valor fixo para demonstração acadêmica
    const valor = 300.00;

    const codigoReserva =
      'DCL-' + randomBytes(4).toString('hex').toUpperCase();

    // Registra a passagem
    const compra = await client.query(`
      INSERT INTO passagem (
        codigo_reserva,
        cpf_cliente,
        codigo_voo,
        numero_assento,
        valor
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        codigo_reserva,
        codigo_voo,
        numero_assento,
        valor,
        data_compra
    `, [
      codigoReserva,
      cpf,
      codigoVoo,
      assento,
      valor
    ]);

    await client.query('COMMIT');

    return res.status(201).json({
      mensagem: 'Compra realizada com sucesso!',
      passagem: compra.rows[0]
    });

  } catch (erro) {
    if (client) {
      await client.query('ROLLBACK').catch(() => {});
    }

    console.error('Erro na compra:', erro.message);

    if (erro.code === '23505') {
      return res.status(409).json({
        erro: 'Conflito de reserva. Tente novamente.'
      });
    }

    return res.status(500).json({
      erro: 'Não foi possível realizar a compra.'
    });

  } finally {
    if (client) {
      client.release();
    }
  }
};
