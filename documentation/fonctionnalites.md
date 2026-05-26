# Fonctionnalités du dashboard

## Vue d'ensemble

Application full-stack de visualisation et de prédiction sur le dataset **Diabetes UCI**.  
Le frontend React interroge une API FastAPI qui charge un modèle ML entraîné.

---

## 1. Graphe — Progression moyenne par tranche de BMI

**Où :** section "Explorer les données" dans `App.tsx`

**Ce que ça fait :**
- Au chargement de la page, React Query appelle `GET /api/stats`
- L'API découpe les 442 patients en 5 tranches de BMI et calcule la progression moyenne de la maladie pour chaque groupe
- Le résultat s'affiche sous forme de **BarChart** (Recharts)

**Pourquoi c'est utile :** montre visuellement que plus le BMI est élevé, plus la progression du diabète est importante.

---

## 2. Formulaire de prédiction

**Où :** section "Prédire" — `PredictionForm.tsx`

**Ce que ça fait :**
- Affiche 10 champs numériques correspondant aux features du modèle (age, sex, bmi, bp, s1–s6)
- Au clic sur "Prédire", envoie un `POST /api/predict` avec les valeurs saisies
- Affiche la prédiction retournée (score de progression de la maladie)

**Détail technique :**  
Les valeurs attendues sont **normalisées** (comme à l'entraînement scikit-learn).  
Exemple de valeurs valides : `age=0.05, bmi=0.06, sex=0.05, bp=0.02, s1–s6 ≈ ±0.05`

---

## 3. Modèle ML — VotingRegressor

**Où :** `backend/model.pkl` chargé au démarrage de l'API

**Ce que c'est :**
Un **ensemble de 3 régresseurs linéaires** combinés par vote (moyenne des prédictions) :
- **Ridge** (alpha=10.0) — régularisation L2, robuste aux features corrélées
- **Lasso** (alpha=0.1) — régularisation L1, peut mettre certains coefficients à zéro
- **ElasticNet** (alpha=0.1, l1_ratio=0.5) — combine L1 et L2

L'ensemble améliore la stabilité par rapport à un seul modèle.

---

## 4. Health check

**Où :** `GET /api/health`

Endpoint utilitaire qui confirme que l'API répond et que `model.pkl` est bien chargé.  
Pratique pour vérifier l'état du serveur en dev ou en déploiement.

---

## Dataset — Diabetes UCI

| Propriété | Valeur |
|-----------|--------|
| Source | `sklearn.datasets.load_diabetes` |
| Patients | 442 |
| Features | 10 (age, sex, bmi, bp, 6 sérums sanguins) |
| Cible | Score de progression du diabète 1 an après baseline |
| Valeurs | Normalisées (moyenne 0, variance unitaire) |
