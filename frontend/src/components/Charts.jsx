import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Charts.css';

export default function Charts({ analytics }) {
  if (!analytics) {
    return <div className="loading">Loading analytics...</div>;
  }

  const { distribution, daily_breakdown, insights } = analytics;

  if (!insights || insights.total_events === 0) {
    return (
      <div className="empty-analytics">
        <div className="empty-icon">📊</div>
        <h3>No analytics data yet</h3>
        <p>Create events (meetings/tasks) to see your statistics.</p>
      </div>
    );
  }

  const pieData = [
    { name: 'Meetings', value: distribution.meeting_hours, percentage: distribution.meeting_percentage },
    { name: 'Tasks', value: distribution.task_hours, percentage: distribution.task_percentage },
  ];
  const COLORS = ['#6366f1', '#10b981'];

  const renderCustomLabel = ({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`;

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <h1>Analytics Dashboard</h1>
        <p>Track your productivity and time distribution</p>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-purple">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <span className="stat-label">Total Events</span>
            <span className="stat-value">{insights.total_events}</span>
          </div>
        </div>
        <div className="stat-card stat-pink">
          <div className="stat-icon">🎥</div>
          <div className="stat-info">
            <span className="stat-label">Meetings</span>
            <span className="stat-value">{insights.total_meetings}</span>
          </div>
        </div>
        <div className="stat-card stat-green">
          <div className="stat-icon">✓</div>
          <div className="stat-info">
            <span className="stat-label">Tasks</span>
            <span className="stat-value">{insights.total_tasks}</span>
          </div>
        </div>
        <div className="stat-card stat-orange">
          <div className="stat-icon">⏱️</div>
          <div className="stat-info">
            <span className="stat-label">Utilization</span>
            <span className="stat-value">{insights.this_week.utilization_rate}%</span>
          </div>
        </div>
      </div>

      {/* Weekly Summary */}
      <div className="weekly-card">
        <h3>This Week Overview</h3>
        <div className="weekly-stats">
          <div className="weekly-item">
            <span>Meetings</span>
            <strong>{insights.this_week.meeting_hours}h</strong>
          </div>
          <div className="weekly-item">
            <span>Tasks</span>
            <strong>{insights.this_week.task_hours}h</strong>
          </div>
          <div className="weekly-item">
            <span>Busy</span>
            <strong>{insights.this_week.busy_hours}h</strong>
          </div>
          <div className="weekly-item">
            <span>Free</span>
            <strong>{insights.this_week.free_hours}h</strong>
          </div>
        </div>
      </div>

      {/* Charts Grid – Two columns */}
      <div className="charts-grid">
        {distribution.total_hours > 0 && (
          <div className="chart-card">
            <h3>Time Distribution</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={80}
                  dataKey="value"
                >
                  {pieData.map((_, idx) => (
                    <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => `${val.toFixed(1)}h`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pie-legend">
              <div><span className="legend-dot indigo"></span> Meetings: {distribution.meeting_hours}h ({distribution.meeting_percentage}%)</div>
              <div><span className="legend-dot emerald"></span> Tasks: {distribution.task_hours}h ({distribution.task_percentage}%)</div>
            </div>
          </div>
        )}

        {daily_breakdown && daily_breakdown.length > 0 && (
          <div className="chart-card">
            <h3>Daily Breakdown (Trend)</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={daily_breakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip labelFormatter={(d) => new Date(d).toLocaleDateString()} formatter={(v) => `${v.toFixed(1)}h`} />
                <Legend />
                <Line type="monotone" dataKey="meeting_hours" stroke="#6366f1" strokeWidth={2} name="Meetings" dot={{ fill: '#6366f1' }} />
                <Line type="monotone" dataKey="task_hours" stroke="#10b981" strokeWidth={2} name="Tasks" dot={{ fill: '#10b981' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {daily_breakdown && daily_breakdown.length > 0 && (
          <div className="chart-card full-width">
            <h3>Hours per Day</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={daily_breakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip labelFormatter={(d) => new Date(d).toLocaleDateString()} formatter={(v) => `${v.toFixed(1)}h`} />
                <Legend />
                <Bar dataKey="meeting_hours" stackId="a" fill="#6366f1" name="Meetings" />
                <Bar dataKey="task_hours" stackId="a" fill="#10b981" name="Tasks" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}