
if (!process.env.DATABASE_URL &&
    process.env.NODE_ENV !== 'production') {
  process.loadEnvFile('.env.local');
}

const { Pool } = require('pg');
const { gerarHash } = require('../lib/senhas');

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

  const corpo = typeof req.body === 'string'
    ? JSON.parse(req.body)
    : req.body || {};

  const cpf = String(corpo.cpf || '').trim();
  const nome = String(corpo.nome || '').trim();
  const senha = corpo.senha;

  if (
    !/^\d{11}$/.test(cpf) ||
    nome.length < 3 ||
    nome.length > 150 ||
    typeof senha !== 'string' ||
    senha.length < 12 ||
    senha.length > 1024
  ) {
    return res.status(400).json({
      erro: 'Informe nome, CPF de 11 dígitos e senha de pelo menos 12 caracteres.'
    });
  }

  let client;

  try {
    const hash = await gerarHash(senha);
    client = await pool.connect();

    await client.query('BEGIN');

    await client.query(`
      INSERT INTO cliente (cpf, nome)
      VALUES ($1, $2)
    `, [cpf, nome]);

    await client.query(`
      INSERT INTO cliente_acesso (cpf_cliente, senha_hash)
      VALUES ($1, $2)
    `, [cpf, hash]);

    await client.query('COMMIT');

    return res.status(201).json({
      mensagem: 'Cliente cadastrado com sucesso!'
    });

  } catch (erro) {
    if (client) {
      await client.query('ROLLBACK').catch(() => {});
    }

    if (erro.code === '23505') {
      return res.status(409).json({
        erro: 'CPF já cadastrado.'
      });
    }

    console.error('Erro no cadastro:', erro.message);

    return res.status(500).json({
      erro: 'Não foi possível cadastrar o cliente.'
    });

  } finally {
    if (client) client.release();
  }
};
