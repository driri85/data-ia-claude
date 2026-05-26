# Frontend — React + Vite + TypeScript

## Stack

- **React 18** + **TypeScript** : UI déclarative typée
- **Vite** : bundler ultra-rapide (remplace CRA)
- **TanStack React Query v5** : gestion des requêtes serveur (cache, loading, error)
- **Tailwind CSS** : styles utilitaires (pas de fichier CSS custom)
- **Recharts** : graphes (BarChart, LineChart…) — toujours dans `<ResponsiveContainer>`
- **lucide-react** : icônes SVG

## Lancer

```bash
cd frontend
npm install
npm run dev     # app sur http://localhost:5173
```

> Sur Windows avec espaces dans le chemin, `npm run dev` utilise
> `node node_modules/vite/bin/vite.js` pour contourner le bug des scripts `.bin`.

## Structure `src/`

```
src/
├── api.ts            # fonctions fetch vers l'API FastAPI (getStats, predire)
├── App.tsx           # layout principal, query stats, graphe Recharts
├── PredictionForm.tsx# formulaire 10 features + mutation React Query
├── main.tsx          # point d'entrée React, QueryClientProvider
├── lib/utils.ts      # helper cn() pour Tailwind (shadcn-ready)
└── index.css         # directives Tailwind (@tailwind base/components/utilities)
```

## Flux de données

```
App.tsx
  └─ useQuery(['stats'])  →  GET /api/stats  →  BarChart Recharts
  └─ <PredictionForm>
        └─ useMutation    →  POST /api/predict  →  affiche prédiction
```

**Règle** : données serveur → **React Query** (`useQuery` / `useMutation`), état local pur → `useState`.

## Ajouter un composant shadcn

```bash
npx shadcn@latest add <composant>
```

Les primitives sont déjà configurées via `cn()` dans `src/lib/utils.ts`.

## Build production

```bash
npm run build    # compile TypeScript + bundle → frontend/dist/
```

Le dossier `dist/` est ensuite servi par FastAPI (voir `backend/main.py`, bloc StaticFiles).
