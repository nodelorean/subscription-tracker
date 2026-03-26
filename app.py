import sqlite3
import re
from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
from dotenv import load_dotenv
import os

#Configuration de l'application
app = Flask(__name__)
load_dotenv()
app.secret_key = os.environ.get("SECRET_KEY")  # Clé pour sécuriser les sessions utilisateur

DATABASE = 'database.db'

# Gestion de la base de données
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
        # Table des utilisateurs avec email
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
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
                category TEXT DEFAULT 'other',
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
        try:
            cursor.execute('ALTER TABLE users ADD COLUMN email TEXT UNIQUE')
        except:
            pass
        try:
            cursor.execute('ALTER TABLE subscriptions ADD COLUMN category TEXT DEFAULT "other"')
        except:
            pass
            
        db.commit()
        db.close()

init_db()

#Validation d'email
def is_valid_email(email):
    """Vérifie si l'adresse email a un format valide."""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(pattern, email):
        return False
    # Domaines courants acceptés
    valid_domains = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'orange.fr', 
                     'free.fr', 'live.fr', 'wanadoo.fr', 'sfr.fr', 'laposte.net',
                     'protonmail.com', 'icloud.com', 'aol.com', 'mail.com']
    domain = email.split('@')[1].lower()
    return domain in valid_domains

# Sécurité et Décorateurs
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

#API Authentification

@app.route('/api/register', methods=['POST'])
def register():
    """Inscrire un nouvel utilisateur avec email, username et mot de passe."""
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    # Validation des champs
    if not username or not email or not password:
        return jsonify({'error': 'Nom d\'utilisateur, email et mot de passe requis'}), 400
    
    # Validation du nom d'utilisateur (3-20 caractères)
    if len(username) < 3 or len(username) > 20:
        return jsonify({'error': 'Le nom d\'utilisateur doit contenir entre 3 et 20 caractères'}), 400
    
    # Validation de l'email
    if not is_valid_email(email):
        return jsonify({'error': 'Adresse email invalide. Utilisez gmail, hotmail, outlook, etc.'}), 400
    
    # Validation du mot de passe (minimum 6 caractères)
    if len(password) < 6:
        return jsonify({'error': 'Le mot de passe doit contenir au moins 6 caractères'}), 400

    db = get_db()
    cursor = db.cursor()
    try:
        # Vérifier si le username existe déjà
        cursor.execute('SELECT id FROM users WHERE username = ?', (username,))
        if cursor.fetchone():
            return jsonify({'error': 'Ce nom d\'utilisateur existe déjà'}), 400
        
        # Vérifier si l'email existe déjà
        cursor.execute('SELECT id FROM users WHERE email = ?', (email,))
        if cursor.fetchone():
            return jsonify({'error': 'Cette adresse email est déjà utilisée'}), 400
        
        cursor.execute('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
                       (username, email, generate_password_hash(password)))
        db.commit()
        user_id = cursor.lastrowid
        session['user_id'] = user_id
        session['username'] = username
        session['email'] = email
        return jsonify({'success': True, 'username': username, 'email': email})
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Ce compte existe déjà'}), 400
    finally:
        db.close()

@app.route('/api/login', methods=['POST'])
def login():
    """Connecte un utilisateur avec email/username et mot de passe."""
    data = request.get_json()
    login_identifier = data.get('login')  # Peut être username ou email
    password = data.get('password')

    if not login_identifier or not password:
        return jsonify({'error': 'Email et mot de passe requis'}), 400

    db = get_db()
    cursor = db.cursor()
    # Recherche par email OU username
    cursor.execute('SELECT id, username, email, password_hash FROM users WHERE email = ? OR username = ?', 
                   (login_identifier, login_identifier))
    user = cursor.fetchone()
    db.close()

    if user and check_password_hash(user['password_hash'], password):
        session['user_id'] = user['id']
        session['username'] = user['username']
        session['email'] = user['email']
        return jsonify({'success': True, 'username': user['username'], 'email': user['email']})
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
        return jsonify({'authenticated': True, 'username': session['username'], 'email': session.get('email', '')})
    else:
        return jsonify({'authenticated': False})

#API Gestion des Abonnements

@app.route('/api/subscriptions', methods=['GET'])
@login_required
def get_subscriptions():
    """Récupère tous les abonnements de l'utilisateur connecté."""
    db = get_db()
    cursor = db.cursor()
    cursor.execute('SELECT id, name, price, cycle, icon, shared, next_billing_date, category FROM subscriptions WHERE user_id = ?',
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
    category = data.get('category', 'other')

    if not name or price is None or not cycle:
        return jsonify({'error': 'Données incomplètes'}), 400

    db = get_db()
    cursor = db.cursor()
    cursor.execute('''
        INSERT INTO subscriptions (user_id, name, price, cycle, icon, shared, next_billing_date, category)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (session['user_id'], name, price, cycle, icon, shared, next_billing_date, category))
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