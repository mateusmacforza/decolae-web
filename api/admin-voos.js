
if (!process.env.DATABASE_URL &&
    process.env.NODE_ENV !== 'production') {
  process.loadEnvFile('.env.local');
}

const { Pool } = require('pg');
const { autorizar } = require('../lib/autorizar');
try {
  const url = new URL(process.env.DATABASE_URL);

  console.log('Diagnóstico PostgreSQL:', {
    protocolo: url.protocol,
    host: url.hostname,
    banco: url.pathname,
    usaNeon: url.hostname.endsWith('.neon.tech')
  });
} catch (erro) {
  console.error('DATABASE_URL inválida ou ausente:', erro.message);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 3,
  connectionTimeoutMillis: 10000
});

function validar(corpo) {
  const codigo_voo = Number(corpo.codigo_voo);
  const codigo_rota = Number(corpo.codigo_rota);

  const numero_serie_aeronave = String(
    corpo.numero_serie_aeronave ?? ''
  ).trim();

  const cpf_administrador = String(
    corpo.cpf_administrador ?? ''
  ).trim();

  const cpf_piloto = String(
    corpo.cpf_piloto ?? ''
  ).trim();

  const cpf_copiloto = String(
    corpo.cpf_copiloto ?? ''
  ).trim();

  function validarData(valor) {
    const texto = String(valor ?? '').trim();

    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(texto)) {
      return null;
    }

    const [data, horario] = texto.split('T');
    const [ano, mes, dia] = data.split('-').map(Number);
    const [hora, minuto] = horario.split(':').map(Number);

    const verificacao = new Date(Date.UTC(
      ano, mes - 1, dia, hora, minuto
    ));

    if (
      verificacao.getUTCFullYear() !== ano ||
      verificacao.getUTCMonth() !== mes - 1 ||
      verificacao.getUTCDate() !== dia ||
      verificacao.getUTCHours() !== hora ||
      verificacao.getUTCMinutes() !== minuto
    ) {
      return null;
    }

    return texto.replace('T', ' ');
  }

  const d_h_partida = validarData(corpo.d_h_partida);
  const d_h_chegada = validarData(corpo.d_h_chegada);

  if (
    !Number.isSafeInteger(codigo_voo) ||
    codigo_voo <= 0 ||
    codigo_voo > 2147483647 ||
    !Number.isSafeInteger(codigo_rota) ||
    codigo_rota <= 0 ||
    !numero_serie_aeronave ||
    !d_h_partida ||
    !d_h_chegada ||
    d_h_chegada <= d_h_partida ||
    !/^\d{11}$/.test(cpf_administrador) ||
    !/^\d{11}$/.test(cpf_piloto) ||
    !/^\d{11}$/.test(cpf_copiloto) ||
    cpf_administrador === cpf_piloto ||
    cpf_administrador === cpf_copiloto ||
    cpf_piloto === cpf_copiloto
  ) {
    return null;
  }

  return {
    codigo_voo,
    d_h_partida,
    d_h_chegada,
    codigo_rota,
    numero_serie_aeronave,
    cpf_administrador,
    cpf_piloto,
    cpf_copiloto
  };
}

module.exports = async function handler(req, res) {
    if (['GET', 'POST', 'PUT', 'DELETE'].includes(req.method)) {
  const permitido = await autorizar(req, res, pool, ['ADMINISTRADOR']);
  if (!permitido) return;
}

  // GET - Consultar voos
  if (req.method === 'GET') {
    try {
      
const resultado = await pool.query(`
  SELECT
    v.codigo_voo,
    to_char(v.d_h_partida, 'YYYY-MM-DD"T"HH24:MI')
      AS d_h_partida,
    to_char(v.d_h_chegada, 'YYYY-MM-DD"T"HH24:MI')
      AS d_h_chegada,
    v.codigo_rota,
    v.numero_serie_aeronave,
    TRIM(v.cpf_administrador) AS cpf_administrador,
    TRIM(v.cpf_piloto) AS cpf_piloto,
    TRIM(v.cpf_copiloto) AS cpf_copiloto,
    COALESCE(
      (
        SELECT array_agg(
          TRIM(ec.cpf_comissario)
          ORDER BY TRIM(ec.cpf_comissario)
        )
        FROM escala_comissario ec
        WHERE ec.codigo_voo = v.codigo_voo
      ),
      ARRAY[]::text[]
    ) AS comissarios
  FROM voo v
  ORDER BY v.codigo_voo
`);


      return res.status(200).json(resultado.rows);

    } catch (erro) {
      console.error('Erro ao listar voos:', erro.message);

      return res.status(500).json({
        erro: 'Não foi possível consultar os voos.'
      });
    }
  }

  // POST e PUT - Cadastrar ou editar voos
  
  // POST e PUT - Salvar voo e comissários em uma transação
  if (req.method === 'POST' || req.method === 'PUT') {
    let client;

    try {
      const corpo = typeof req.body === 'string'
        ? JSON.parse(req.body)
        : req.body || {};

      const dados = validar(corpo);

      const comissarios = Array.isArray(corpo.comissarios)
        ? corpo.comissarios.map(cpf => String(cpf).trim())
        : [];

      if (!dados) {
        return res.status(400).json({
          erro: 'Dados do voo inválidos.'
        });
      }

      // Regra do projeto: entre 2 e 4 comissários
      if (
        comissarios.length < 2 ||
        comissarios.length > 4 ||
        new Set(comissarios).size !== comissarios.length ||
        comissarios.some(cpf => !/^\d{11}$/.test(cpf))
      ) {
        return res.status(400).json({
          erro: 'Selecione de 2 a 4 comissários diferentes.'
        });
      }

      const equipe = [
        dados.cpf_administrador,
        dados.cpf_piloto,
        dados.cpf_copiloto,
        ...comissarios
      ];

      if (new Set(equipe).size !== equipe.length) {
        return res.status(400).json({
          erro: 'Um funcionário não pode ocupar duas funções no mesmo voo.'
        });
      }

      const valores = [
        dados.codigo_voo,
        dados.d_h_partida,
        dados.d_h_chegada,
        dados.codigo_rota,
        dados.numero_serie_aeronave,
        dados.cpf_administrador,
        dados.cpf_piloto,
        dados.cpf_copiloto
      ];

      client = await pool.connect();
      await client.query('BEGIN');

      // Serializa os cadastros e edições de voos
      await client.query(`
        SELECT pg_advisory_xact_lock(2026, 105)
      `);


      // Validar existência e cargo de todos os funcionários
      const funcionarios = await client.query(`
        SELECT TRIM(cpf) AS cpf, tipo_funcionario
        FROM funcionario
        WHERE TRIM(cpf) = ANY($1::text[])
      `, [equipe]);

      const cargos = new Map(
        funcionarios.rows.map(f => [f.cpf, f.tipo_funcionario])
      );

      const cargosCorretos =
        cargos.get(dados.cpf_administrador) === 'ADMINISTRADOR' &&
        cargos.get(dados.cpf_piloto) === 'PILOTO' &&
        cargos.get(dados.cpf_copiloto) === 'COPILOTO' &&
        comissarios.every(cpf => cargos.get(cpf) === 'COMISSARIO');

      if (!cargosCorretos) {
        await client.query('ROLLBACK');

        return res.status(400).json({
          erro: 'Confira os cargos do administrador, piloto, copiloto e comissários.'
        });
      }

      // Impedir aeronave em voos com horários sobrepostos
      const conflitoAeronave = await client.query(`
        SELECT codigo_voo
        FROM voo
        WHERE numero_serie_aeronave = $1
          AND codigo_voo <> $4
          AND d_h_partida < $3::timestamp
          AND d_h_chegada > $2::timestamp
        LIMIT 1
      `, [
        dados.numero_serie_aeronave,
        dados.d_h_partida,
        dados.d_h_chegada,
        dados.codigo_voo
      ]);

      if (conflitoAeronave.rowCount > 0) {
        await client.query('ROLLBACK');

        return res.status(409).json({
          erro: 'Conflito: aeronave já utilizada no voo ' +
            conflitoAeronave.rows[0].codigo_voo + '.'
        });
      }

      let resultado;

      // Impedir sobreposição e exigir 36h de descanso
      const conflitoEquipe = await client.query(`
        SELECT DISTINCT v.codigo_voo
        FROM voo v
        WHERE v.codigo_voo <> $1
          AND v.d_h_partida <
              $3::timestamp + INTERVAL '36 hours'
          AND v.d_h_chegada >
              $2::timestamp - INTERVAL '36 hours'
          AND (
            TRIM(v.cpf_piloto) = ANY($4::text[])
            OR TRIM(v.cpf_copiloto) = ANY($4::text[])
            OR EXISTS (
              SELECT 1
              FROM escala_comissario ec
              WHERE ec.codigo_voo = v.codigo_voo
                AND TRIM(ec.cpf_comissario) =
                    ANY($4::text[])
            )
          )
        LIMIT 1
      `, [
        dados.codigo_voo,
        dados.d_h_partida,
        dados.d_h_chegada,
        equipe
      ]);

      if (conflitoEquipe.rowCount > 0) {
        await client.query('ROLLBACK');

        return res.status(409).json({
          erro: 'Conflito de tripulação ou descanso de 36h com o voo ' +
            conflitoEquipe.rows[0].codigo_voo + '.'
        });
      }


      if (req.method === 'POST') {
        resultado = await client.query(`
          INSERT INTO voo (
            codigo_voo,
            d_h_partida,
            d_h_chegada,
            codigo_rota,
            numero_serie_aeronave,
            cpf_administrador,
            cpf_piloto,
            cpf_copiloto
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING codigo_voo
        `, valores);

      } else {
        // Bloqueia o voo durante a atualização
        const existente = await client.query(`
          SELECT codigo_voo
          FROM voo
          WHERE codigo_voo = $1
          FOR UPDATE
        `, [dados.codigo_voo]);

        if (existente.rowCount === 0) {
          await client.query('ROLLBACK');

          return res.status(404).json({
            erro: 'Voo não encontrado.'
          });
        }

        resultado = await client.query(`
          UPDATE voo
          SET d_h_partida = $2,
              d_h_chegada = $3,
              codigo_rota = $4,
              numero_serie_aeronave = $5,
              cpf_administrador = $6,
              cpf_piloto = $7,
              cpf_copiloto = $8
          WHERE codigo_voo = $1
          RETURNING codigo_voo
        `, valores);

        // Remove a escala anterior para substituí-la
        await client.query(`
          DELETE FROM escala_comissario
          WHERE codigo_voo = $1
        `, [dados.codigo_voo]);
      }

      // Cadastrar a nova escala
      for (const cpf of comissarios) {
        await client.query(`
          INSERT INTO escala_comissario (
            codigo_voo,
            cpf_comissario
          )
          VALUES ($1, $2)
        `, [dados.codigo_voo, cpf]);
      }

      await client.query('COMMIT');

      return res.status(req.method === 'POST' ? 201 : 200).json({
        mensagem: req.method === 'POST'
          ? 'Voo e escala cadastrados com sucesso!'
          : 'Voo e escala atualizados com sucesso!',
        codigo_voo: resultado.rows[0].codigo_voo,
        comissarios
      });

    } catch (erro) {
      if (client) {
        await client.query('ROLLBACK').catch(() => {});
      }

      if (erro.code === '23505') {
        return res.status(409).json({
          erro: 'Já existe um registro com essa identificação.'
        });
      }

      if (erro.code === '23503') {
        return res.status(409).json({
          erro: 'Rota, aeronave ou funcionário não encontrado.'
        });
      }

      if (erro.code === '23514') {
        return res.status(400).json({
          erro: 'Uma regra do banco foi violada.'
        });
      }

      console.error('Erro ao salvar voo:', erro.message);

      return res.status(500).json({
        erro: 'Não foi possível salvar o voo e sua escala.'
      });

    } finally {
      if (client) client.release();
    }
  }


  // DELETE - Excluir voo
  
  // DELETE - Remover escala e voo na mesma transação
  if (req.method === 'DELETE') {
    let client;

    try {
      const corpo = typeof req.body === 'string'
        ? JSON.parse(req.body)
        : req.body || {};

      const codigo = Number(corpo.codigo_voo);

      if (
        !Number.isSafeInteger(codigo) ||
        codigo <= 0 ||
        codigo > 2147483647
      ) {
        return res.status(400).json({
          erro: 'Código de voo inválido.'
        });
      }

      client = await pool.connect();
      await client.query('BEGIN');

      // Bloquear o registro do voo durante a exclusão
      const voo = await client.query(`
        SELECT codigo_voo
        FROM voo
        WHERE codigo_voo = $1
        FOR UPDATE
      `, [codigo]);

      if (voo.rowCount === 0) {
        await client.query('ROLLBACK');

        return res.status(404).json({
          erro: 'Voo não encontrado.'
        });
      }

      // Não excluir voos que possuem passagens vendidas
      const passagens = await client.query(`
        SELECT 1
        FROM passagem
        WHERE codigo_voo = $1
        LIMIT 1
      `, [codigo]);

      if (passagens.rowCount > 0) {
        await client.query('ROLLBACK');

        return res.status(409).json({
          erro: 'Este voo possui passagens vendidas e não pode ser removido.'
        });
      }

      // Remover primeiro os comissários vinculados
      await client.query(`
        DELETE FROM escala_comissario
        WHERE codigo_voo = $1
      `, [codigo]);

      // Depois remover o voo
      await client.query(`
        DELETE FROM voo
        WHERE codigo_voo = $1
      `, [codigo]);

      await client.query('COMMIT');

      return res.status(200).json({
        mensagem: 'Voo e escala removidos com sucesso!'
      });

    } catch (erro) {
      if (client) {
        await client.query('ROLLBACK').catch(() => {});
      }

      if (erro.code === '23503') {
        return res.status(409).json({
          erro: 'O voo possui outros registros vinculados.'
        });
      }

      console.error('Erro ao excluir voo:', erro.message);

      return res.status(500).json({
        erro: 'Não foi possível excluir o voo.'
      });

    } finally {
      if (client) client.release();
    }
  }

};
