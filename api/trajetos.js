
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

function validar(dados) {
  const codigo_rota = Number(dados.codigo_rota);
  const aeroporto_partida = String(
    dados.aeroporto_partida || ''
  ).trim();
  const aeroporto_chegada = String(
    dados.aeroporto_chegada || ''
  ).trim();
  const hora_partida = String(dados.hora_partida || '').trim();
  const hora_chegada = String(dados.hora_chegada || '').trim();

  const distancia = dados.distancia === '' ||
    dados.distancia == null
    ? null
    : Number(dados.distancia);

  const cpf_gerente = String(dados.cpf_gerente || '').trim() || null;

  const horarioValido = (hora) => {
    const partes = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(hora);
    return partes !== null &&
      Number(partes[1]) <= 23 &&
      Number(partes[2]) <= 59 &&
      (partes[3] === undefined || Number(partes[3]) <= 59);
  };

  if (
    !Number.isSafeInteger(codigo_rota) ||
    codigo_rota <= 0 ||
    codigo_rota > 2147483647 ||
    !aeroporto_partida ||
    !aeroporto_chegada ||
    aeroporto_partida === aeroporto_chegada ||
    !horarioValido(hora_partida) ||
    !horarioValido(hora_chegada) ||
    (distancia !== null &&
      (!Number.isFinite(distancia) || distancia <= 0)) ||
    (cpf_gerente !== null && !/^\d{11}$/.test(cpf_gerente))
  ) {
    return null;
  }

  return {
    codigo_rota,
    aeroporto_partida,
    aeroporto_chegada,
    hora_partida,
    hora_chegada,
    distancia,
    cpf_gerente
  };
}

module.exports = async function handler(req, res) {
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
  const permitido = await autorizar(req, res, pool, ['GERENTE']);
  if (!permitido) return;
}
  // GET - Listar trajetos
  if (req.method === 'GET') {
    try {
      const resultado = await pool.query(`
        SELECT
          codigo_rota,
          aeroporto_partida,
          aeroporto_chegada,
          hora_partida,
          hora_chegada,
          distancia,
          cpf_gerente
        FROM trajeto
        ORDER BY codigo_rota
      `);

      return res.status(200).json(resultado.rows);
    } catch (erro) {
      console.error('Erro ao listar trajetos:', erro.message);
      return res.status(500).json({
        erro: 'Não foi possível consultar os trajetos.'
      });
    }
  }

  // POST e PUT - Cadastrar ou editar
  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      const corpo = typeof req.body === 'string'
        ? JSON.parse(req.body)
        : req.body || {};

      const dados = validar(corpo);

      if (!dados) {
        return res.status(400).json({
          erro: 'Dados do trajeto inválidos.'
        });
      }

      const valores = [
        dados.codigo_rota,
        dados.aeroporto_partida,
        dados.aeroporto_chegada,
        dados.hora_partida,
        dados.hora_chegada,
        dados.distancia,
        dados.cpf_gerente
      ];

      let resultado;

      if (req.method === 'POST') {
        resultado = await pool.query(`
          INSERT INTO trajeto (
            codigo_rota,
            aeroporto_partida,
            aeroporto_chegada,
            hora_partida,
            hora_chegada,
            distancia,
            cpf_gerente
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING *
        `, valores);
      } else {
        resultado = await pool.query(`
          UPDATE trajeto
          SET aeroporto_partida = $2,
              aeroporto_chegada = $3,
              hora_partida = $4,
              hora_chegada = $5,
              distancia = $6,
              cpf_gerente = $7
          WHERE codigo_rota = $1
          RETURNING *
        `, valores);

        if (resultado.rowCount === 0) {
          return res.status(404).json({
            erro: 'Trajeto não encontrado.'
          });
        }
      }

      return res.status(req.method === 'POST' ? 201 : 200).json({
        mensagem: req.method === 'POST'
          ? 'Trajeto cadastrado com sucesso!'
          : 'Trajeto atualizado com sucesso!',
        trajeto: resultado.rows[0]
      });

    } catch (erro) {
      if (erro.code === '23505') {
        return res.status(409).json({
          erro: 'Já existe um trajeto com esse código.'
        });
      }

      if (erro.code === '23503') {
        return res.status(409).json({
          erro: 'Aeroporto ou gerente informado não existe no banco.'
        });
      }

      console.error('Erro ao salvar trajeto:', erro.message);
      return res.status(500).json({
        erro: 'Não foi possível salvar o trajeto.'
      });
    }
  }

  // DELETE - Remover trajeto
  if (req.method === 'DELETE') {
    try {
      const corpo = typeof req.body === 'string'
        ? JSON.parse(req.body)
        : req.body || {};

      const codigo = Number(corpo.codigo_rota);

      if (!Number.isSafeInteger(codigo) || codigo <= 0) {
        return res.status(400).json({
          erro: 'Código de trajeto inválido.'
        });
      }

      const resultado = await pool.query(`
        DELETE FROM trajeto
        WHERE codigo_rota = $1
        RETURNING codigo_rota
      `, [codigo]);

      if (resultado.rowCount === 0) {
        return res.status(404).json({
          erro: 'Trajeto não encontrado.'
        });
      }

      return res.status(200).json({
        mensagem: 'Trajeto removido com sucesso!'
      });

    } catch (erro) {
      if (erro.code === '23503') {
        return res.status(409).json({
          erro: 'Este trajeto está vinculado a voos e não pode ser removido.'
        });
      }

      console.error('Erro ao remover trajeto:', erro.message);
      return res.status(500).json({
        erro: 'Não foi possível remover o trajeto.'
      });
    }
  }

  return res.status(405).json({
    erro: 'Método não permitido.'
  });
};
