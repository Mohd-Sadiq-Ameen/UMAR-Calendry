from flask import Blueprint, request, jsonify
from db import get_db_connection
from werkzeug.security import generate_password_hash, check_password_hash
import re

auth_bp = Blueprint('auth', __name__)

def is_valid_email(email):
    return re.match(r"[^@]+@[^@]+\.[^@]+", email)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    full_name = data.get('full_name', '')
    role = data.get('role', 'customer')  # 'customer' or 'provider'
    
    if not email or not password:
        return jsonify({'success': False, 'message': 'Email and password required'}), 400
    if not is_valid_email(email):
        return jsonify({'success': False, 'message': 'Invalid email format'}), 400
    if len(password) < 6:
        return jsonify({'success': False, 'message': 'Password must be at least 6 characters'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if user already exists
    cursor.execute('SELECT id FROM users WHERE email = ?', (email,))
    if cursor.fetchone():
        conn.close()
        return jsonify({'success': False, 'message': 'Email already registered'}), 400
    
    # Hash password
    password_hash = generate_password_hash(password)
    
    # Insert user
    cursor.execute('''
        INSERT INTO users (email, password_hash, full_name, role)
        VALUES (?, ?, ?, ?)
    ''', (email, password_hash, full_name, role))
    user_id = cursor.lastrowid
    conn.commit()
    
    # If role is provider, create an empty provider record (to be filled later)
    provider_id = None
    if role == 'provider':
        # Generate a temporary user_id from email
        temp_user_id = email.split('@')[0]
        cursor.execute('''
            INSERT INTO providers (user_id, name, email, service_type, service_name, price)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (temp_user_id, full_name or email, email, 'teacher', 'Consultation', 500))
        provider_id = cursor.lastrowid
        # Update user with provider_id
        cursor.execute('UPDATE users SET provider_id = ? WHERE id = ?', (provider_id, user_id))
        conn.commit()
    
    conn.close()
    
    return jsonify({
        'success': True,
        'message': 'Registration successful',
        'user_id': user_id,
        'role': role,
        'provider_id': provider_id
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'success': False, 'message': 'Email and password required'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT id, email, password_hash, role, provider_id 
        FROM users WHERE email = ?
    ''', (email,))
    user = cursor.fetchone()
    conn.close()
    
    if not user:
        return jsonify({'success': False, 'message': 'Invalid email or password'}), 401
    
    if not check_password_hash(user['password_hash'], password):
        return jsonify({'success': False, 'message': 'Invalid email or password'}), 401
    
    return jsonify({
        'success': True,
        'message': 'Login successful',
        'user': {
            'id': user['id'],
            'email': user['email'],
            'role': user['role'],
            'provider_id': user['provider_id']
        }
    }), 200