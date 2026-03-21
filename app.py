import sqlite3
from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
from dotenv import load_dotenv
import os

# --- Configuration de l'application ---
app = Flask(__name__)
load_dotenv()
app.secret_key = os.environ.get("SECRET_KEY")  # Clé pour sécuriser les sessions utilisateur

DATABASE = 'database.db'

# --- Gestion de la base de données ---
def get_db():
    """Établit une connexion à la base de données SQLite."""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row  # Permet d'accéder aux colonnes par nom
    return conn

def init_db():
    """Initialise la base de données en créant les tables si elles n'existent pas."""
    with app.app_context():
        db = get_db()
        cursor = db.cursor()
        # Table des utilisateurs (stocke les identifiants et mots de passe hachés)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL
            )
        ''')
        # Table des abonnements (liée aux utilisateurs via user_id)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS subscriptions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                price REAL NOT NULL,
                cycle TEXT NOT NULL,
                icon TEXT,
                shared INTEGER DEFAULT 0,
                next_billing_date TEXT,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Ajouter les colonnes si elles n'existent pas (pour les anciennes DB)
        try:
            cursor.execute('ALTER TABLE subscriptions ADD COLUMN shared INTEGER DEFAULT 0')
        except:
            pass
        try:
            cursor.execute('ALTER TABLE subscriptions ADD COLUMN next_billing_date TEXT')
        except:
            pass
            
        db.commit()
        db.close()

init_db()

# --- Sécurité et Décorateurs ---
def login_required(f):
    """Décorateur pour protéger les routes : vérifie si l'utilisateur est connecté."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Non authentifié'}), 401
        return f(*args, **kwargs)
    return decorated_function

@app.route('/')
def index():
    """Affiche la page d'accueil (template HTML)."""
    return render_template('index.html')

# --- API Authentification ---

@app.route('/api/register', methods=['POST'])
def register():
    """Inscrir un nouvel utilisateur, hache le mot de passe et démarre une session."""
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Nom d’utilisateur et mot de passe requis'}), 400

    db = get_db()
    cursor = db.cursor()
    try:
        cursor.execute('INSERT INTO users (username, password_hash) VALUES (?, ?)',
                       (username, generate_password_hash(password)))
        db.commit()
        user_id = cursor.lastrowid
        session['user_id'] = user_id
        session['username'] = username
        return jsonify({'success': True, 'username': username})
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Ce nom d’utilisateur existe déjà'}), 400
    finally:
        db.close()

@app.route('/api/login', methods=['POST'])
def login():
    """Connecte un utilisateur en vérifiant les identifiants."""
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Nom d’utilisateur et mot de passe requis'}), 400

    db = get_db()
    cursor = db.cursor()
    cursor.execute('SELECT id, password_hash FROM users WHERE username = ?', (username,))
    user = cursor.fetchone()
    db.close()

    if user and check_password_hash(user['password_hash'], password):
        session['user_id'] = user['id']
        session['username'] = username
        return jsonify({'success': True, 'username': username})
    else:
        return jsonify({'error': 'Identifiants incorrects'}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    """Déconnecte l'utilisateur en effaçant la session."""
    session.clear()
    return jsonify({'success': True})

@app.route('/api/me', methods=['GET'])
def me():
    """Vérifie si l'utilisateur est connecté et retourne ses infos."""
    if 'user_id' in session:
        return jsonify({'authenticated': True, 'username': session['username']})
    else:
        return jsonify({'authenticated': False})

# --- API Gestion des Abonnements ---

@app.route('/api/subscriptions', methods=['GET'])
@login_required
def get_subscriptions():
    """Récupère tous les abonnements de l'utilisateur connecté."""
    db = get_db()
    cursor = db.cursor()
    cursor.execute('SELECT id, name, price, cycle, icon, shared, next_billing_date FROM subscriptions WHERE user_id = ?',
                   (session['user_id'],))
    rows = cursor.fetchall()
    db.close()
    subscriptions = [dict(row) for row in rows]
    return jsonify(subscriptions)

@app.route('/api/subscriptions', methods=['POST'])
@login_required
def add_subscription():
    """Ajoute un nouvel abonnement pour l'utilisateur connecté."""
    data = request.get_json()
    name = data.get('name')
    price = data.get('price')
    cycle = data.get('cycle')
    icon = data.get('icon')
    shared = data.get('shared', 0)
    next_billing_date = data.get('next_billing_date')

    if not name or price is None or not cycle:
        return jsonify({'error': 'Données incomplètes'}), 400

    db = get_db()
    cursor = db.cursor()
    cursor.execute('''
        INSERT INTO subscriptions (user_id, name, price, cycle, icon, shared, next_billing_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (session['user_id'], name, price, cycle, icon, shared, next_billing_date))
    db.commit()
    sub_id = cursor.lastrowid
    db.close()
    return jsonify({'success': True, 'id': sub_id})

@app.route('/api/subscriptions/<int:sub_id>', methods=['DELETE'])
@login_required
def delete_subscription(sub_id):
    """Supprime un abonnement spécifique (seulement si appartient à l'utilisateur)."""
    db = get_db()
    cursor = db.cursor()
    cursor.execute('DELETE FROM subscriptions WHERE id = ? AND user_id = ?',
                   (sub_id, session['user_id']))
    db.commit()
    deleted = cursor.rowcount
    db.close()
    if deleted:
        return jsonify({'success': True})
    else:
        return jsonify({'error': 'Abonnement non trouvé'}), 404

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=False)