
if (!process.env.DATABASE_URL &&
    process.env.NODE_ENV !== 'production') {
  process.loadEnvFile('.env.local');
}

const { Pool } = require('pg');
const { autorizar } = require('../lib/autorizar');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 3,
  connectionTimeoutMillis: 10000
});

module.exports = async function handler(req, res) {

  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    const permitido = await autorizar(
      req,
      res,
      pool,
      ['GERENTE']
    );

    if (!permitido) return;
  }

  // GET - Consultar aeronaves
  if (req.method === 'GET') {
    try {
      const resultado = await pool.query(`
        SELECT numero_serie, modelo, qtd_assentos
        FROM aeronave
        ORDER BY modelo, numero_serie
      `);

      return res.status(200).json(resultado.rows);

    } catch (erro) {
      console.error('Erro ao listar aeronaves:', erro.message);
      return res.status(500).json({
        erro: 'Erro ao consultar aeronaves.'
      });
    }
  }

  // POST - Cadastrar aeronave
  if (req.method === 'POST') {
    try {
      const dados = typeof req.body === 'string'
        ? JSON.parse(req.body)
        : req.body || {};

      const numeroSerie = String(dados.numero_serie || '').trim();
      const modelo = String(dados.modelo || '').trim();
      const capacidade = Number(dados.qtd_assentos);

      if (
        !numeroSerie ||
        numeroSerie.length > 30 ||
        !modelo ||
        !Number.isSafeInteger(capacidade) ||
        capacidade <= 0
      ) {
        return res.status(400).json({
          erro: 'Informe série, modelo e capacidade válidos.'
        });
      }

      const resultado = await pool.query(`
        INSERT INTO aeronave (
          numero_serie,
          modelo,
          qtd_assentos
        )
        VALUES ($1, $2, $3)
        RETURNING numero_serie, modelo, qtd_assentos
      `, [numeroSerie, modelo, capacidade]);

      return res.status(201).json({
        mensagem: 'Aeronave cadastrada com sucesso!',
        aeronave: resultado.rows[0]
      });

    } catch (erro) {
      if (erro.code === '23505') {
        return res.status(409).json({
          erro: 'Já existe uma aeronave com esse número de série.'
        });
      }

      console.error('Erro ao cadastrar aeronave:', erro.message);

      return res.status(500).json({
        erro: 'Não foi possível cadastrar a aeronave.'
      });
    }
  }

  // PUT - Atualizar aeronave
  if (req.method === 'PUT') {
    try {
      const dados = typeof req.body === 'string'
        ? JSON.parse(req.body)
        : req.body || {};

      const numeroSerie = String(dados.numero_serie || '').trim();
      const modelo = String(dados.modelo || '').trim();
      const capacidade = Number(dados.qtd_assentos);

      if (
        !numeroSerie ||
        numeroSerie.length > 30 ||
        !modelo ||
        modelo.length > 100 ||
        !Number.isSafeInteger(capacidade) ||
        capacidade <= 0
      ) {
        return res.status(400).json({
          erro: 'Dados da aeronave inválidos.'
        });
      }

      const resultado = await pool.query(`
        UPDATE aeronave AS a
        SET modelo = $2,
            qtd_assentos = $3
        WHERE a.numero_serie = $1
          AND NOT EXISTS (
            SELECT 1
            FROM voo v
            JOIN passagem p
              ON p.codigo_voo = v.codigo_voo
            WHERE v.numero_serie_aeronave = a.numero_serie
              AND p.numero_assento > $3
          )
        RETURNING numero_serie, modelo, qtd_assentos
      `, [numeroSerie, modelo, capacidade]);

      if (resultado.rowCount === 0) {
        const existe = await pool.query(
          'SELECT 1 FROM aeronave WHERE numero_serie = $1',
          [numeroSerie]
        );

        if (existe.rowCount === 0) {
          return res.status(404).json({
            erro: 'Aeronave não encontrada.'
          });
        }

        return res.status(409).json({
          erro: 'A capacidade não pode ser menor que um número de assento já vendido.'
        });
      }

      return res.status(200).json({
        mensagem: 'Aeronave atualizada com sucesso!',
        aeronave: resultado.rows[0]
      });

    } catch (erro) {
      console.error('Erro ao atualizar aeronave:', erro.message);

      return res.status(500).json({
        erro: 'Não foi possível atualizar a aeronave.'
      });
    }
  }

  // DELETE - Remover aeronave
  if (req.method === 'DELETE') {
    try {
      const dados = typeof req.body === 'string'
        ? JSON.parse(req.body)
        : req.body || {};

      const numeroSerie = String(
        dados.numero_serie || ''
      ).trim();

      if (!numeroSerie || numeroSerie.length > 30) {
        return res.status(400).json({
          erro: 'Informe um número de série válido.'
        });
      }

      const resultado = await pool.query(`
        DELETE FROM aeronave
        WHERE numero_serie = $1
        RETURNING numero_serie
      `, [numeroSerie]);

      if (resultado.rowCount === 0) {
        return res.status(404).json({
          erro: 'Aeronave não encontrada.'
        });
      }

      return res.status(200).json({
        mensagem: 'Aeronave removida com sucesso!'
      });

    } catch (erro) {
      if (erro.code === '23503') {
        return res.status(409).json({
          erro: 'Esta aeronave está vinculada a voos e não pode ser removida.'
        });
      }

      console.error('Erro ao remover aeronave:', erro.message);

      return res.status(500).json({
        erro: 'Não foi possível remover a aeronave.'
      });
    }
  }

  return res.status(405).json({
    erro: 'Método não permitido.'
  });
};
