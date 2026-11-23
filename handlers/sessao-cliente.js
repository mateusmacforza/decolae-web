
if (process.env.NODE_ENV !== 'production' &&
    (!process.env.DATABASE_URL || !process.env.SESSION_SECRET)) {
  process.loadEnvFile('.env.local');
}

const { Pool } = require('pg');
const { verificarToken } = require('../lib/sessao');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 3
});

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') {
    return res.status(405).json({ erro: 'Método não permitido.' });
  }

  const cookie = String(req.headers.cookie || '')
    .split(';')
    .map(x => x.trim())
    .find(x => x.startsWith('decolae_cliente='));

  const token = cookie?.slice('decolae_cliente='.length);
  const sessao = token ? verificarToken(token) : null;

  if (!sessao) {
    return res.status(401).json({ erro: 'Faça login como cliente.' });
  }

  try {
    const resultado = await pool.query(`
      SELECT TRIM(c.cpf) AS cpf, c.nome
      FROM cliente c
      JOIN cliente_acesso ca ON ca.cpf_cliente = c.cpf
      WHERE c.cpf = $1 AND ca.ativo = TRUE
    `, [sessao.cpf]);

    if (!resultado.rows.length) {
      return res.status(401).json({ erro: 'Conta inativa.' });
    }

    return res.status(200).json({
      usuario: { ...resultado.rows[0], cargo: 'CLIENTE' }
    });
  } catch (erro) {
    console.error(erro.message);
    return res.status(500).json({ erro: 'Erro ao consultar sessão.' });
  }
};
