export default function handler(req, res) {
  res.json({ ok: true, cookiesSent: !!req.cookies.token })
}
