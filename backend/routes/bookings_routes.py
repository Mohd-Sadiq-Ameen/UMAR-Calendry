from flask import Blueprint, request
from db import get_db_connection
from services.zoom_service import zoom_service
from helpers import success_response, error_response
import uuid
from datetime import datetime

bookings_bp = Blueprint('bookings', __name__)

@bookings_bp.route('/bookings', methods=['POST'])
def create_booking():
    """Create a new booking"""
    data = request.get_json()
    
    required_fields = ['provider_id', 'customer_name', 'customer_email', 'booking_date', 'booking_time']
    for field in required_fields:
        if not data.get(field):
            return error_response(f"{field} is required", 400)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get provider details
    cursor.execute('SELECT * FROM providers WHERE id = ?', (data['provider_id'],))
    provider = cursor.fetchone()
    
    if not provider:
        conn.close()
        return error_response("Provider not found", 404)
    
    # Generate booking ID
    booking_id = f"BN-{uuid.uuid4().hex[:8].upper()}"
    
    # Create Zoom meeting
    meeting_topic = f"{provider['service_name']} with {provider['name']}"
    start_time = f"{data['booking_date']}T{data['booking_time']}:00"
    
    try:
        meeting_data = zoom_service.create_meeting(
            topic=meeting_topic,
            start_time=start_time,
            duration_minutes=provider['duration']
        )
        zoom_link = meeting_data.get('join_url')
        zoom_meeting_id = str(meeting_data.get('id'))
    except Exception as e:
        zoom_link = None
        zoom_meeting_id = None
    
    # Create event first
    event_start = f"{data['booking_date']}T{data['booking_time']}:00"
    event_end = f"{data['booking_date']}T{data['booking_time']}:{provider['duration']}"
    
    cursor.execute('''
        INSERT INTO events (title, description, event_type, start_time, end_time, zoom_link, zoom_meeting_id, provider_id, booking_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        meeting_topic,
        f"Booking with {provider['name']} - {provider['service_name']}",
        'meeting',
        event_start,
        event_end,
        zoom_link,
        zoom_meeting_id,
        provider['id'],
        booking_id
    ))
    
    event_id = cursor.lastrowid
    
    # Create booking
    cursor.execute('''
        INSERT INTO bookings (booking_id, provider_id, customer_name, customer_email, customer_phone, event_id, booking_date, booking_time, zoom_link, zoom_meeting_id, amount)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        booking_id,
        provider['id'],
        data['customer_name'],
        data['customer_email'],
        data.get('customer_phone'),
        event_id,
        data['booking_date'],
        data['booking_time'],
        zoom_link,
        zoom_meeting_id,
        provider['price']
    ))
    
    conn.commit()
    conn.close()
    
    response_data = {
        'booking_id': booking_id,
        'zoom_link': zoom_link,
        'zoom_meeting_id': zoom_meeting_id,
        'provider_name': provider['name'],
        'service_name': provider['service_name'],
        'price': provider['price'],
        'date': data['booking_date'],
        'time': data['booking_time']
    }
    
    return success_response(response_data, "Booking created successfully", 201)

@bookings_bp.route('/bookings/<booking_id>', methods=['GET'])
def get_booking(booking_id):
    """Get booking details"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT b.*, p.name as provider_name, p.service_name, p.price as provider_price
        FROM bookings b
        JOIN providers p ON b.provider_id = p.id
        WHERE b.booking_id = ?
    ''', (booking_id,))
    
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        return error_response(f"Booking with ID {booking_id} not found", 404)
    
    return success_response(dict(row), "Booking retrieved successfully")