
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

  const codigo = Number(req.query.voo);

  if (!Number.isSafeInteger(codigo) || codigo <= 0) {
    return res.status(400).json({
      erro: 'Informe um código de voo válido.'
    });
  }

  try {
    const resultado = await pool.query(`
      SELECT
        v.codigo_voo,
        a.qtd_assentos AS capacidade,
        COALESCE(
          ARRAY_AGG(p.numero_assento ORDER BY p.numero_assento)
            FILTER (WHERE p.numero_assento IS NOT NULL),
          ARRAY[]::integer[]
        ) AS ocupados
      FROM voo v
      JOIN aeronave a
        ON a.numero_serie = v.numero_serie_aeronave
      LEFT JOIN passagem p
        ON p.codigo_voo = v.codigo_voo
      WHERE v.codigo_voo = $1
      GROUP BY v.codigo_voo, a.qtd_assentos
    `, [codigo]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        erro: 'Voo não encontrado.'
      });
    }

    const voo = resultado.rows[0];

    return res.status(200).json({
      codigo_voo: voo.codigo_voo,
      capacidade: voo.capacidade,
      ocupados: voo.ocupados,
      disponiveis: voo.capacidade - voo.ocupados.length
    });

  } catch (erro) {
    console.error('Erro ao consultar assentos:', erro.message);

    return res.status(500).json({
      erro: 'Não foi possível consultar os assentos.'
    });
  }
};
