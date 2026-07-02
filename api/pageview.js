const AIRTABLE_BASE_ID = 'appk6C18dNxzJvss7';
const AIRTABLE_TABLE  = 'Visits';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN || process.env.AIRTABLE_PAT;
  if (!AIRTABLE_TOKEN) {
    console.error('AIRTABLE_TOKEN not set');
    return res.status(200).json({ ok: false });
  }

  const { outlet, source } = req.body || {};
  const now = new Date();
  const date = now.toISOString().slice(0, 10);

  try {
    await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE)}`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          records: [{ fields: {
            'Timestamp': now.toISOString(),
            'Outlet':    outlet || 'Marshall',
            'Partner':   'Marshall',
            'Source':    source || 'direct',
            'Date':      date,
          }}],
        }),
      }
    );
  } catch (err) {
    console.error('pageview error:', err);
  }

  return res.status(200).json({ ok: true });
};
