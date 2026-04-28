from datetime import datetime

class Event:
    def __init__(self, id=None, title='', description='', event_type='task', 
                 start_time='', end_time='', zoom_link=None, zoom_meeting_id=None,
                 created_at=None, updated_at=None):
        self.id = id
        self.title = title
        self.description = description
        self.event_type = event_type
        self.start_time = start_time
        self.end_time = end_time
        self.zoom_link = zoom_link
        self.zoom_meeting_id = zoom_meeting_id
        self.created_at = created_at or datetime.utcnow().isoformat()
        self.updated_at = updated_at or datetime.utcnow().isoformat()
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'event_type': self.event_type,
            'start_time': self.start_time,
            'end_time': self.end_time,
            'zoom_link': self.zoom_link,
            'zoom_meeting_id': self.zoom_meeting_id,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }
    
    @staticmethod
    def from_dict(data):
        return Event(**data)
    
    @staticmethod
    def from_db_row(row):
        return Event(
            id=row['id'],
            title=row['title'],
            description=row['description'],
            event_type=row['event_type'],
            start_time=row['start_time'],
            end_time=row['end_time'],
            zoom_link=row['zoom_link'],
            zoom_meeting_id=row['zoom_meeting_id'],
            created_at=row['created_at'],
            updated_at=row['updated_at']
        )