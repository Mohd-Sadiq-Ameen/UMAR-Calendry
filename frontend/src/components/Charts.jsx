import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Charts({ analytics }) {
  if (!analytics) {
    return <div className="loading">Loading analytics...</div>;
  }

  const { distribution, daily_breakdown, insights } = analytics;

  // Prepare pie chart data
  const pieData = [
    { name: 'Meetings', value: distribution.meeting_hours, percentage: distribution.meeting_percentage },
    { name: 'Tasks', value: distribution.task_hours, percentage: distribution.task_percentage },
  ];

  const COLORS = ['#FF6B9D', '#4ECDC4'];

  // Custom label for pie chart
  const renderCustomLabel = ({ name, percentage }) => {
    return `${name}: ${percentage}%`;
  };

  return (
    <div className="charts-container">
      {/* Summary Cards */}
      <div className="stats-grid">
        <div className="stat-card meetings">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-label">Total Events</div>
            <div className="stat-value">{insights.total_events}</div>
          </div>
        </div>

        <div className="stat-card meetings">
          <div className="stat-icon">🎥</div>
          <div className="stat-content">
            <div className="stat-label">Meetings</div>
            <div className="stat-value">{insights.total_meetings}</div>
          </div>
        </div>

        <div className="stat-card tasks">
          <div className="stat-icon">✓</div>
          <div className="stat-content">
            <div className="stat-label">Tasks</div>
            <div className="stat-value">{insights.total_tasks}</div>
          </div>
        </div>

        <div className="stat-card utilization">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <div className="stat-label">Utilization</div>
            <div className="stat-value">{insights.this_week.utilization_rate}%</div>
          </div>
        </div>
      </div>

      {/* Weekly Summary */}
      <div className="chart-section">
        <h3>This Week Overview</h3>
        <div className="week-summary">
          <div className="summary-item">
            <span className="summary-label">Meetings</span>
            <span className="summary-value meetings">{insights.this_week.meeting_hours}h</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Tasks</span>
            <span className="summary-value tasks">{insights.this_week.task_hours}h</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Busy Time</span>
            <span className="summary-value busy">{insights.this_week.busy_hours}h</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Free Time</span>
            <span className="summary-value free">{insights.this_week.free_hours}h</span>
          </div>
        </div>
      </div>

      {/* Time Distribution Pie Chart */}
      {distribution.total_hours > 0 && (
        <div className="chart-section">
          <h3>Time Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value.toFixed(2)}h`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="distribution-summary">
            <div className="distribution-item">
              <span className="color-indicator" style={{ background: COLORS[0] }}></span>
              <span>Meetings: {distribution.meeting_hours}h ({distribution.meeting_percentage}%)</span>
            </div>
            <div className="distribution-item">
              <span className="color-indicator" style={{ background: COLORS[1] }}></span>
              <span>Tasks: {distribution.task_hours}h ({distribution.task_percentage}%)</span>
            </div>
          </div>
        </div>
      )}

      {/* Daily Breakdown Line Chart */}
      {daily_breakdown && daily_breakdown.length > 0 && (
        <div className="chart-section">
          <h3>Daily Time Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={daily_breakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                stroke="#666"
              />
              <YAxis stroke="#666" />
              <Tooltip 
                labelFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                formatter={(value) => `${value.toFixed(2)}h`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="meeting_hours" 
                stroke="#FF6B9D" 
                strokeWidth={2}
                name="Meetings"
                dot={{ fill: '#FF6B9D' }}
              />
              <Line 
                type="monotone" 
                dataKey="task_hours" 
                stroke="#4ECDC4" 
                strokeWidth={2}
                name="Tasks"
                dot={{ fill: '#4ECDC4' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Daily Breakdown Bar Chart */}
      {daily_breakdown && daily_breakdown.length > 0 && (
        <div className="chart-section">
          <h3>Hours per Day</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={daily_breakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="date"
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                stroke="#666"
              />
              <YAxis stroke="#666" />
              <Tooltip 
                labelFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                formatter={(value) => `${value.toFixed(2)}h`}
              />
              <Legend />
              <Bar dataKey="meeting_hours" stackId="a" fill="#FF6B9D" name="Meetings" />
              <Bar dataKey="task_hours" stackId="a" fill="#4ECDC4" name="Tasks" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}