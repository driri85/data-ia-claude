# Frontend — React + Vite + TypeScript

## Stack

- **React 18** + **TypeScript** : UI déclarative typée
- **Vite** : bundler ultra-rapide (remplace CRA)
- **TanStack React Query v5** : gestion des requêtes serveur (cache, loading, error, mutations)
- **Tailwind CSS** : styles utilitaires (pas de fichier CSS custom)
- **Recharts** : graphes (`BarChart`, `ScatterChart`) — toujours dans `<ResponsiveContainer>`
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
├── api.ts              # fonctions fetch vers l'API FastAPI
│                       #   getStats, predire, clusterer, getClusterData
├── App.tsx             # layout principal, onglets Régression / Clustering
│                       #   useQuery(['stats']) → BarChart BMI × progression
├── PredictionForm.tsx  # formulaire 10 features + useMutation → POST /api/predict
├── ClusteringPage.tsx  # nuage de points + formulaire + useMutation → POST /api/cluster
│                       #   useQuery(['cluster-data']) → ScatterChart BMI × S5
├── main.tsx            # point d'entrée React, QueryClientProvider
├── lib/utils.ts        # helper cn() pour Tailwind (shadcn-ready)
└── index.css           # directives Tailwind (@tailwind base/components/utilities)
```

## Flux de données

```
App.tsx
├── useQuery(['stats'])          →  GET /api/stats
│     └── BarChart Recharts          (progression moyenne par tranche BMI)
│
├── <PredictionForm>
│     └── useMutation              →  POST /api/predict
│           └── affiche prediction    (score progression 1 an)
│
└── <ClusteringPage>
      ├── useQuery(['cluster-data']) →  GET /api/cluster-data
      │     └── ScatterChart Recharts    (nuage BMI × S5 coloré par cluster)
      └── useMutation              →  POST /api/cluster
            └── affiche cluster assigné + point sur le graphe
```

**Règle** : données serveur → **React Query** (`useQuery` / `useMutation`), état local pur → `useState`. Pas de `fetch` dans des `useEffect`.

## Navigation

Deux onglets gérés par un `useState<'regression' | 'clustering'>` dans `App.tsx` :

| Onglet | Composant | Endpoint(s) |
|--------|-----------|-------------|
| Régression | `App.tsx` + `PredictionForm` | `GET /api/stats`, `POST /api/predict` |
| Clustering | `ClusteringPage` | `GET /api/cluster-data`, `POST /api/cluster` |

## Ajouter un composant shadcn

```bash
npx shadcn@latest add <composant>
```

Les primitives sont déjà configurées via `cn()` dans `src/lib/utils.ts`.

## Build production

```bash
npm run build    # compile TypeScript + bundle → frontend/dist/
npm run typecheck  # vérification des types sans build
```

Le dossier `dist/` est ensuite servi par FastAPI (voir `backend/main.py`, bloc StaticFiles commenté).
