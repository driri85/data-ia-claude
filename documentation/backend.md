# Backend — FastAPI

## Stack

- **FastAPI** : framework Python pour construire des APIs REST rapides
- **joblib** : chargement des modèles ML sérialisés (`model-regression.pkl`, `model-clustering.pkl`)
- **scikit-learn** : pipelines ML (VotingRegressor + AgglomerativeClustering)
- **pandas** : construction des DataFrames envoyés aux modèles
- **uvicorn** : serveur ASGI qui exécute FastAPI

## Lancer

```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# Mac / Linux
source .venv/bin/activate

pip install -r requirements.txt
python main.py   # démarre sur http://localhost:8000
```

## Endpoints

### `GET /api/health`

Vérifie que l'API est en ligne et que les deux modèles sont chargés.

```json
{
  "status": "ok",
  "model_regression_loaded": true,
  "model_clustering_loaded": true
}
```

---

### `POST /api/predict`

Reçoit les 10 features du dataset Diabetes UCI et renvoie la prédiction de progression de la maladie (régression).

**Corps de la requête :**
```json
{
  "age": 0.05,  "sex": 0.05,  "bmi": 0.06,
  "bp": 0.02,   "s1": -0.04,  "s2": -0.03,
  "s3": -0.04,  "s4": 0.00,   "s5": 0.01,  "s6": -0.01
}
```

> Les valeurs sont normalisées (entre -0.2 et +0.2) comme à l'entraînement.

**Réponse :**
```json
{ "prediction": 187.4 }
```

---

### `POST /api/cluster`

Assigne un patient à l'un des 4 clusters identifiés par AgglomerativeClustering.

**Corps de la requête :** identique à `/api/predict` (10 features normalisées).

**Réponse :**
```json
{ "cluster": 2 }
```

---

### `GET /api/cluster-data`

Renvoie la position de chaque patient du dataset dans l'espace BMI × S5, avec son cluster. Utilisé par le ScatterChart de `ClusteringPage.tsx`.

```json
[
  { "bmi": 0.0617, "s5": 0.0199, "cluster": 0 },
  ...
]
```

---

### `GET /api/stats`

Renvoie la progression moyenne du diabète par tranche de BMI (5 groupes). Utilisé par le BarChart de `App.tsx`.

```json
[
  { "label": "(-0.108, -0.0271]", "value": 100.3 },
  { "label": "(-0.0271, 0.0538]", "value": 135.1 },
  ...
]
```

---

## Modèles ML

### Régression — `model-regression.pkl`

Pipeline scikit-learn :
1. `preprocessor` — `ColumnTransformer` : `SimpleImputer(median)` + `StandardScaler`
2. `regressor` — `VotingRegressor` :
   - `Ridge(alpha=10)` — régularisation L2, réduit tous les coefficients
   - `Lasso(alpha=0.1)` — régularisation L1, peut annuler certains coefficients
   - `ElasticNet(alpha=0.1, l1_ratio=0.5)` — combine L1 et L2

**Métrique :** R² = 0.5232 sur le set de validation (89 patients)

### Clustering — `model-clustering.pkl`

`AgglomerativeClustering(n_clusters=4)` entraîné sur les features `sex` + `bmi`.  
Sélectionné automatiquement parmi KMeans et Agglomerative sur toutes les paires de features (2 à 5 clusters) — critère : score de silhouette le plus proche de 0.6.

**Métrique :** silhouette = 0.6015

> **Note :** `AgglomerativeClustering` de sklearn n'implémente pas `.predict()` nativement. Le backend appelle `.fit_predict()` sur l'ensemble du dataset à chaque requête `/api/cluster` et retourne le label du point le plus proche — comportement acceptable pour 442 points.

## Déploiement production

Décommenter le bloc `StaticFiles` dans `main.py` pour servir le build React depuis FastAPI en un seul process :

```bash
cd frontend && npm run build   # génère frontend/dist/
# puis relancer python main.py
```
