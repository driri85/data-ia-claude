# Fonctionnalités du dashboard

## Vue d'ensemble

Application full-stack de visualisation, prédiction et clustering sur le dataset **Diabetes UCI**.  
Le frontend React interroge une API FastAPI qui charge deux modèles ML entraînés.

---

## Onglet Régression

### 1. Graphe — Progression moyenne par tranche de BMI

**Composant :** `App.tsx`

**Ce que ça fait :**
- Au chargement, React Query appelle `GET /api/stats`
- L'API découpe les 442 patients en 5 tranches de BMI et calcule la progression moyenne pour chaque groupe
- Le résultat s'affiche sous forme de **BarChart** (Recharts)

| Tranche | Patients | Progression moy. | Interprétation |
|---------|----------|-----------------|----------------|
| Très faible | 98 | ~100 | BMI minimal, risque très faible |
| Faible | 188 | ~135 | Groupe le plus représenté, BMI sous la moyenne |
| Modéré | 114 | ~192 | BMI au-dessus de la moyenne |
| Élevé | 35 | ~236 | Surpoids marqué |
| Très élevé | 7 | ~287 | Obésité, peu de données |

**Pourquoi c'est utile :** relation monotone claire entre BMI et progression du diabète.

---

### 2. Formulaire de prédiction

**Composant :** `PredictionForm.tsx`

**Ce que ça fait :**
- Affiche 10 champs numériques (age, sex, bmi, bp, s1–s6)
- Au clic sur "Prédire", envoie `POST /api/predict` avec les valeurs saisies
- Affiche le score de progression prédit (ex : `187.4`)

**Modèle :** `VotingRegressor` (Ridge + Lasso + ElasticNet) — R² = **0.5232**

> Les valeurs saisies doivent être normalisées comme à l'entraînement (entre -0.2 et +0.2).  
> Exemple valide : `age=0.05, bmi=0.06, sex=0.05, bp=0.02, s1–s6 ≈ ±0.05`

---

## Onglet Clustering

### 3. Nuage de points — Distribution des clusters

**Composant :** `ClusteringPage.tsx`

**Ce que ça fait :**
- Appelle `GET /api/cluster-data` au chargement
- Affiche un **ScatterChart** (Recharts) des 442 patients dans l'espace BMI × S5, colorés par cluster
- Après assignation d'un patient, son point apparaît en noir (étoile) sur le graphe

| Cluster | Couleur | Patients | Progression moy. | Profil |
|---------|---------|----------|-----------------|--------|
| 0 | Bleu | 170 | élevée | BMI, tension, LTG au-dessus de la moyenne |
| 1 | Vert | 85 | modérée | Tous les indicateurs proches de la moyenne |
| 2 | Rouge | 150 | faible | Patients jeunes, BMI bas, HDL élevé |
| 3 | Jaune | 37 | variable | Profil atypique, peu représenté |

---

### 4. Formulaire d'assignation de cluster

**Composant :** `ClusteringPage.tsx`

**Ce que ça fait :**
- Même formulaire 10 features que la régression
- Au clic sur "Assigner", envoie `POST /api/cluster`
- Affiche le cluster assigné (badge coloré) et positionne le point sur le ScatterChart

**Modèle :** `AgglomerativeClustering` — 4 clusters sur `sex` + `bmi` — silhouette = **0.6015**

---

## 5. Health check

**Route :** `GET /api/health`

Confirme que l'API répond et que les deux modèles sont chargés.

```json
{
  "status": "ok",
  "model_regression_loaded": true,
  "model_clustering_loaded": true
}
```

---

## Dataset — Diabetes UCI

| Propriété | Valeur |
|-----------|--------|
| Source | `sklearn.datasets.load_diabetes` |
| Patients | 442 |
| Features | 10 (age, sex, bmi, bp, s1–s6) |
| Cible | Score de progression du diabète 1 an après baseline |
| Plage cible | 25 – 346 |
| Normalisation | Valeurs centrées-réduites entre -0.2 et +0.2 par sklearn |

### Détail des features

| Feature | Nom complet | Description |
|---------|-------------|-------------|
| `age` | Âge | Âge du patient |
| `sex` | Sexe | Sexe (encodé numériquement) |
| `bmi` | Body Mass Index | Poids(kg) / taille(m)² |
| `bp` | Blood Pressure | Pression artérielle moyenne |
| `s1` | TC | Cholestérol total |
| `s2` | LDL | Low-Density Lipoprotein — « mauvais cholestérol » |
| `s3` | HDL | High-Density Lipoprotein — « bon cholestérol » |
| `s4` | TCH | Ratio cholestérol total / HDL |
| `s5` | LTG | Log du taux de triglycérides |
| `s6` | GLU | Glycémie (taux de sucre sanguin) |
