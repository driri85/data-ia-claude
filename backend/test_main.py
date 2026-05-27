"""Tests unitaires FastAPI — pytest + httpx."""
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

SAMPLE = {
    "age": 0.038, "sex": 0.051, "bmi": 0.062, "bp": 0.022,
    "s1": -0.044, "s2": -0.035, "s3": -0.043,
    "s4": -0.003, "s5": 0.020, "s6": -0.018,
}


# ── /api/health ──────────────────────────────────────────────────────────────

def test_health_ok():
    r = client.get("/api/health")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "ok"
    assert body["model_regression_loaded"] is True
    assert body["model_clustering_loaded"] is True


# ── /api/predict ─────────────────────────────────────────────────────────────

def test_predict_returns_float():
    r = client.post("/api/predict", json=SAMPLE)
    assert r.status_code == 200
    body = r.json()
    assert "prediction" in body
    assert isinstance(body["prediction"], float)


def test_predict_value_in_range():
    r = client.post("/api/predict", json=SAMPLE)
    pred = r.json()["prediction"]
    # La cible du dataset Diabetes est entre 25 et 346
    assert 25 <= pred <= 346


def test_predict_missing_field_returns_422():
    payload = {k: v for k, v in SAMPLE.items() if k != "bmi"}
    r = client.post("/api/predict", json=payload)
    assert r.status_code == 422


# ── /api/cluster ─────────────────────────────────────────────────────────────

def test_cluster_returns_int():
    r = client.post("/api/cluster", json=SAMPLE)
    assert r.status_code == 200
    body = r.json()
    assert "cluster" in body
    assert isinstance(body["cluster"], int)


def test_cluster_value_valid():
    r = client.post("/api/cluster", json=SAMPLE)
    cluster = r.json()["cluster"]
    assert cluster in {0, 1, 2}


def test_cluster_missing_field_returns_422():
    payload = {k: v for k, v in SAMPLE.items() if k != "age"}
    r = client.post("/api/cluster", json=payload)
    assert r.status_code == 422


def test_cluster_deterministic():
    """Même input → même cluster à chaque appel."""
    r1 = client.post("/api/cluster", json=SAMPLE)
    r2 = client.post("/api/cluster", json=SAMPLE)
    assert r1.json()["cluster"] == r2.json()["cluster"]


# ── /api/cluster-data ────────────────────────────────────────────────────────

def test_cluster_data_returns_list():
    r = client.get("/api/cluster-data")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) == 442  # dataset Diabetes UCI complet


def test_cluster_data_point_schema():
    data = client.get("/api/cluster-data").json()
    point = data[0]
    assert set(point.keys()) == {"bmi", "s5", "cluster"}
    assert isinstance(point["bmi"], float)
    assert isinstance(point["s5"], float)
    assert point["cluster"] in {0, 1, 2}


# ── /api/stats ───────────────────────────────────────────────────────────────

def test_stats_returns_five_groups():
    r = client.get("/api/stats")
    assert r.status_code == 200
    data = r.json()
    assert len(data) == 5


def test_stats_values_increasing():
    """Plus le BMI est élevé, plus la progression moyenne doit augmenter."""
    data = client.get("/api/stats").json()
    values = [item["value"] for item in data]
    assert values == sorted(values)
