const NETWORKS = {
  bibus: { name: 'Bibus', env: 'NOTION_DS_BIBUS', fallback: '36493645-8361-81d5-aa65-000bfc2254ec' },
  lemet: { name: 'TCRM / Le Met', env: 'NOTION_DS_LEMET', fallback: '36493645-8361-8151-8160-000bb2a95b4b' },
  yelo: { name: 'Yélo', env: 'NOTION_DS_YELO', fallback: '3b593645-8361-8001-9b66-000b6f3f55ab' },
  ocecars: { name: 'Océcars Transdev', env: 'NOTION_DS_OCECARS', fallback: '3c193645-8361-80f4-84d7-000b045752c6' },
  tfl: { name: 'TfL London', env: 'NOTION_DS_TFL', fallback: '37293645-8361-81c0-8ebd-000bb403afce' },
  qub: { name: 'QUB', env: 'NOTION_DS_QUB', fallback: 'b0c93645-8361-8253-b5c8-872462a4c678' },
};

const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
function textProperty(p) { if (!p) return ''; if (p.type === 'title') return p.title?.map(x => x.plain_text).join('') || ''; if (p.type === 'rich_text') return p.rich_text?.map(x => x.plain_text).join('') || ''; if (p.type === 'select') return p.select?.name || ''; if (p.type === 'date') return p.date?.start || ''; if (p.type === 'status') return p.status?.name || ''; return ''; }
function first(props, names) { const wanted = names.map(normalize); for (const [key, prop] of Object.entries(props || {})) if (wanted.includes(normalize(key))) { const value = textProperty(prop); if (value !== '') return value; } return ''; }
function linkProperty(p) { if (!p) return ''; if (p.type === 'url') return p.url || ''; if (p.type === 'rich_text') { const item = p.rich_text?.find(x => x.href || x.text?.link?.url); return item?.href || item?.text?.link?.url || ''; } return ''; }
function firstLink(props, names) { const wanted = names.map(normalize); for (const [key, prop] of Object.entries(props || {})) if (wanted.includes(normalize(key))) { const value = linkProperty(prop); if (value) return value; } return ''; }
function cover(page) { if (!page?.cover) return ''; if (page.cover.type === 'external') return page.cover.external?.url || ''; if (page.cover.type === 'file') return page.cover.file?.url || ''; return ''; }
function vehicle(page, id) { const p = page.properties || {}; const arrival = first(p, ["Date d'arrivée", "Date d'arrivee", "Arrivée sur le réseau", "Date d'arrivée sur le réseau", "Entrée sur le parc"]); const circulation = first(p, ['Mise en circulation', 'Date de mise en circulation']); return { id: page.id, network: id, networkName: NETWORKS[id].name, park: first(p, ['No de parc','No de Parc','Numéro de parc','Parc','Numéro','Fleet Number']) || '—', registration: first(p, ['Immatriculation','Registration Number']) || '—', brand: first(p, ['Constructeur','Marque']) || '—', model: first(p, ['Modèle','Modele','Body Make and Model']) || '—', type: first(p, ['Type','Type de véhicule','Bus ou Tramway','Bus Type']) || '—', arrivalDate: arrival, circulationDate: circulation, status: first(p, ['Statut TC Infos','Statut TC Info','Statut','État']) || 'En service', image: cover(page), notionUrl: page.url || '', tcInfosUrl: firstLink(p, ['TC Infos','Source TC Infos','Fiche détaillée TC Infos','Lien TC Infos','TC Infos URL']) } }
async function request(url, token, options = {}) { const r = await fetch(url, { ...options, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'Notion-Version': '2025-09-03', ...(options.headers || {}) } }); const body = await r.text(); let data = null; try { data = JSON.parse(body); } catch {} if (!r.ok) throw new Error(data?.message || body || `Notion ${r.status}`); return data; }
async function query(id, token) { let cursor = null; const pages = []; do { const data = await request(`https://api.notion.com/v1/data_sources/${id}/query`, token, { method: 'POST', body: JSON.stringify({ page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) }) }); pages.push(...(data.results || [])); cursor = data.has_more ? data.next_cursor : null; } while (cursor); return pages; }

export async function onRequestGet({ env }) {
  if (!env.NOTION_TOKEN) return new Response(JSON.stringify({ error: 'Notion is not configured.' }), { status: 503, headers: { 'content-type': 'application/json' } });
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); const results = [];
  for (const [id, config] of Object.entries(NETWORKS)) {
    const dataSourceId = env[config.env] || config.fallback; if (!dataSourceId) continue;
    try {
      const pages = await query(dataSourceId, env.NOTION_TOKEN);
      for (const page of pages) { const v = vehicle(page, id); const d = v.arrivalDate ? new Date(v.arrivalDate) : null; if (d && !Number.isNaN(d.getTime()) && d >= cutoff && d <= new Date()) results.push(v); }
    } catch (error) { console.error(`new-vehicles ${id}:`, error); }
  }
  results.sort((a, b) => String(b.arrivalDate).localeCompare(String(a.arrivalDate)));
  return new Response(JSON.stringify({ count: results.length, since: cutoff.toISOString(), vehicles: results }), { headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
}
