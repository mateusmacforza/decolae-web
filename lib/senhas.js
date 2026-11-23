
const {
  randomBytes,
  scrypt: scryptCallback,
  timingSafeEqual
} = require('node:crypto');

const { promisify } = require('node:util');

const scrypt = promisify(scryptCallback);

async function gerarHash(senha) {
  if (typeof senha !== 'string' || senha.length < 12) {
    throw new Error('A senha deve ter pelo menos 12 caracteres.');
  }

  const salt = randomBytes(16);
  const chave = await scrypt(senha, salt, 64);

  return [
    'scrypt',
    salt.toString('hex'),
    chave.toString('hex')
  ].join(':');
}

async function verificarSenha(senha, hashArmazenado) {
  if (typeof senha !== 'string' ||
      typeof hashArmazenado !== 'string') {
    return false;
  }

  const partes = hashArmazenado.split(':');

  if (
    partes.length !== 3 ||
    partes[0] !== 'scrypt' ||
    !/^[a-f0-9]{32}$/.test(partes[1]) ||
    !/^[a-f0-9]{128}$/.test(partes[2])
  ) {
    return false;
  }

  const salt = Buffer.from(partes[1], 'hex');
  const hashOriginal = Buffer.from(partes[2], 'hex');
  const hashCalculado = await scrypt(senha, salt, 64);

  return timingSafeEqual(hashOriginal, hashCalculado);
}

module.exports = {
  gerarHash,
  verificarSenha
};
