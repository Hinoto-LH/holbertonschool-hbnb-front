# HBnB - Application de Location de Logements

HBnB est une application web RESTful inspirée d'AirBnB, développée avec Python et Flask. Elle permet de gérer des utilisateurs, des logements, des équipements et des avis via une API claire et modulaire.

---

## Structure du Projet

```
hbnb/
├── app/
│   ├── __init__.py
│   ├── api/
│   │   ├── __init__.py
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── users.py
│   │       ├── places.py
│   │       ├── reviews.py
│   │       └── amenities.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── place.py
│   │   ├── review.py
│   │   └── amenity.py
│   ├── services/
│   │   ├── __init__.py
│   │   └── facade.py
│   └── persistence/
│       ├── __init__.py
│       └── repository.py
├── run.py
├── config.py
├── requirements.txt
└── README.md
```

---

## Description des Répertoires et Fichiers

### Racine du projet

| Fichier / Dossier | Description |
|---|---|
| `run.py` | Point d'entrée de l'application. Lance le serveur Flask. |
| `config.py` | Contient les configurations de l'application (mode debug, clés secrètes, etc.). |
| `requirements.txt` | Liste toutes les dépendances Python nécessaires au projet. |
| `README.md` | Documentation générale du projet. |

### `app/`
Cœur de l'application, divisé en sous-modules selon les couches de l'architecture.

### `app/api/v1/`
**Couche Présentation** — Contient les endpoints RESTful de l'API.

| Fichier | Description |
|---|---|
| `users.py` | Endpoints pour la gestion des utilisateurs (création, lecture, mise à jour). |
| `places.py` | Endpoints pour la gestion des logements. |
| `reviews.py` | Endpoints pour la gestion des avis laissés sur les logements. |
| `amenities.py` | Endpoints pour la gestion des équipements disponibles. |

### `app/models/`
**Couche Logique Métier** — Contient les classes représentant les entités de l'application.

| Fichier | Description |
|---|---|
| `user.py` | Modèle utilisateur (nom, email, mot de passe, etc.). |
| `place.py` | Modèle logement (titre, description, prix, localisation, etc.). |
| `review.py` | Modèle avis (texte, note, lien avec utilisateur et logement). |
| `amenity.py` | Modèle équipement (Wi-Fi, piscine, parking, etc.). |

### `app/services/`
**Couche Service / Façade** — Fait le lien entre la couche API et la logique métier.

| Fichier | Description |
|---|---|
| `facade.py` | Implémente le patron de conception Façade. Centralise les appels entre les couches pour simplifier les interactions. |

### `app/persistence/`
**Couche Persistance** — Gère le stockage des données.

| Fichier | Description |
|---|---|
| `repository.py` | Repository en mémoire (stockage via dictionnaire Python). Sera remplacé par une base SQL (SQLAlchemy) en Partie 3. |

---

## Prérequis

- Python **3.8** ou supérieur
- pip

---

## Installation

### 1. Cloner le dépôt

```bash
git clone https://github.com/ton-utilisateur/hbnb.git
cd hbnb
```

### 2. Créer un environnement virtuel

```bash
python3 -m venv venv
source venv/bin/activate        # Linux / macOS
venv\Scripts\activate           # Windows
```

### 3. Installer les dépendances

```bash
pip install -r requirements.txt
```

---

## Lancer l'application

```bash
python run.py
```

L'application sera accessible à l'adresse : [http://127.0.0.1:5000](http://127.0.0.1:5000)

La documentation interactive de l'API (Swagger) est disponible à : [http://127.0.0.1:5000/api/v1/](http://127.0.0.1:5000/api/v1/)

---

## Tester l'API

Tu peux tester les endpoints avec **Postman** ou **cURL**.

Exemple avec cURL pour récupérer la liste des utilisateurs :

```bash
curl -X GET http://127.0.0.1:5000/api/v1/users/
```

---

## Architecture

L'application suit une architecture **3 couches** :

```
Présentation (API)  →  Façade (Services)  →  Logique Métier (Models)  →  Persistance
```

Cette séparation garantit un code modulaire, maintenable et facilement extensible.

---

## Auteur

Projet réalisé dans le cadre du cursus **Holberton School**.