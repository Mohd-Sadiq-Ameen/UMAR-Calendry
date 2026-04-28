from datetime import datetime
from flask import jsonify

def success_response(data, message="Success", status_code=200):
    """Create a standardized success response"""
    return jsonify({
        'success': True,
        'message': message,
        'data': data
    }), status_code

def error_response(message, status_code=400, errors=None):
    """Create a standardized error response"""
    response = {
        'success': False,
        'message': message
    }
    if errors:
        response['errors'] = errors
    return jsonify(response), status_code

def validate_event_data(data, required_fields=None):
    """
    Validate event data
    
    Args:
        data: Dictionary containing event data
        required_fields: List of required field names
    
    Returns:
        tuple: (is_valid, errors)
    """
    if required_fields is None:
        required_fields = ['title', 'event_type', 'start_time', 'end_time']
    
    errors = []
    
    # Check required fields
    for field in required_fields:
        if field not in data or not data[field]:
            errors.append(f"{field} is required")
    
    # Validate event type
    if 'event_type' in data and data['event_type'] not in ['meeting', 'task']:
        errors.append("event_type must be 'meeting' or 'task'")
    
    # Validate datetime format
    for field in ['start_time', 'end_time']:
        if field in data and data[field]:
            try:
                datetime.fromisoformat(data[field].replace('Z', '+00:00'))
            except ValueError:
                errors.append(f"{field} must be a valid ISO format datetime")
    
    # Validate end_time is after start_time
    if 'start_time' in data and 'end_time' in data and data['start_time'] and data['end_time']:
        try:
            start = datetime.fromisoformat(data['start_time'].replace('Z', '+00:00'))
            end = datetime.fromisoformat(data['end_time'].replace('Z', '+00:00'))
            if end <= start:
                errors.append("end_time must be after start_time")
        except ValueError:
            pass
    
    return len(errors) == 0, errors