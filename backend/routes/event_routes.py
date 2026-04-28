from flask import Blueprint, request
from db import get_db_connection
from models.event_model import Event
from helpers import success_response, error_response, validate_event_data
from datetime import datetime

event_bp = Blueprint('events', __name__)

@event_bp.route('/events', methods=['GET'])
def get_events():
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    event_type = request.args.get('event_type')
    provider_id = request.args.get('provider_id')          # <-- NEW

    conn = get_db_connection()
    cursor = conn.cursor()

    query = 'SELECT * FROM events WHERE 1=1'
    params = []

    if provider_id:
        query += ' AND provider_id = ?'
        params.append(provider_id)
    if start_date:
        query += ' AND date(start_time) >= ?'
        params.append(start_date)
    if end_date:
        query += ' AND date(start_time) <= ?'
        params.append(end_date)
    if event_type:
        query += ' AND event_type = ?'
        params.append(event_type)

    query += ' ORDER BY start_time ASC'

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    events = [Event.from_db_row(row).to_dict() for row in rows]
    return success_response(events, f"Retrieved {len(events)} events")

@event_bp.route('/events/<int:event_id>', methods=['GET'])
def get_event(event_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM events WHERE id = ?', (event_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return error_response(f"Event with ID {event_id} not found", 404)
    event = Event.from_db_row(row).to_dict()
    return success_response(event, "Event retrieved successfully")

@event_bp.route('/events', methods=['POST'])
def create_event():
    data = request.get_json()
    is_valid, errors = validate_event_data(data)
    if not is_valid:
        return error_response("Validation failed", 400, errors)

    conn = get_db_connection()
    cursor = conn.cursor()

    provider_id = data.get('provider_id')                 # <-- NEW

    cursor.execute('''
        INSERT INTO events (title, description, event_type, start_time, end_time, zoom_link, zoom_meeting_id, provider_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        data['title'],
        data.get('description', ''),
        data['event_type'],
        data['start_time'],
        data['end_time'],
        data.get('zoom_link'),
        data.get('zoom_meeting_id'),
        provider_id
    ))

    event_id = cursor.lastrowid
    conn.commit()

    cursor.execute('SELECT * FROM events WHERE id = ?', (event_id,))
    row = cursor.fetchone()
    conn.close()

    event = Event.from_db_row(row).to_dict()
    return success_response(event, "Event created successfully", 201)

@event_bp.route('/events/<int:event_id>', methods=['PUT'])
def update_event(event_id):
    data = request.get_json()
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('SELECT * FROM events WHERE id = ?', (event_id,))
    if not cursor.fetchone():
        conn.close()
        return error_response(f"Event with ID {event_id} not found", 404)

    update_fields = []
    params = []
    allowed_fields = ['title', 'description', 'event_type', 'start_time', 'end_time', 'zoom_link', 'zoom_meeting_id', 'provider_id']

    for field in allowed_fields:
        if field in data:
            update_fields.append(f"{field} = ?")
            params.append(data[field])

    if not update_fields:
        conn.close()
        return error_response("No valid fields to update", 400)

    update_fields.append("updated_at = ?")
    params.append(datetime.utcnow().isoformat())
    params.append(event_id)

    query = f"UPDATE events SET {', '.join(update_fields)} WHERE id = ?"
    cursor.execute(query, params)
    conn.commit()

    cursor.execute('SELECT * FROM events WHERE id = ?', (event_id,))
    row = cursor.fetchone()
    conn.close()

    event = Event.from_db_row(row).to_dict()
    return success_response(event, "Event updated successfully")

@event_bp.route('/events/<int:event_id>', methods=['DELETE'])
def delete_event(event_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM events WHERE id = ?', (event_id,))
    if not cursor.fetchone():
        conn.close()
        return error_response(f"Event with ID {event_id} not found", 404)
    cursor.execute('DELETE FROM events WHERE id = ?', (event_id,))
    conn.commit()
    conn.close()
    return success_response({'id': event_id, 'deleted': True}, "Event deleted successfully")