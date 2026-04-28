from datetime import datetime, timedelta
from db import get_db_connection

class AnalyticsService:

    @staticmethod
    def calculate_duration_hours(start_time, end_time):
        try:
            start = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
            end = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
        except ValueError:
            try:
                start_base = start_time.split('.')[0]
                end_base = end_time.split('.')[0]
                if len(start_base) == 16:
                    start_base += ':00'
                if len(end_base) == 16:
                    end_base += ':00'
                start = datetime.fromisoformat(start_base.replace('Z', '+00:00'))
                end = datetime.fromisoformat(end_base.replace('Z', '+00:00'))
            except Exception:
                print(f"Failed to parse dates: start={start_time}, end={end_time}")
                return 0.0
        duration = end - start
        return duration.total_seconds() / 3600

    def get_time_distribution(self, start_date=None, end_date=None, provider_id=None):
        conn = get_db_connection()
        cursor = conn.cursor()

        query = 'SELECT event_type, start_time, end_time FROM events WHERE 1=1'
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

    def get_daily_breakdown(self, days=7, provider_id=None):
        conn = get_db_connection()
        cursor = conn.cursor()

        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=days-1)

        query = '''
            SELECT date(start_time) as day, event_type, start_time, end_time
            FROM events
            WHERE date(start_time) >= ? AND date(start_time) <= ?
        '''
        params = [start_date.isoformat(), end_date.isoformat()]
        if provider_id:
            query += ' AND provider_id = ?'
            params.append(provider_id)
        query += ' ORDER BY day'

        cursor.execute(query, params)
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

    def get_insights(self, provider_id=None):
        conn = get_db_connection()
        cursor = conn.cursor()

        # Total events
        query_total = 'SELECT COUNT(*) as count FROM events WHERE 1=1'
        params_total = []
        if provider_id:
            query_total += ' AND provider_id = ?'
            params_total.append(provider_id)
        cursor.execute(query_total, params_total)
        total_events = cursor.fetchone()['count']

        # Events by type
        query_type = 'SELECT event_type, COUNT(*) as count FROM events WHERE 1=1'
        if provider_id:
            query_type += ' AND provider_id = ?'
            cursor.execute(query_type, (provider_id,))
        else:
            cursor.execute(query_type)
        events_by_type = {row['event_type']: row['count'] for row in cursor.fetchall()}

        # This week's events
        week_start = (datetime.now() - timedelta(days=datetime.now().weekday())).date().isoformat()
        week_end = datetime.now().date().isoformat()
        week_query = '''
            SELECT event_type, start_time, end_time
            FROM events
            WHERE date(start_time) >= ? AND date(start_time) <= ?
        '''
        week_params = [week_start, week_end]
        if provider_id:
            week_query += ' AND provider_id = ?'
            week_params.append(provider_id)
        cursor.execute(week_query, week_params)
        week_events = cursor.fetchall()
        conn.close()

        week_meeting_hours = 0
        week_task_hours = 0
        for event in week_events:
            duration = self.calculate_duration_hours(event['start_time'], event['end_time'])
            if event['event_type'] == 'meeting':
                week_meeting_hours += duration
            else:
                week_task_hours += duration

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