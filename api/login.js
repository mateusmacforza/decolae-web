
if (
  process.env.NODE_ENV !== 'production' &&
  (!process.env.DATABASE_URL || !process.env.SESSION_SECRET)
) {
  process.loadEnvFile('.env.local');
}

const { Pool } = require('pg');
const { verificarSenha } = require('../lib/senhas');
const { criarToken, cookieSessao } = require('../lib/sessao');

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
        TRIM(f.cpf) AS cpf,
        f.nome,
        f.tipo_funcionario,
        ua.senha_hash
      FROM usuario_acesso ua
      JOIN funcionario f
        ON f.cpf = ua.cpf_funcionario
      WHERE ua.cpf_funcionario = $1
        AND ua.ativo = TRUE
        AND f.tipo_funcionario IN (
          'GERENTE', 'ADMINISTRADOR'
        )
    `, [cpf]);

    const usuario = resultado.rows[0];

    if (
      !usuario ||
      !(await verificarSenha(senha, usuario.senha_hash))
    ) {
      return res.status(401).json({
        erro: 'CPF ou senha incorretos.'
      });
    }

    const token = criarToken(usuario.cpf);

    res.setHeader('Set-Cookie', cookieSessao(token));
    res.setHeader('Cache-Control', 'no-store');

    return res.status(200).json({
      mensagem: 'Login realizado com sucesso!',
      usuario: {
        cpf: usuario.cpf,
        nome: usuario.nome,
        cargo: usuario.tipo_funcionario
      }
    });

  } catch (erro) {
    console.error('Erro no login:', erro.message);

    return res.status(500).json({
      erro: 'Não foi possível realizar o login.'
    });
  }
};
