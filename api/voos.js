
if (process.env.NODE_ENV !== 'production') {
  process.loadEnvFile('.env.local');
}

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 3,
  connectionTimeoutMillis: 10000
});

console.log(
  'DATABASE_URL disponível na API:',
  Boolean(process.env.DATABASE_URL)
);



module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      erro: 'Método não permitido'
    });
  }

  try {
    const resultado = await pool.query(`
      SELECT
        v.codigo_voo,
        v.d_h_partida,
        v.d_h_chegada,
        t.aeroporto_partida AS origem,
        t.aeroporto_chegada AS destino,
        a.modelo AS aeronave,
        a.qtd_assentos AS capacidade,
        COUNT(p.codigo_reserva)::int AS vendidos,
        (
          a.qtd_assentos - COUNT(p.codigo_reserva)
        )::int AS disponiveis
      FROM voo v
      JOIN trajeto t
        ON v.codigo_rota = t.codigo_rota
      JOIN aeronave a
        ON v.numero_serie_aeronave = a.numero_serie
      LEFT JOIN passagem p
        ON v.codigo_voo = p.codigo_voo
      GROUP BY
        v.codigo_voo,
        v.d_h_partida,
        v.d_h_chegada,
        t.aeroporto_partida,
        t.aeroporto_chegada,
        a.modelo,
        a.qtd_assentos
      ORDER BY v.d_h_partida
    `);

    return res.status(200).json(resultado.rows);

  } catch (erro) {
    console.error('Erro ao consultar voos:', erro.message);

    return res.status(500).json({
      erro: 'Não foi possível consultar os voos.'
    });
  }
};
