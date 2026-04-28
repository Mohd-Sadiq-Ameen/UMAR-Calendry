from datetime import datetime, timedelta
from db import get_db_connection

class AnalyticsService:
    
    @staticmethod
    def calculate_duration_hours(start_time, end_time):
        start = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
        end = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
        duration = end - start
        return duration.total_seconds() / 3600
    
    def get_time_distribution(self, start_date=None, end_date=None):
        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = 'SELECT event_type, start_time, end_time FROM events WHERE 1=1'
        params = []
        
        if start_date:
            query += ' AND date(start_time) >= ?'
            params.append(start_date)
        
        if end_date:
            query += ' AND date(start_time) <= ?'
            params.append(end_date)
        
        cursor.execute(query, params)
        events = cursor.fetchall()
        conn.close()
        
        meeting_hours = 0
        task_hours = 0
        
        for event in events:
            duration = self.calculate_duration_hours(event['start_time'], event['end_time'])
            if event['event_type'] == 'meeting':
                meeting_hours += duration
            else:
                task_hours += duration
        
        total_hours = meeting_hours + task_hours
        
        return {
            'meeting_hours': round(meeting_hours, 2),
            'task_hours': round(task_hours, 2),
            'total_hours': round(total_hours, 2),
            'meeting_percentage': round((meeting_hours / total_hours * 100) if total_hours > 0 else 0, 1),
            'task_percentage': round((task_hours / total_hours * 100) if total_hours > 0 else 0, 1)
        }
    
    def get_daily_breakdown(self, days=7):
        conn = get_db_connection()
        cursor = conn.cursor()
        
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=days-1)
        
        cursor.execute('''
            SELECT date(start_time) as day, event_type, start_time, end_time
            FROM events
            WHERE date(start_time) >= ? AND date(start_time) <= ?
            ORDER BY day
        ''', (start_date.isoformat(), end_date.isoformat()))
        
        events = cursor.fetchall()
        conn.close()
        
        daily_data = {}
        current_date = start_date
        while current_date <= end_date:
            daily_data[current_date.isoformat()] = {
                'date': current_date.isoformat(),
                'meeting_hours': 0,
                'task_hours': 0,
                'total_hours': 0
            }
            current_date += timedelta(days=1)
        
        for event in events:
            day = event['day']
            duration = self.calculate_duration_hours(event['start_time'], event['end_time'])
            
            if day in daily_data:
                if event['event_type'] == 'meeting':
                    daily_data[day]['meeting_hours'] += duration
                else:
                    daily_data[day]['task_hours'] += duration
                daily_data[day]['total_hours'] += duration
        
        result = []
        for day_data in daily_data.values():
            result.append({
                'date': day_data['date'],
                'meeting_hours': round(day_data['meeting_hours'], 2),
                'task_hours': round(day_data['task_hours'], 2),
                'total_hours': round(day_data['total_hours'], 2)
            })
        
        return result
    
    def get_insights(self):
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT COUNT(*) as count FROM events')
        total_events = cursor.fetchone()['count']
        
        cursor.execute('''
            SELECT event_type, COUNT(*) as count 
            FROM events 
            GROUP BY event_type
        ''')
        events_by_type = {row['event_type']: row['count'] for row in cursor.fetchall()}
        
        week_start = (datetime.now() - timedelta(days=datetime.now().weekday())).date().isoformat()
        week_end = datetime.now().date().isoformat()
        
        cursor.execute('''
            SELECT event_type, start_time, end_time
            FROM events
            WHERE date(start_time) >= ? AND date(start_time) <= ?
        ''', (week_start, week_end))
        
        week_events = cursor.fetchall()
        week_meeting_hours = 0
        week_task_hours = 0
        
        for event in week_events:
            duration = self.calculate_duration_hours(event['start_time'], event['end_time'])
            if event['event_type'] == 'meeting':
                week_meeting_hours += duration
            else:
                week_task_hours += duration
        
        conn.close()
        
        work_days_this_week = min(datetime.now().weekday() + 1, 5)
        total_work_hours = work_days_this_week * 8
        busy_hours = week_meeting_hours + week_task_hours
        free_hours = max(0, total_work_hours - busy_hours)
        
        return {
            'total_events': total_events,
            'total_meetings': events_by_type.get('meeting', 0),
            'total_tasks': events_by_type.get('task', 0),
            'this_week': {
                'meeting_hours': round(week_meeting_hours, 2),
                'task_hours': round(week_task_hours, 2),
                'busy_hours': round(busy_hours, 2),
                'free_hours': round(free_hours, 2),
                'utilization_rate': round((busy_hours / total_work_hours * 100) if total_work_hours > 0 else 0, 1)
            }
        }

analytics_service = AnalyticsService()