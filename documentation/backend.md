# Backend — FastAPI

## Stack

- **FastAPI** : framework Python pour construire des APIs REST rapides
- **joblib** : chargement du modèle ML sérialisé (`model.pkl`)
- **scikit-learn** : pipeline ML (VotingRegressor)
- **pandas** : construction du DataFrame envoyé au modèle
- **uvicorn** : serveur ASGI qui exécute FastAPI

## Lancer

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows : .venv\Scripts\activate
pip install -r requirements.txt
python main.py              # démarre sur http://localhost:8000
```

## Endpoints

### `GET /api/health`
Vérifie que l'API est en ligne et que le modèle est chargé.

```json
{ "status": "ok", "model_loaded": true }
```

### `POST /api/predict`
Reçoit les 10 features du dataset Diabetes UCI et renvoie la prédiction de progression de la maladie.

**Corps de la requête :**
```json
{
  "age": 0.05,  "sex": 0.05,  "bmi": 0.06,
  "bp": 0.02,   "s1": -0.04,  "s2": -0.03,
  "s3": -0.04,  "s4": -0.00,  "s5": 0.01,  "s6": -0.01
}
```
> Les valeurs sont normalisées (moyenne 0, écart-type 1) comme à l'entraînement.

**Réponse :**
```json
{ "prediction": 187.4 }
```

### `GET /api/stats`
Renvoie la progression moyenne de la maladie par tranche de BMI (5 groupes).  
Utilisé par le graphe Recharts du frontend.

```json
[
  { "label": "(-0.108, 0.0271]", "value": 123.5 },
  ...
]
```

## Modèle ML

Le fichier `model.pkl` est un **pipeline scikit-learn** composé de :
1. `preprocessor` — `ColumnTransformer` (mise à l'échelle, imputation)
2. `regressor` — `VotingRegressor` combinant Ridge, Lasso et ElasticNet

Le pipeline attend un `pd.DataFrame` avec les colonnes nommées dans cet ordre :
`age, sex, bmi, bp, s1, s2, s3, s4, s5, s6`

## Déploiement (J4)

Décommenter le bloc `StaticFiles` dans `main.py` pour servir le build React depuis FastAPI :

```bash
cd frontend && npm run build   # génère frontend/dist/
# puis relancer python main.py
```
