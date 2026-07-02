// In-memory only — resets on cold start/redeploy until real storage is wired up.
const seen = new Set();

module.exports = (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }
  const lead = req.body || {};
  const key = (lead.ownerName || '').trim().toLowerCase() + '|' + (lead.dogName || '').trim().toLowerCase();
  if (seen.has(key)) {
    res.status(200).json({ duplicate: true });
    return;
  }
  seen.add(key);
  console.log('marshall lead:', JSON.stringify(lead));
  res.status(200).json({ ok: true });
};
