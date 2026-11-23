
const {
  createHmac,
  timingSafeEqual
} = require('node:crypto');

const NOME_COOKIE = 'decolae_session';
const DURACAO = 60 * 60 * 8; // 8 horas

function assinar(conteudo) {
  if (!process.env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET não configurada.');
  }

  return createHmac('sha256', process.env.SESSION_SECRET)
    .update(conteudo)
    .digest('base64url');
}

function criarToken(cpf) {
  const conteudo = Buffer.from(JSON.stringify({
    cpf,
    exp: Math.floor(Date.now() / 1000) + DURACAO
  })).toString('base64url');

  return `${conteudo}.${assinar(conteudo)}`;
}

function verificarToken(token) {
  if (typeof token !== 'string') return null;

  const partes = token.split('.');
  if (partes.length !== 2) return null;

  const [conteudo, assinatura] = partes;

  if (!conteudo || !/^[A-Za-z0-9_-]{43}$/.test(assinatura)) {
    return null;
  }

  const esperado = Buffer.from(assinar(conteudo));
  const recebido = Buffer.from(assinatura);

  if (
    esperado.length !== recebido.length ||
    !timingSafeEqual(esperado, recebido)
  ) {
    return null;
  }

  try {
    const dados = JSON.parse(
      Buffer.from(conteudo, 'base64url').toString('utf8')
    );

    if (
      !/^\d{11}$/.test(dados.cpf) ||
      !Number.isSafeInteger(dados.exp) ||
      dados.exp <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return dados;
  } catch {
    return null;
  }
}

function cookieSessao(token) {
  const atributos = [
    `${NOME_COOKIE}=${token}`,
    'HttpOnly',
    'SameSite=Lax',
    'Path=/',
    `Max-Age=${DURACAO}`
  ];

  if (process.env.NODE_ENV === 'production') {
    atributos.push('Secure');
  }

  return atributos.join('; ');
}

module.exports = {
  NOME_COOKIE,
  criarToken,
  verificarToken,
  cookieSessao
};
