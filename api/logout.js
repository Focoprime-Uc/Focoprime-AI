export default function handler(req, res) {
  res.setHeader(
    "Set-Cookie",
    "focoprime_session=; Path=/; Max-Age=0"
  );

  res.status(200).json({ success: true });
}
