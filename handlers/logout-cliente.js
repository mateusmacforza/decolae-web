
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido.' });
  }

  res.setHeader(
    'Set-Cookie',
    'decolae_cliente=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0' +
    (process.env.NODE_ENV === 'production' ? '; Secure' : '')
  );

  return res.status(200).json({ mensagem: 'Logout realizado.' });
};
