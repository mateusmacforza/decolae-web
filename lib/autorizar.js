
const { NOME_COOKIE, verificarToken } = require('./sessao');

async function autorizar(req, res, pool, cargosPermitidos) {
  const cookies = String(req.headers.cookie || '')
    .split(';')
    .map(item => item.trim());

  const cookie = cookies.find(item =>
    item.startsWith(NOME_COOKIE + '=')
  );

  const token = cookie
    ? cookie.slice(NOME_COOKIE.length + 1)
    : null;

  if (!token) {
    res.status(401).json({
      erro: 'É necessário fazer login.'
    });
    return false;
  }

  let sessao;

  try {
    sessao = verificarToken(token);
  } catch {
    sessao = null;
  }

  if (!sessao) {
    res.status(401).json({
      erro: 'Sessão inválida ou expirada.'
    });
    return false;
  }

  try {
    const resultado = await pool.query(`
      SELECT f.tipo_funcionario
      FROM usuario_acesso ua
      JOIN funcionario f
        ON f.cpf = ua.cpf_funcionario
      WHERE ua.cpf_funcionario = $1
        AND ua.ativo = TRUE
    `, [sessao.cpf]);

    const cargo = resultado.rows[0]?.tipo_funcionario;

    if (!cargo) {
      res.status(401).json({
        erro: 'Conta inexistente ou desativada.'
      });
      return false;
    }

    if (!cargosPermitidos.includes(cargo)) {
      res.status(403).json({
        erro: 'Você não tem permissão para esta operação.'
      });
      return false;
    }

    return true;

  } catch (erro) {
    console.error('Erro ao verificar autorização:', erro.message);

    res.status(500).json({
      erro: 'Não foi possível verificar as permissões.'
    });

    return false;
  }
}

module.exports = { autorizar };
