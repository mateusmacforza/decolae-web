
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

const cargos = [
  'ADMINISTRADOR',
  'COMISSARIO',
  'COPILOTO',
  'GERENTE',
  'PILOTO'
];

function validar(corpo) {
  const cpf = String(corpo.cpf ?? '').trim();
  const nome = String(corpo.nome ?? '').trim();
  const data = String(corpo.data_nascimento ?? '').slice(0, 10);

  const genero = String(corpo.genero ?? '').trim() || null;
  const rua = String(corpo.rua ?? '').trim() || null;
  const bairro = String(corpo.bairro ?? '').trim() || null;
  const cidade = String(corpo.cidade ?? '').trim() || null;
  const tipo = String(corpo.tipo_funcionario ?? '')
    .trim()
    .toUpperCase() || null;

  const numero = corpo.numero === '' ||
    corpo.numero === null ||
    corpo.numero === undefined
    ? null
    : Number(corpo.numero);

  const formatoValido = /^\d{4}-\d{2}-\d{2}$/.test(data);
  const dataValida = formatoValido &&
    !Number.isNaN(Date.parse(data)) &&
    new Date(data + 'T00:00:00Z')
      .toISOString().slice(0, 10) === data;

  if (
    !/^\d{11}$/.test(cpf) ||
    !nome ||
    !dataValida ||
    (numero !== null &&
      (!Number.isSafeInteger(numero) || numero < 0)) ||
    (tipo !== null && !cargos.includes(tipo))
  ) {
    return null;
  }

  return {
    cpf, nome, genero, data_nascimento: data,
    rua, numero, bairro, cidade,
    tipo_funcionario: tipo
  };
}

module.exports = async function handler(req, res) {

  // GET: gerente e administrador podem consultar
  if (req.method === 'GET') {
    const permitido = await autorizar(
      req, res, pool, ['GERENTE', 'ADMINISTRADOR']
    );
    if (!permitido) return;
  }

  // Somente gerente pode cadastrar, editar ou excluir
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    const permitido = await autorizar(
      req, res, pool, ['GERENTE']
    );
    if (!permitido) return;
  }

  // GET - Consultar funcionários
  if (req.method === 'GET') {
    try {
      const resultado = await pool.query(`
        SELECT
          cpf,
          nome,
          genero,
          data_nascimento::text AS data_nascimento,
          rua,
          numero,
          bairro,
          cidade,
          tipo_funcionario
        FROM funcionario
        ORDER BY nome, cpf
      `);

      return res.status(200).json(resultado.rows);
    } catch (erro) {
      console.error('Erro ao consultar funcionários:', erro.message);
      return res.status(500).json({
        erro: 'Não foi possível consultar funcionários.'
      });
    }
  }

  // POST e PUT - Cadastrar ou atualizar
  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      const corpo = typeof req.body === 'string'
        ? JSON.parse(req.body)
        : req.body || {};

      const dados = validar(corpo);

      if (!dados) {
        return res.status(400).json({
          erro: 'Confira CPF, nome, nascimento, número e cargo.'
        });
      }

      const valores = [
        dados.cpf,
        dados.nome,
        dados.genero,
        dados.data_nascimento,
        dados.rua,
        dados.numero,
        dados.bairro,
        dados.cidade,
        dados.tipo_funcionario
      ];

      let resultado;

      if (req.method === 'POST') {
        resultado = await pool.query(`
          INSERT INTO funcionario (
            cpf, nome, genero, data_nascimento,
            rua, numero, bairro, cidade, tipo_funcionario
          )
          VALUES (
            $1, $2, $3, $4, $5,
            $6, $7, $8, $9
          )
          RETURNING cpf
        `, valores);
      } else {
        resultado = await pool.query(`
          UPDATE funcionario
          SET nome = $2,
              genero = $3,
              data_nascimento = $4,
              rua = $5,
              numero = $6,
              bairro = $7,
              cidade = $8,
              tipo_funcionario = $9
          WHERE cpf = $1
          RETURNING cpf
        `, valores);

        if (resultado.rowCount === 0) {
          return res.status(404).json({
            erro: 'Funcionário não encontrado.'
          });
        }
      }

      return res.status(req.method === 'POST' ? 201 : 200)
        .json({
          mensagem: req.method === 'POST'
            ? 'Funcionário cadastrado com sucesso!'
            : 'Funcionário atualizado com sucesso!',
          cpf: resultado.rows[0].cpf.trim()
        });

    } catch (erro) {
      if (erro.code === '23505') {
        return res.status(409).json({
          erro: 'Já existe um funcionário com esse CPF.'
        });
      }

      if (erro.code === '23514') {
        return res.status(400).json({
          erro: 'Cargo não permitido pelo banco.'
        });
      }

      if (erro.code === '22001' || erro.code === '22003') {
        return res.status(400).json({
          erro: 'Um dos campos excede o tamanho permitido.'
        });
      }

      console.error('Erro ao salvar funcionário:', erro.message);
      return res.status(500).json({
        erro: 'Não foi possível salvar o funcionário.'
      });
    }
  }

  // DELETE - Excluir funcionário
  if (req.method === 'DELETE') {
    try {
      const corpo = typeof req.body === 'string'
        ? JSON.parse(req.body)
        : req.body || {};

      const cpf = String(corpo.cpf ?? '').trim();

      if (!/^\d{11}$/.test(cpf)) {
        return res.status(400).json({
          erro: 'CPF inválido.'
        });
      }

      const resultado = await pool.query(`
        DELETE FROM funcionario
        WHERE cpf = $1
        RETURNING cpf
      `, [cpf]);

      if (resultado.rowCount === 0) {
        return res.status(404).json({
          erro: 'Funcionário não encontrado.'
        });
      }

      return res.status(200).json({
        mensagem: 'Funcionário removido com sucesso!'
      });

    } catch (erro) {
      if (erro.code === '23503') {
        return res.status(409).json({
          erro: 'Este funcionário possui vínculos no banco e não pode ser removido.'
        });
      }

      console.error('Erro ao excluir funcionário:', erro.message);
      return res.status(500).json({
        erro: 'Não foi possível remover o funcionário.'
      });
    }
  }

  return res.status(405).json({
    erro: 'Método não permitido.'
  });
};
