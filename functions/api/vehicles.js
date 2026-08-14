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
  if (p.type === 'checkbox') return p.checkbox ? 'Oui' : 'Non';
  return '';
}

function first(props, names) {
  for (const name of names) {
    if (props[name]) {
      const value = textProperty(props[name]);
      if (value !== '') return value;
    }
  }
  return '';
}

function imageProperty(p) {
  if (!p || p.type !== 'files') return '';
  const file = p.files?.[0];
  return file?.external?.url || file?.file?.url || '';
}

function normalize(page, network) {
  const p = page.properties || {};

  // TfL uses an English schema and stores the fleet number in "Fleet Number".
  if (network === 'tfl') {
    return {
      id: page.id,
      network,
      park: String(first(p, ['Fleet Number']) || '—'),
      registration: String(first(p, ['Registration Number']) || '—'),
      brand: String(first(p, ['Chassis Make and Model  ', 'Chassis Make and Model']) || '—'),
      model: String(first(p, ['Body Make and Model']) || '—'),
      type: String(first(p, ['Bus Type ', 'Bus Type']) || '—'),
      date: String(first(p, ['Registration date', 'Date de mise en circulation']) || ''),
      status: 'En service',
      image: imageProperty(p['Fichiers et médias']) || imageProperty(p['Photo de couverture']) || imageProperty(p['Photo']) || '',
    };
  }

  return {
    id: page.id,
    network,
    park: String(first(p, ['No de parc', 'Numéro de parc', 'Parc', 'Numéro']) || '—'),
    registration: String(first(p, ['Immatriculation', 'Immatriculation ']) || '—'),
    brand: String(first(p, ['Constructeur', 'Marque']) || '—'),
    model: String(first(p, ['Modèle', 'Modele']) || '—'),
    type: String(first(p, ['Bus ou Tramway', 'Type', 'Type de véhicule']) || '—'),
    date: String(first(p, ['Mise en circulation', 'Date de mise en circulation', "Date d'arrivée"]) || ''),
    status: String(first(p, ['Statut TC Infos', 'Statut', 'État']) || 'En service'),
    image: imageProperty(p['Photo de couverture']) || imageProperty(p['Photo']) || imageProperty(p['Fichiers et médias']) || '',
  };
}

async function queryDataSource(dataSourceId, token) {
  const result = [];
  let start_cursor;

  do {
    const response = await fetch(`https://api.notion.com/v1/data_sources/${dataSourceId}/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2025-09-03',
      },
      body: JSON.stringify({ page_size: 100, ...(start_cursor ? { start_cursor } : {}) }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(body || `Notion returned ${response.status}`);
    }

    const data = await response.json();
    result.push(...(data.results || []));
    start_cursor = data.has_more ? data.next_cursor : null;
  } while (start_cursor);

  return result;
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const network = url.searchParams.get('network') || '';
  const envName = NETWORK_KEYS[network];

  if (!envName) {
    return new Response(JSON.stringify({ error: 'Unknown network' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  const dataSourceId = env[envName];
  if (!dataSourceId || !env.NOTION_TOKEN) {
    return new Response(JSON.stringify({ error: 'Notion is not configured on Cloudflare yet.' }), {
      status: 503,
      headers: { 'content-type': 'application/json' },
    });
  }

  try {
    const pages = await queryDataSource(dataSourceId, env.NOTION_TOKEN);
    const vehicles = pages.map(page => normalize(page, network));
    vehicles.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    return new Response(JSON.stringify({
      network,
      count: vehicles.length,
      vehicles,
    }), {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Unable to read Notion',
      details: error instanceof Error ? error.message : String(error),
    }), {
      status: 502,
      headers: { 'content-type': 'application/json' },
    });
  }
}
