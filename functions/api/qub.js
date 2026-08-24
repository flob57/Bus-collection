const DATA_SOURCE_ID = 'b0c93645-8361-8253-b5c8-872462a4c678';

function text(p){
  if(!p) return '';
  if(p.type === 'title') return p.title?.map(x=>x.plain_text).join('') || '';
  if(p.type === 'rich_text') return p.rich_text?.map(x=>x.plain_text).join('') || '';
  if(p.type === 'select') return p.select?.name || '';
  if(p.type === 'date') return p.date?.start || '';
  return '';
}
function first(p,names){ for(const n of names){ const v=text(p[n]); if(v) return v; } return ''; }
async function notion(url,token,options={}){
  const r=await fetch(url,{...options,headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json','Notion-Version':'2025-09-03',...(options.headers||{})}});
  const body=await r.text(); let data={}; try{data=JSON.parse(body);}catch{}
  if(!r.ok) throw new Error(data.message || body || `Notion ${r.status}`);
  return data;
}
export async function onRequestGet({env}){
  const token=env.NOTION_TOKEN;
  if(!token) return new Response(JSON.stringify({error:'Notion is not configured.'}),{status:503,headers:{'content-type':'application/json'}});
  try{
    let cursor=null, pages=[];
    do{
      const data=await notion(`https://api.notion.com/v1/data_sources/${DATA_SOURCE_ID}/query`,token,{method:'POST',body:JSON.stringify({page_size:100,...(cursor?{start_cursor:cursor}:{})})});
      pages.push(...(data.results||[]));
      cursor=data.has_more?data.next_cursor:null;
    }while(cursor);
    const vehicles=pages.map(page=>{
      const p=page.properties||{};
      const arrival=first(p,['Arrivée sur le réseau','Arriv�e sur le r�seau']);
      const circulation=first(p,['Mise en circulation']);
      return {
        id:page.id,
        url:page.url||'',
        park:first(p,['Parc']),
        registration:first(p,['Immatriculation']),
        brand:first(p,['Constructeur']),
        model:first(p,['Modèle TC Infos','Mod�le TC Infos','Modèle','Mod�le']),
        type:first(p,['Type','Type de véhicule']),
        arrivalDate:arrival,
        circulationDate:circulation,
        operator:first(p,['Exploitant']),
        depot:first(p,['Dépôt','D�p�t'])
      };
    }).sort((a,b)=>String(a.park).localeCompare(String(b.park),undefined,{numeric:true}));
    return new Response(JSON.stringify({network:'qub',count:vehicles.length,vehicles}),{headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
  }catch(e){
    return new Response(JSON.stringify({error:'Unable to read QUB from Notion.',details:e.message||String(e)}),{status:502,headers:{'content-type':'application/json; charset=utf-8'}});
  }
}
