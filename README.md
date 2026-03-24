# SubTrack 📊

> Visualisez et maîtrisez vos dépenses d'abonnements en un seul endroit.

🌐 **[Voir la démo en live](https://subscription-tracker-g7yp.onrender.com)**

---

## ✨ Fonctionnalités

- **Tableau de bord** — visualisez tous vos abonnements avec le total mensuel et annuel en temps réel
- **Présélections** — 20+ services préconfigurés (Netflix, Spotify, Disney+, Xbox, PlayStation, Adobe, etc.) avec leurs prix 2026
- **Ajout manuel** — ajoutez n'importe quel abonnement avec une URL d'icône personnalisée
- **Recherche intelligente** — autocomplétion lors de la saisie d'un service
- **Choix d'offre** — sélectionnez le plan exact parmi les offres disponibles (Premium, Family, Étudiant...)
- **Abonnements partagés** — indiquez si un abonnement est partagé avec d'autres personnes
- **Prochain paiement** — renseignez la date de votre prochain prélèvement
- **Import CSV** — importez vos abonnements en masse via un fichier CSV (glisser-déposer supporté)
- **Analyse d'opportunité** — détecte les doublons et suggère des économies potentielles
- **Authentification** — compte personnel sécurisé avec mots de passe hachés
- **Responsive** — interface adaptée mobile et desktop

---

## 🛠️ Stack technique

- **Backend** : Python, Flask, SQLite, Werkzeug
- **Frontend** : HTML/CSS/JS vanilla, Jinja2
- **Auth** : Sessions Flask + hachage bcrypt via Werkzeug
- **Déploiement** : Render (gunicorn)

---

## 🚀 Installation locale

### Prérequis
- Python 3.10+
- pip

### Étapes

```bash
# 1. Cloner le repo
git clone https://github.com/nodelorean/subscription-tracker.git
cd subscription-tracker

# 2. Installer les dépendances
pip install -r requirements.txt

# 3. Créer le fichier .env
echo "SECRET_KEY=votre_cle_secrete" > .env

# 4. Lancer l'app
python app.py
```

L'app est accessible sur `http://localhost:5000`

---

## 📁 Structure du projet

```
subscription-tracker/
├── app.py                  # Backend Flask + routes API
├── requirements.txt        # Dépendances Python
├── Procfile                # Config déploiement Render
├── .env                    # Variables d'environnement (non versionné)
├── static/
│   ├── script.js           # Logique frontend + présélections
│   └── style.css           # Styles de l'application
└── templates/
    └── index.html          # Template Jinja2 principal
```

---

## 🔌 API Routes

| Méthode | Route | Description |
|---------|-------|-------------|
| `POST` | `/api/register` | Créer un compte |
| `POST` | `/api/login` | Se connecter |
| `POST` | `/api/logout` | Se déconnecter |
| `GET` | `/api/me` | Vérifier la session |
| `GET` | `/api/subscriptions` | Récupérer ses abonnements |
| `POST` | `/api/subscriptions` | Ajouter un abonnement |
| `DELETE` | `/api/subscriptions/<id>` | Supprimer un abonnement |

---

## 📄 Format CSV d'import

```csv
Netflix,15.99,monthly
Spotify,11.99,monthly
Adobe Creative Cloud,59.99,monthly
Nintendo Switch Online,6.99,yearly
```

---

## 🔒 Sécurité

- Mots de passe hachés avec Werkzeug (PBKDF2-SHA256)
- Clé secrète Flask stockée en variable d'environnement
- Sessions sécurisées côté serveur
- Requêtes SQL paramétrées (protection injection SQL)

---

## 📜 Licence

MIT — libre d'utilisation et de modification.
