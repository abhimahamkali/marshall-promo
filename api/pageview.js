module.exports = (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }
  console.log('marshall pageview:', JSON.stringify(req.body));
  res.status(200).json({ ok: true });
};
