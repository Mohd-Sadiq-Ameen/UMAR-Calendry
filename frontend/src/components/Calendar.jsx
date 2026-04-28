import { useState } from 'react';
import { 
  format, startOfWeek, endOfWeek, addDays, addWeeks, subWeeks,
  isSameDay, parseISO, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameMonth, getHours, setHours, setMinutes, isToday
} from 'date-fns';

export default function Calendar({ events, onEventClick, onDateClick }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const getEventsForDate = (date) => events.filter(e => isSameDay(parseISO(e.start_time), date))
    .sort((a,b) => new Date(a.start_time) - new Date(b.start_time));

  const getEventsForTimeSlot = (date, hour) => events.filter(e => {
    const d = parseISO(e.start_time);
    return isSameDay(d, date) && getHours(d) === hour;
  }).sort((a,b) => new Date(a.start_time) - new Date(b.start_time));

  const formatEventTime = (e) => `${format(parseISO(e.start_time), 'h:mm a')} - ${format(parseISO(e.end_time), 'h:mm a')}`;

  const handlePrevious = () => {
    if (view === 'month') setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    else if (view === 'week') setCurrentDate(subWeeks(currentDate, 1));
    else setSelectedDate(addDays(selectedDate, -1));
  };

  const handleNext = () => {
    if (view === 'month') setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    else if (view === 'week') setCurrentDate(addWeeks(currentDate, 1));
    else setSelectedDate(addDays(selectedDate, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const getCurrentPeriod = () => {
    if (view === 'month') return format(currentDate, 'MMMM yyyy');
    if (view === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      if (start.getMonth() === end.getMonth()) return `${format(start, 'MMMM d')} - ${format(end, 'd, yyyy')}`;
      return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
    }
    return format(selectedDate, 'EEEE, MMMM d, yyyy');
  };

  // Month View (uses your existing CSS classes)
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div className="month-view">
        <div className="weekdays-header">
          {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day => <div key={day} className="weekday">{day}</div>)}
        </div>
        <div className="calendar-grid">
          {days.map((day, idx) => {
            const dayEvents = getEventsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isTodayDate = isToday(day);
            const isSelected = isSameDay(day, selectedDate);
            return (
              <div key={idx}
                className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isTodayDate ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                onClick={() => onDateClick(day)}>
                <div className="day-number">{format(day, 'd')}</div>
                <div className="day-events">
                  {dayEvents.slice(0, 3).map(ev => (
                    <div key={ev.id} className={`event-badge ${ev.event_type}`} onClick={(e) => { e.stopPropagation(); onEventClick(ev); }}>
                      <span className="event-time-badge">{format(parseISO(ev.start_time), 'h:mm a')}</span>
                      <span className="event-title-badge">{ev.title}</span>
                    </div>
                  ))}
                  {dayEvents.length > 3 && <div className="more-events">+{dayEvents.length-3} more</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Week View (simplified but uses your CSS)
  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const hours = Array.from({ length: 24 }, (_, i) => i).slice(8,20); // 8am-8pm

    return (
      <div className="week-view-professional">
        <div className="week-header-professional">
          <div className="time-column-header">Time</div>
          {weekDays.map((day, i) => (
            <div key={i} className={`day-column-header ${isToday(day) ? 'today' : ''}`}>
              <div className="day-name">{format(day, 'EEE')}</div>
              <div className="day-date">{format(day, 'MMM d')}</div>
            </div>
          ))}
        </div>
        <div className="week-body-professional">
          {hours.map(hour => (
            <div key={hour} className="time-slot-row">
              <div className="time-label">{format(setHours(setMinutes(new Date(),0), hour), 'h a')}</div>
              <div className="time-slots">
                {weekDays.map((day, idx) => {
                  const slotEvents = getEventsForTimeSlot(day, hour);
                  return (
                    <div key={idx} className="time-slot-cell" onClick={() => onDateClick(setHours(setMinutes(day,0), hour))}>
                      {slotEvents.map(ev => (
                        <div key={ev.id} className={`time-slot-event ${ev.event_type}`} style={{ height: `${Math.min((new Date(ev.end_time)-new Date(ev.start_time))/60000/60*80, 200)}px` }}
                             onClick={(e) => { e.stopPropagation(); onEventClick(ev); }}>
                          <div className="event-time-slot">{formatEventTime(ev)}</div>
                          <div className="event-title-slot">{ev.title}</div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Day View (simplified)
  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i).slice(6,22);
    const dayEvents = getEventsForDate(selectedDate);
    return (
      <div className="day-view-professional">
        <div className="day-header-professional">
          <div className="day-large">{format(selectedDate, 'dddd')}</div>
          <div className="date-large">{format(selectedDate, 'MMMM d, yyyy')}</div>
          <div className="event-total">{dayEvents.length} events today</div>
        </div>
        <div className="day-timeline">
          {hours.map(hour => {
            const hourEvents = dayEvents.filter(e => getHours(parseISO(e.start_time)) === hour);
            return (
              <div key={hour} className="timeline-row">
                <div className="timeline-label">{format(setHours(setMinutes(new Date(),0), hour), 'h a')}</div>
                <div className="timeline-events">
                  {hourEvents.length ? hourEvents.map(ev => (
                    <div key={ev.id} className={`timeline-event ${ev.event_type}`} onClick={() => onEventClick(ev)}>
                      <div className="timeline-event-time">{formatEventTime(ev)}</div>
                      <div className="timeline-event-title">{ev.title}</div>
                      {ev.zoom_link && <div className="timeline-event-zoom">🎥 Zoom Meeting</div>}
                    </div>
                  )) : (
                    <div className="timeline-empty" onClick={() => onDateClick(setHours(setMinutes(selectedDate,0), hour))}>+ Add event</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <div className="calendar-nav">
          <button onClick={handlePrevious} className="nav-btn">←</button>
          <button onClick={handleToday} className="today-btn">Today</button>
          <button onClick={handleNext} className="nav-btn">→</button>
        </div>
        <h2 className="calendar-title">{getCurrentPeriod()}</h2>
        <div className="view-toggle">
          <button className={view === 'month' ? 'active' : ''} onClick={() => setView('month')}>Month</button>
          <button className={view === 'week' ? 'active' : ''} onClick={() => setView('week')}>Week</button>
          <button className={view === 'day' ? 'active' : ''} onClick={() => setView('day')}>Day</button>
        </div>
      </div>
      <div className="calendar-content">
        {view === 'month' && renderMonthView()}
        {view === 'week' && renderWeekView()}
        {view === 'day' && renderDayView()}
      </div>
    </div>
  );
}