
if (
  process.env.NODE_ENV !== 'production' &&
  (!process.env.DATABASE_URL || !process.env.SESSION_SECRET)
) {
  process.loadEnvFile('.env.local');
}

const { Pool } = require('pg');
const { NOME_COOKIE, verificarToken } = require('../lib/sessao');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 3,
  connectionTimeoutMillis: 10000
});

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') {
    return res.status(405).json({
      erro: 'Método não permitido.'
    });
  }

  const cookies = String(req.headers.cookie || '')
    .split(';')
    .map(item => item.trim());

  const cookie = cookies.find(item =>
    item.startsWith(NOME_COOKIE + '=')
  );

  const token = cookie
    ? cookie.slice(NOME_COOKIE.length + 1)
    : null;

  let sessao;

  try {
    sessao = token ? verificarToken(token) : null;
  } catch {
    sessao = null;
  }

  if (!sessao) {
    return res.status(401).json({
      erro: 'Usuário não autenticado.'
    });
  }

  try {
    const resultado = await pool.query(`
      SELECT
        TRIM(f.cpf) AS cpf,
        f.nome,
        f.tipo_funcionario AS cargo
      FROM usuario_acesso ua
      JOIN funcionario f
        ON f.cpf = ua.cpf_funcionario
      WHERE ua.cpf_funcionario = $1
        AND ua.ativo = TRUE
        AND f.tipo_funcionario IN ('GERENTE', 'ADMINISTRADOR')
    `, [sessao.cpf]);

    if (resultado.rowCount === 0) {
      return res.status(401).json({
        erro: 'Conta inexistente ou desativada.'
      });
    }

    return res.status(200).json({
      autenticado: true,
      usuario: resultado.rows[0]
    });

  } catch (erro) {
    console.error('Erro ao consultar sessão:', erro.message);

    return res.status(500).json({
      erro: 'Não foi possível consultar a sessão.'
    });
  }
};
