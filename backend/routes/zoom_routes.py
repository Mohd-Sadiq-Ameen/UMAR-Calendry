from flask import Blueprint, request
from services.zoom_service import zoom_service
from helpers import success_response, error_response
from datetime import datetime

zoom_bp = Blueprint('zoom', __name__)

@zoom_bp.route('/zoom/create', methods=['POST'])
def create_zoom_meeting():
    """
    Create a Zoom meeting
    
    Expected JSON body:
    {
        "topic": "Meeting title",
        "start_time": "2024-01-01T10:00:00Z",
        "duration": 60  (optional, default 60 minutes)
    }
    """
    data = request.get_json()
    
    # Validate required fields
    if not data.get('topic'):
        return error_response("topic is required", 400)
    
    if not data.get('start_time'):
        return error_response("start_time is required", 400)
    
    # Validate start_time format
    try:
        datetime.fromisoformat(data['start_time'].replace('Z', '+00:00'))
    except ValueError:
        return error_response("start_time must be a valid ISO format datetime", 400)
    
    duration = data.get('duration', 60)
    
    try:
        # Create Zoom meeting
        meeting_data = zoom_service.create_meeting(
            topic=data['topic'],
            start_time=data['start_time'],
            duration_minutes=duration
        )
        
        # Return relevant meeting info
        response_data = {
            'zoom_link': meeting_data.get('join_url'),
            'zoom_meeting_id': str(meeting_data.get('id')),
            'topic': meeting_data.get('topic'),
            'start_time': meeting_data.get('start_time'),
            'duration': meeting_data.get('duration'),
            'mock': meeting_data.get('mock', False)
        }
        
        message = "Zoom meeting created successfully"
        if response_data.get('mock'):
            message = "Mock Zoom meeting created (Zoom API not configured)"
        
        return success_response(response_data, message, 201)
    
    except Exception as e:
        return error_response(f"Failed to create Zoom meeting: {str(e)}", 500)

@zoom_bp.route('/zoom/delete/<meeting_id>', methods=['DELETE'])
def delete_zoom_meeting(meeting_id):
    """Delete a Zoom meeting"""
    try:
        result = zoom_service.delete_meeting(meeting_id)
        
        message = "Zoom meeting deleted successfully"
        if result.get('mock'):
            message = "Mock Zoom meeting deleted"
        
        return success_response(
            {'meeting_id': meeting_id, 'deleted': True},
            message
        )
    
    except Exception as e:
        return error_response(f"Failed to delete Zoom meeting: {str(e)}", 500)

@zoom_bp.route('/zoom/status', methods=['GET'])
def zoom_status():
    """Check if Zoom API is configured"""
    from config import Config
    
    is_configured = all([
        Config.ZOOM_CLIENT_ID,
        Config.ZOOM_CLIENT_SECRET,
        Config.ZOOM_ACCOUNT_ID
    ])
    
    return success_response({
        'configured': is_configured,
        'message': 'Zoom API is configured' if is_configured else 'Zoom API not configured. Using mock mode.'
    })