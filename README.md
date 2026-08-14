# Bus Collection

Application privée de collection des parcs de bus, autocars et tramways.

## Réseaux
- Bibus
- TCRM / Le Met
- Yélo
- TfL London

## Architecture
- Frontend React + Vite
- Déploiement sur Cloudflare Pages
- `functions/api/vehicles.js` sert de proxy sécurisé vers l'API Notion
- Le token Notion reste côté serveur, jamais dans le navigateur
- Le bouton d'actualisation relit directement les données Notion, sans données copiées dans le frontend

## Sources Notion actuellement branchées
- Bibus — `36493645-8361-81d5-aa65-000bfc2254ec`
- TCRM / Le Met — `36493645-8361-8151-8160-000bb2a95b4b`
- Yélo — `3b593645-8361-8001-9b66-000b6f3f55ab`
- TfL buses — `37293645-8361-81c0-8ebd-000bb403afce`

Les identifiants de sources de données ne sont pas des secrets. Le seul secret est le token Notion.

## Variables Cloudflare
Dans **Cloudflare Pages → Settings → Environment variables**, ajouter :

- `NOTION_TOKEN` — Secret : token de l'intégration Notion ayant accès aux quatre bases.
- `NOTION_DS_BIBUS` — `36493645-8361-81d5-aa65-000bfc2254ec`
- `NOTION_DS_LEMET` — `36493645-8361-8151-8160-000bb2a95b4b`
- `NOTION_DS_YELO` — `3b593645-8361-8001-9b66-000b6f3f55ab`
- `NOTION_DS_TFL` — `37293645-8361-81c0-8ebd-000bb403afce`

Les variables doivent être renseignées pour **Production** et, si besoin, pour **Preview**.

Après leur ajout, déclencher un nouveau déploiement. Le endpoint `/api/vehicles?network=bibus|lemet|yelo|tfl` interroge alors Notion en temps réel.

## Mapping TfL
La base TfL buses utilise son propre vocabulaire :
- `Fleet Number` → numéro de parc
- `Registration Number` → immatriculation
- `Chassis Make and Model` → constructeur / châssis
- `Body Make and Model` → modèle
- `Bus Type` → énergie/type
- `Registration date` → date de référence
- `Fichiers et médias` → photo

## Développement
```bash
npm install
npm run dev
```
