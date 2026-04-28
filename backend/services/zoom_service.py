import requests
import base64
from datetime import datetime, timedelta
from config import Config

class ZoomService:
    BASE_URL = "https://api.zoom.us/v2"
    TOKEN_URL = "https://zoom.us/oauth/token"
    
    def __init__(self):
        self.client_id = Config.ZOOM_CLIENT_ID
        self.client_secret = Config.ZOOM_CLIENT_SECRET
        self.account_id = Config.ZOOM_ACCOUNT_ID
        self._access_token = None
        self._token_expires_at = None
    
    def _get_access_token(self):
        if self._access_token and self._token_expires_at:
            if datetime.now() < self._token_expires_at:
                return self._access_token
        
        if not all([self.client_id, self.client_secret, self.account_id]):
            raise ValueError("Zoom API credentials not configured")
        
        auth_string = f"{self.client_id}:{self.client_secret}"
        auth_bytes = auth_string.encode('utf-8')
        auth_base64 = base64.b64encode(auth_bytes).decode('utf-8')
        
        headers = {
            'Authorization': f'Basic {auth_base64}',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        
        data = {
            'grant_type': 'account_credentials',
            'account_id': self.account_id
        }
        
        response = requests.post(self.TOKEN_URL, headers=headers, data=data)
        
        if response.status_code != 200:
            raise Exception(f"Failed to get Zoom access token: {response.text}")
        
        token_data = response.json()
        self._access_token = token_data['access_token']
        expires_in = token_data.get('expires_in', 3600)
        self._token_expires_at = datetime.now() + timedelta(seconds=expires_in - 300)
        
        return self._access_token
    
    def create_meeting(self, topic, start_time, duration_minutes=60):
        try:
            token = self._get_access_token()
        except Exception:
            return {
                'join_url': f'https://zoom.us/j/mock-meeting-{abs(hash(topic)) % 1000000000}',
                'id': f'mock-{abs(hash(topic)) % 1000000000}',
                'topic': topic,
                'start_time': start_time,
                'duration': duration_minutes,
                'mock': True
            }
        
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
        
        dt = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
        zoom_start_time = dt.strftime('%Y-%m-%dT%H:%M:%S')
        
        data = {
            'topic': topic,
            'type': 2,
            'start_time': zoom_start_time,
            'duration': duration_minutes,
            'timezone': 'UTC',
            'settings': {
                'host_video': True,
                'participant_video': True,
                'join_before_host': True,
                'mute_upon_entry': False,
                'watermark': False,
                'audio': 'both',
                'auto_recording': 'none'
            }
        }
        
        response = requests.post(
            f"{self.BASE_URL}/users/me/meetings",
            headers=headers,
            json=data
        )
        
        if response.status_code not in [200, 201]:
            raise Exception(f"Failed to create Zoom meeting: {response.text}")
        
        return response.json()
    
    def delete_meeting(self, meeting_id):
        if not meeting_id or str(meeting_id).startswith('mock-'):
            return {'success': True, 'mock': True}
        
        try:
            token = self._get_access_token()
        except Exception:
            return {'success': True, 'mock': True}
        
        headers = {
            'Authorization': f'Bearer {token}'
        }
        
        response = requests.delete(
            f"{self.BASE_URL}/meetings/{meeting_id}",
            headers=headers
        )
        
        if response.status_code == 204:
            return {'success': True}
        else:
            raise Exception(f"Failed to delete Zoom meeting: {response.text}")

zoom_service = ZoomService()