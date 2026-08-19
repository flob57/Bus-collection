const NETWORK_KEYS = {
  bibus: 'NOTION_DS_BIBUS', lemet: 'NOTION_DS_LEMET', yelo: 'NOTION_DS_YELO', ocecars: 'NOTION_DS_OCECARS', tfl: 'NOTION_DS_TFL',
};
const DATA_SOURCE_FALLBACKS = {
  bibus: '36493645-8361-81d5-aa65-000bfc2254ec', lemet: '36493645-8361-8151-8160-000bb2a95b4b', yelo: '3b593645-8361-8001-9b66-000b6f3f55ab', ocecars: '3c193645-8361-80f4-84d7-000b045752c6', tfl: '37293645-8361-81c0-8ebd-000bb403afce',
};
const MAX_NOTION_REQUESTS_PER_INVOCATION = 45;

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
function first(props, names) { for (const name of names) { if (props[name]) { const value = textProperty(props[name]); if (value !== '') return value; } } return ''; }
function linkProperty(p) { if (!p) return ''; if (p.type === 'url') return p.url || ''; if (p.type === 'rich_text') { const item = p.rich_text?.find(x => x.href || x.text?.link?.url); return item?.href || item?.text?.link?.url || ''; } return ''; }
function firstLink(props, names) { for (const name of names) { const value = linkProperty(props[name]); if (value) return value; } return ''; }
function imageProperty(p) { if (!p || p.type !== 'files') return ''; const file = p.files?.[0]; return file?.external?.url || file?.file?.url || ''; }
function pageCover(page) { const cover = page?.cover; if (!cover) return ''; if (cover.type === 'external') return cover.external?.url || ''; if (cover.type === 'file') return cover.file?.url || ''; return ''; }

function normalize(page, network) {
  const p = page.properties || {};
  const arrival = first(p, ["Date d'arrivée", "Date d’arrivee", "Arrivée sur le réseau", "Date d'arrivée sur le réseau", "Entrée sur le parc"]);
  const circulation = first(p, ['Mise en circulation', 'Date de mise en circulation']);
  const common = { id: page.id, network, notionUrl: page.url || '', tcInfosUrl: firstLink(p, ['TC Infos', 'Source TC Infos', 'Fiche détaillée TC Infos', 'Lien TC Infos', 'TC Infos URL']), fotobusUrl: firstLink(p, ['Fotobus', 'Fiche Fotobus', 'URL Fotobus', 'Fotobus URL', 'Source Fotobus']), arrivalDate: arrival, arrivalDateEstimated: Boolean(first(p, ["Date d'arrivée estimée"])), circulationDate: circulation };
  const coverImage = pageCover(page);
  if (network === 'tfl') return { ...common, park: String(first(p, ['Fleet Number']) || '—'), registration: String(first(p, ['Registration Number']) || '—'), brand: String(first(p, ['Chassis Make and Model  ', 'Chassis Make and Model']) || '—'), model: String(first(p, ['Body Make and Model']) || '—'), type: String(first(p, ['Bus Type ', 'Bus Type']) || '—'), date: String(circulation || ''), status: 'En service', image: coverImage || imageProperty(p['Fichiers et médias']) || imageProperty(p['Photo de couverture']) || imageProperty(p['Photo']) || '' };
  return { ...common, park: String(first(p, ['No de parc', 'No de Parc', 'Numéro de parc', 'Parc', 'Numéro']) || '—'), registration: String(first(p, ['Immatriculation', 'Immatriculation ']) || '—'), brand: String(first(p, ['Constructeur', 'Marque']) || '—'), model: String(first(p, ['Modèle', 'Mod�le', 'Modele']) || '—'), type: String(first(p, ['Bus ou Tramway', 'Type', 'Type de véhicule']) || '—'), date: String(arrival || circulation || ''), status: String(first(p, ['Statut TC Infos', 'Statut TC Info', 'Statut', 'État']) || 'En service'), image: coverImage || imageProperty(p['Photo de couverture']) || imageProperty(p['Photo']) || imageProperty(p['Fichiers et médias']) || '' };
}

function notionValue(type, value) {
  if (value === undefined || value === null || value === '') return null;
  if (type === 'title') return { title: [{ type: 'text', text: { content: String(value) } }] };
  if (type === 'rich_text') return { rich_text: [{ type: 'text', text: { content: String(value) } }] };
  if (type === 'url') return { url: String(value) };
  if (type === 'date') return { date: { start: String(value) } };
  if (type === 'checkbox') return { checkbox: Boolean(value) };
  if (type === 'select') return { select: { name: String(value) } };
  return null;
}

// The four Notion collections have slightly different schemas. This mapping
// keeps the add form generic while writing to each collection's real columns.
const WRITE_SCHEMA = {
  bibus: { title: 'No de parc', brand: ['Constructeur','select'], model: ['Mod�le','select'], arrival: "Date d'arrivée", circulation: 'Mise en circulation', status: ['Statut TC Info','rich_text'], energy: ['Energie','rich_text'], operator: ['Exploitant','select'], serial: 'Num�ro de s�rie', tc: 'TC Infos' },
  lemet: { title: 'No de Parc', brand: ['Constructeur','select'], model: ['Modèle','select'], arrival: "Date d'arrivée", circulation: 'Mise en circulation', status: ['Statut TC Infos','select'], energy: ['Energie','select'], operator: ['Exploitant','rich_text'], serial: 'Num�ro de s�rie', tc: 'TC Infos' },
  yelo: { title: 'Nom', brand: ['Constructeur','rich_text'], model: ['Modèle','rich_text'], arrival: 'Arrivée sur le réseau', circulation: 'Mise en circulation', status: ['Statut TC Infos','select'], energy: ['Énergie','rich_text'], operator: ['Exploitant','rich_text'], serial: 'Numéro de série', tc: 'TC Infos' },
  ocecars: { title: 'Nom', brand: ['Constructeur','select'], model: ['Modèle','rich_text'], arrival: "Date d'arrivée", circulation: 'Mise en circulation', status: ['Statut','select'], energy: ['Énergie','select'], operator: ['Exploitant','rich_text'], serial: 'Numéro de série', tc: 'TC Infos' },
};

function put(properties, name, type, value) { const prop = notionValue(type, value); if (prop) properties[name] = prop; }
function putField(properties, field, value) { if (!value) return; if (Array.isArray(field)) put(properties, field[0], field[1], value); else { const type = field === 'Mise en circulation' || field === "Date d'arrivée" || field === 'Arrivée sur le réseau' ? 'date' : field === 'TC Infos' || field === 'Fotobus' ? 'url' : 'rich_text'; put(properties, field, type, value); } }
function buildProperties(input, network) {
  const s = WRITE_SCHEMA[network];
  if (!s) return {};
  const properties = {};
  const title = input.park || input.registration || `${input.brand || ''} ${input.model || ''}`.trim() || 'Véhicule sans numéro';
  put(properties, s.title, 'title', title);
  putField(properties, s.brand, input.brand); putField(properties, s.model, input.model); putField(properties, s.arrival, input.arrivalDate); putField(properties, s.circulation, input.circulationDate); putField(properties, s.status, input.status || 'En service'); putField(properties, s.energy, input.energy); putField(properties, s.operator, input.operator); putField(properties, s.serial, input.serial); putField(properties, s.tc, input.tcInfosUrl);
  const generic = { Immatriculation: input.registration, Dépôt: input.depot, 'Dernière affectation': input.assignment, Longueur: input.length, Places: input.seats, Portes: input.doors, Moteur: input.engine, 'Boite de vitesse': input.gearbox, Norme: input.euro, Climatisation: input.airConditioning, Livrée: input.livery, 'Détails TC Infos': input.details, 'Historique mouvements': input.history, Fotobus: input.fotobusUrl };
  const aliases = network === 'lemet' ? { Norme: 'Norme Euro' } : {};
  for (const [name, value] of Object.entries(generic)) { if (!value) continue; const target = aliases[name] || name; if (['Immatriculation','Dépôt','Dernière affectation','Longueur','Places','Portes','Moteur','Boite de vitesse','Climatisation','Livrée','Détails TC Infos','Historique mouvements'].includes(target)) put(properties, target, target === 'Portes' && network === 'lemet' ? 'rich_text' : 'rich_text', value); else if (target === 'Fotobus') put(properties, target, 'url', value); else if (target === 'Norme Euro') put(properties, target, network === 'lemet' ? 'select' : 'rich_text', value); }
  if (network === 'bibus') put(properties, 'Date d'arrivée estimée', 'checkbox', input.arrivalEstimated);
  else if (network === 'lemet') put(properties, "Date d'arrivée estimée", 'checkbox', input.arrivalEstimated);
  else if (network === 'yelo') put(properties, "Date d'arrivée estimée", 'checkbox', input.arrivalEstimated);
  else if (network === 'ocecars') put(properties, "Date d'arrivée estimée", 'checkbox', input.arrivalEstimated);
  return properties;
}

async function notionRequest(url, token, options = {}) {
  const response = await fetch(url, { ...options, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'Notion-Version': '2025-09-03', ...(options.headers || {}) } });
  const body = await response.text(); let parsed = null; try { parsed = JSON.parse(body); } catch {}
  if (!response.ok) { const error = new Error(parsed?.message || parsed?.code || body || `Notion returned ${response.status}`); error.notionStatus = response.status; error.notionCode = parsed?.code || ''; throw error; }
  return parsed;
}
async function queryDataSource(dataSourceId, token, initialCursor) {
  const result = []; let start_cursor = initialCursor || null; let requests = 0; let has_more = false; let next_cursor = null;
  while (requests < MAX_NOTION_REQUESTS_PER_INVOCATION) { const data = await notionRequest(`https://api.notion.com/v1/data_sources/${dataSourceId}/query`, token, { method: 'POST', body: JSON.stringify({ page_size: 100, ...(start_cursor ? { start_cursor } : {}) }) }); requests += 1; result.push(...(data.results || [])); has_more = Boolean(data.has_more); next_cursor = data.next_cursor || null; if (!has_more || !next_cursor) break; start_cursor = next_cursor; }
  return { pages: result, has_more, next_cursor, requests };
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url); const network = url.searchParams.get('network') || ''; const cursor = url.searchParams.get('cursor') || ''; const envName = NETWORK_KEYS[network];
  if (!envName) return new Response(JSON.stringify({ error: 'Unknown network' }), { status: 400, headers: { 'content-type': 'application/json' } });
  const dataSourceId = env[envName] || DATA_SOURCE_FALLBACKS[network];
  if (!dataSourceId || !env.NOTION_TOKEN) return new Response(JSON.stringify({ error: 'Notion is not configured on Cloudflare yet.', missing: !env.NOTION_TOKEN ? 'NOTION_TOKEN' : envName }), { status: 503, headers: { 'content-type': 'application/json' } });
  try { const { pages, has_more, next_cursor, requests } = await queryDataSource(dataSourceId, env.NOTION_TOKEN, cursor); const vehicles = pages.map(page => normalize(page, network)); vehicles.sort((a,b) => { const da=a.arrivalDate||a.circulationDate||a.date||''; const db=b.arrivalDate||b.circulationDate||b.date||''; if(!da&&!db)return 0;if(!da)return 1;if(!db)return -1;return db.localeCompare(da); }); return new Response(JSON.stringify({ network, count: vehicles.length, vehicles, has_more, next_cursor, requests }), { headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } }); }
  catch (error) { return new Response(JSON.stringify({ error: 'Unable to read Notion', details: error instanceof Error ? error.message : String(error), notionStatus: error?.notionStatus || null, notionCode: error?.notionCode || null }), { status: 502, headers: { 'content-type': 'application/json; charset=utf-8' } }); }
}

export async function onRequestPost({ request, env }) {
  const network = new URL(request.url).searchParams.get('network') || ''; const envName = NETWORK_KEYS[network]; const dataSourceId = envName ? (env[envName] || DATA_SOURCE_FALLBACKS[network]) : null;
  if (!envName || !dataSourceId) return new Response(JSON.stringify({ error: 'Unknown network' }), { status: 400, headers: { 'content-type': 'application/json' } });
  if (!env.NOTION_TOKEN) return new Response(JSON.stringify({ error: 'Notion is not configured on Cloudflare yet.' }), { status: 503, headers: { 'content-type': 'application/json' } });
  try {
    const input = await request.json(); const registration = String(input.registration || '').trim(); const park = String(input.park || '').trim();
    if (!registration && !park) return new Response(JSON.stringify({ error: 'Immatriculation ou numéro de parc obligatoire.' }), { status: 400, headers: { 'content-type': 'application/json' } });
    const existing = await queryDataSource(dataSourceId, env.NOTION_TOKEN, null); const normalizedReg = registration.replace(/\s+/g, '').toUpperCase();
    const duplicate = existing.pages.find(page => { const p=page.properties||{}; const r=first(p,['Immatriculation']).replace(/\s+/g,'').toUpperCase(); const n=first(p,['No de parc','No de Parc','Numéro de parc','Parc','Numéro']).trim(); return (normalizedReg&&r===normalizedReg)||(park&&n===park); });
    if (duplicate) return new Response(JSON.stringify({ error: 'Ce véhicule existe déjà dans Notion.', page: normalize(duplicate, network) }), { status: 409, headers: { 'content-type': 'application/json; charset=utf-8' } });
    const data = await notionRequest('https://api.notion.com/v1/pages', env.NOTION_TOKEN, { method:'POST', body: JSON.stringify({ parent:{ type:'data_source_id', data_source_id:dataSourceId }, properties:buildProperties(input,network) }) });
    return new Response(JSON.stringify({ ok:true, vehicle:normalize(data,network) }), { status:201, headers:{'content-type':'application/json; charset=utf-8'} });
  } catch (error) { return new Response(JSON.stringify({ error:'Impossible d’ajouter le véhicule à Notion.', details:error instanceof Error?error.message:String(error), notionStatus:error?.notionStatus||null, notionCode:error?.notionCode||null }), { status:502, headers:{'content-type':'application/json; charset=utf-8'} }); }
}
