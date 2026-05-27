"""API FastAPI -- squelette du dashboard B3 (a completer avec Claude Code)."""
from pathlib import Path

import joblib
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sklearn.datasets import load_diabetes

app = FastAPI(title="Dashboard B3 -- API")

# CORS : autorise le front Vite (dev, port 5173) a appeler l'API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Chargement des modeles une seule fois au demarrage
MODEL_REGRESSION_PATH = Path(__file__).parent / "model-regression.pkl"
MODEL_CLUSTERING_PATH = Path(__file__).parent / "model-clustering.pkl"
model = joblib.load(MODEL_REGRESSION_PATH) if MODEL_REGRESSION_PATH.exists() else None
model_clustering = joblib.load(MODEL_CLUSTERING_PATH) if MODEL_CLUSTERING_PATH.exists() else None

# Dataset charge une fois pour /api/stats
_diabetes = load_diabetes(as_frame=True)
dataset: pd.DataFrame = _diabetes.frame  # colonnes: age sex bmi bp s1..s6 target


FEATURES = ["age", "sex", "bmi", "bp", "s1", "s2", "s3", "s4", "s5", "s6"]


class Features(BaseModel):
    age: float
    sex: float
    bmi: float
    bp: float
    s1: float
    s2: float
    s3: float
    s4: float
    s5: float
    s6: float


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "model_regression_loaded": model is not None,
        "model_clustering_loaded": model_clustering is not None,
    }


@app.post("/api/predict")
def predict(features: Features):
    if model is None:
        return {"error": "model-regression.pkl manquant"}
    x = pd.DataFrame([features.model_dump()])[FEATURES]
    pred = model.predict(x)[0]
    return {"prediction": float(pred)}


@app.post("/api/cluster")
def cluster(features: Features):
    if model_clustering is None:
        return {"error": "model-clustering.pkl manquant"}
    x = pd.DataFrame([features.model_dump()])[FEATURES]
    label = model_clustering.predict(x)[0]
    return {"cluster": int(label)}


@app.get("/api/cluster-data")
def cluster_data():
    if model_clustering is None:
        return []
    X = dataset[FEATURES]
    labels = model_clustering.predict(X)
    return [
        {"bmi": round(float(row["bmi"]), 4), "s5": round(float(row["s5"]), 4), "cluster": int(labels[i])}
        for i, row in X.iterrows()
    ]


@app.get("/api/stats")
def stats():
    # Moyenne de la cible (progression du diabete) par tranche de BMI
    df = dataset.copy()
    df["bmi_group"] = pd.cut(df["bmi"], bins=5)
    agg = df.groupby("bmi_group", observed=True)["target"].mean().reset_index()
    return [
        {"label": str(row["bmi_group"]), "value": round(float(row["target"]), 1)}
        for _, row in agg.iterrows()
    ]


# --- PROD (J4) : decommenter pour servir le build React (dist/) en un seul process ---
# from fastapi.staticfiles import StaticFiles
# DIST = Path(__file__).parents[1] / "frontend" / "dist"
# if DIST.exists():
#     app.mount("/", StaticFiles(directory=DIST, html=True), name="static")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
