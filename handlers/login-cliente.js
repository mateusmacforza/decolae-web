
if (
  process.env.NODE_ENV !== 'production' &&
  (!process.env.DATABASE_URL || !process.env.SESSION_SECRET)
) {
  process.loadEnvFile('.env.local');
}

const { Pool } = require('pg');
const { verificarSenha } = require('../lib/senhas');
const { criarToken } = require('../lib/sessao');

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

  try {
    const corpo = typeof req.body === 'string'
      ? JSON.parse(req.body)
      : req.body || {};

    const cpf = String(corpo.cpf || '').trim();
    const senha = corpo.senha;

    if (
      !/^\d{11}$/.test(cpf) ||
      typeof senha !== 'string' ||
      senha.length > 1024
    ) {
      return res.status(400).json({
        erro: 'CPF ou senha inválidos.'
      });
    }

    const resultado = await pool.query(`
      SELECT
        TRIM(c.cpf) AS cpf,
        c.nome,
        ca.senha_hash
      FROM cliente_acesso ca
      JOIN cliente c ON c.cpf = ca.cpf_cliente
      WHERE ca.cpf_cliente = $1
        AND ca.ativo = TRUE
    `, [cpf]);

    const cliente = resultado.rows[0];

    if (
      !cliente ||
      !(await verificarSenha(senha, cliente.senha_hash))
    ) {
      return res.status(401).json({
        erro: 'CPF ou senha incorretos.'
      });
    }

    const token = criarToken(cliente.cpf);

    const atributos = [
      `decolae_cliente=${token}`,
      'HttpOnly',
      'SameSite=Lax',
      'Path=/',
      'Max-Age=28800'
    ];

    if (process.env.NODE_ENV === 'production') {
      atributos.push('Secure');
    }

    res.setHeader('Set-Cookie', atributos.join('; '));
    res.setHeader('Cache-Control', 'no-store');

    return res.status(200).json({
      mensagem: 'Login realizado com sucesso!',
      usuario: {
        cpf: cliente.cpf,
        nome: cliente.nome,
        cargo: 'CLIENTE'
      }
    });

  } catch (erro) {
    console.error('Erro no login do cliente:', erro.message);

    return res.status(500).json({
      erro: 'Não foi possível realizar o login.'
    });
  }
};
