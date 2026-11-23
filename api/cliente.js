
const rotas = {
  login: require('../handlers/login-cliente'),
  cadastro: require('../handlers/cadastro-cliente'),
  sessao: require('../handlers/sessao-cliente'),
  logout: require('../handlers/logout-cliente')
};

module.exports = async function handler(req, res) {
  const acao = req.query.acao;
  const executar = typeof acao === 'string'
    ? rotas[acao]
    : null;

  if (!executar) {
    return res.status(404).json({
      erro: 'Rota não encontrada.'
    });
  }

  return executar(req, res);
};
