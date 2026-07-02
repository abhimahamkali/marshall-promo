const BASE_ID = 'appk6C18dNxzJvss7';
const TABLE_ID = 'tblco5qGhwJ7zePbo'; // Leads

async function airtable(path, opts) {
  return fetch(`https://api.airtable.com/v0/${BASE_ID}${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`,
      'Content-Type': 'application/json',
      ...(opts && opts.headers),
    },
  });
}

function esc(s) {
  return String(s).replace(/'/g, "\\'");
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }
  if (!process.env.AIRTABLE_TOKEN) {
    console.error('AIRTABLE_TOKEN not set');
    res.status(500).json({ error: 'server not configured' });
    return;
  }

  const lead = req.body || {};
  const ownerName = (lead.ownerName || '').trim();
  const dogName = (lead.dogName || '').trim();

  try {
    const formula = `AND({Owner Name}='${esc(ownerName)}',{Dog Name}='${esc(dogName)}')`;
    const checkRes = await airtable(`/${TABLE_ID}?filterByFormula=${encodeURIComponent(formula)}&maxRecords=1`);
    const checkData = await checkRes.json();
    if (checkData.records && checkData.records.length > 0) {
      res.status(200).json({ duplicate: true });
      return;
    }

    const createRes = await airtable(`/${TABLE_ID}`, {
      method: 'POST',
      body: JSON.stringify({
        typecast: true,
        fields: {
          'Owner Name': ownerName,
          'Dog Name': dogName,
          WhatsApp: lead.phone || '',
          Breed: lead.breed || '',
          Age: lead.age || '',
          'Weight (kg)': lead.weight || '',
          'Activity Level': lead.activityLevel || '',
          Outlet: lead.outlet || 'Marshall',
          Source: lead.source || 'table',
          Consent: !!lead.consent,
          'Submitted At': new Date().toISOString(),
          Partner: 'Marshall',
        },
      }),
    });

    if (!createRes.ok) {
      const errText = await createRes.text();
      console.error('Airtable create failed', createRes.status, errText);
      res.status(502).json({ error: 'airtable write failed' });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('submit error:', err);
    res.status(500).json({ error: 'unexpected error' });
  }
};
