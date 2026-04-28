from flask import Blueprint, request
from db import get_db_connection
from helpers import success_response, error_response
import uuid
from datetime import datetime

providers_bp = Blueprint('providers', __name__)

@providers_bp.route('/providers', methods=['GET'])
def get_providers():
    """Get all providers"""
    service_type = request.args.get('service_type')
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = 'SELECT * FROM providers WHERE 1=1'
    params = []
    
    if service_type:
        query += ' AND service_type = ?'
        params.append(service_type)
    
    query += ' ORDER BY created_at DESC'
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    
    providers = [dict(row) for row in rows]
    return success_response(providers, f"Retrieved {len(providers)} providers")

@providers_bp.route('/providers/<int:provider_id>', methods=['GET'])
def get_provider(provider_id):
    """Get a single provider"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM providers WHERE id = ?', (provider_id,))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        return error_response(f"Provider with ID {provider_id} not found", 404)
    
    return success_response(dict(row), "Provider retrieved successfully")

@providers_bp.route('/providers', methods=['POST'])
def create_provider():
    """Create a new provider (service provider registration)"""
    data = request.get_json()
    
    required_fields = ['user_id', 'name', 'email', 'service_type', 'service_name', 'price']
    for field in required_fields:
        if not data.get(field):
            return error_response(f"{field} is required", 400)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if user already exists
    cursor.execute('SELECT id FROM providers WHERE user_id = ?', (data['user_id'],))
    if cursor.fetchone():
        conn.close()
        return error_response("Provider with this user_id already exists", 400)
    
    cursor.execute('''
        INSERT INTO providers (user_id, name, email, service_type, service_name, price, description, duration, zoom_account_id, city)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        data['user_id'],
        data['name'],
        data['email'],
        data['service_type'],
        data['service_name'],
        data['price'],
        data.get('description', ''),
        data.get('duration', 60),
        data.get('zoom_account_id'),
        data.get('city', '')
    ))
    
    provider_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return success_response({'id': provider_id}, "Provider created successfully", 201)

@providers_bp.route('/providers/<int:provider_id>', methods=['PUT'])
def update_provider(provider_id):
    """Update provider details"""
    data = request.get_json()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT id FROM providers WHERE id = ?', (provider_id,))
    if not cursor.fetchone():
        conn.close()
        return error_response(f"Provider with ID {provider_id} not found", 404)
    
    update_fields = []
    params = []
    
    allowed_fields = ['name', 'email', 'service_type', 'service_name', 'price', 'description', 'duration', 'zoom_account_id', 'city']
    
    for field in allowed_fields:
        if field in data:
            update_fields.append(f"{field} = ?")
            params.append(data[field])
    
    if not update_fields:
        conn.close()
        return error_response("No valid fields to update", 400)
    
    update_fields.append("updated_at = ?")
    params.append(datetime.utcnow().isoformat())
    params.append(provider_id)
    
    query = f"UPDATE providers SET {', '.join(update_fields)} WHERE id = ?"
    cursor.execute(query, params)
    conn.commit()
    conn.close()
    
    return success_response({'id': provider_id}, "Provider updated successfully")