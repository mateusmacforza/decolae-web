
if (!process.env.DATABASE_URL && process.env.NODE_ENV !== 'production') {
  process.loadEnvFile('.env.local');
}

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 3,
  connectionTimeoutMillis: 10000
});

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      erro: 'Método não permitido.'
    });
  }

  try {
    const resultado = await pool.query(`
      SELECT cpf, nome
      FROM cliente
      ORDER BY nome
    `);

    return res.status(200).json(resultado.rows);

  } catch (erro) {
    console.error('Erro ao consultar clientes:', erro.message);

    return res.status(500).json({
      erro: 'Não foi possível consultar os clientes.'
    });
  }
};
