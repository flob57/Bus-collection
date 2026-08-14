const NETWORK_KEYS = {
  bibus: 'NOTION_DS_BIBUS',
  lemet: 'NOTION_DS_LEMET',
  yelo: 'NOTION_DS_YELO',
  tfl: 'NOTION_DS_TFL',
};

function textProperty(p) {
  if (!p) return '';
  if (p.type === 'title') return p.title?.map(x => x.plain_text).join('') || '';
  if (p.type === 'rich_text') return p.rich_text?.map(x => x.plain_text).join('') || '';
  if (p.type === 'select') return p.select?.name || '';
  if (p.type === 'status') return p.status?.name || '';
  if (p.type === 'number') return p.number ?? '';
  if (p.type === 'date') return p.date?.start || '';
  if (p.type === 'url') return p.url || '';
  return '';
}

function first(props, names) {
  for (const name of names) if (props[name]) return textProperty(props[name]);
  return '';
}

function imageProperty(p) {
  if (!p) return '';
  if (p.type === 'files') {
    const file = p.files?.[0];
    return file?.external?.url || file?.file?.url || '';
  }
  return '';
}

function normalize(page, network) {
  const p = page.properties || {};
  return {
    id: page.id,
    network,
    park: String(first(p, ['No de parc', 'Numéro de parc', 'Parc', 'Numéro']) || '—'),
    registration: String(first(p, ['Immatriculation', 'Immatriculation ']) || '—'),
    brand: String(first(p, ['Constructeur', 'Marque']) || '—'),
    model: String(first(p, ['Modèle', 'Modele']) || '—'),
    type: String(first(p, ['Bus ou Tramway', 'Type', 'Type de véhicule']) || '—'),
    date: String(first(p, ['Mise en circulation', 'Date de mise en circulation', "Date d'arrivée"]) || ''),
    status: String(first(p, ['Statut', 'État']) || 'En service'),
    image: imageProperty(p['Photo de couverture']) || imageProperty(p['Photo']) || '',
  };
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const network = url.searchParams.get('network') || '';
  const envName = NETWORK_KEYS[network];
  if (!envName) return new Response(JSON.stringify({ error: 'Unknown network' }), { status: 400, headers: { 'content-type': 'application/json' } });
  const dataSourceId = env[envName];
  if (!dataSourceId || !env.NOTION_TOKEN) return new Response(JSON.stringify({ error: 'Notion is not configured on Cloudflare yet.' }), { status: 503, headers: { 'content-type': 'application/json' } });

  const result = [];
  let start_cursor;
  do {
    const response = await fetch(`https://api.notion.com/v1/data_sources/${dataSourceId}/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.NOTION_TOKEN}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2025-09-03',
      },
      body: JSON.stringify({ page_size: 100, ...(start_cursor ? { start_cursor } : {}) }),
    });
    if (!response.ok) return new Response(JSON.stringify({ error: await response.text() }), { status: response.status, headers: { 'content-type': 'application/json' } });
    const data = await response.json();
    result.push(...(data.results || []).map(page => normalize(page, network)));
    start_cursor = data.has_more ? data.next_cursor : null;
  } while (start_cursor);

  result.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  return new Response(JSON.stringify({ network, vehicles: result }), { headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
}
