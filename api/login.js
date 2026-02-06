export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { name } = req.body;

  if (!name || name.length < 2) {
    return res.status(400).json({ error: "Nome inválido" });
  }

  // Token simples (base64)
  const payload = {
    name,
    time: Date.now()
  };

  const token = Buffer.from(JSON.stringify(payload)).toString("base64");

  // Cookie seguro (real backend login)
  res.setHeader("Set-Cookie", [
    `focoprime_session=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict`
  ]);

  return res.status(200).json({ success: true, name });
}
