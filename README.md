# Bus Collection

Application privée de collection des parcs de bus, autocars et tramways.

## Réseaux
- Bibus
- TCRM / Le Met
- Yélo
- TfL London

## Architecture
- Frontend React + Vite
- Déploiement prévu sur Cloudflare Pages
- `functions/api/vehicles.js` sert de proxy sécurisé vers l'API Notion
- Le token Notion reste côté serveur, jamais dans le navigateur

## Variables Cloudflare
Créer dans les variables/secrets du projet :
- `NOTION_TOKEN`
- `NOTION_DS_BIBUS`
- `NOTION_DS_LEMET`
- `NOTION_DS_YELO`
- `NOTION_DS_TFL`

Les quatre `NOTION_DS_*` correspondent aux identifiants des sources de données Notion préparées pour l'application.

## Développement
```bash
npm install
npm run dev
```

Le frontend utilise `/api/vehicles?network=bibus|lemet|yelo|tfl`. Si le proxy Notion n'est pas encore configuré, l'application affiche automatiquement un petit jeu de données de secours afin que l'interface reste utilisable.
