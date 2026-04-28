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

  // ----- MODERN MONTH VIEW -----
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div className="cal-month-view">
        <div className="cal-weekdays">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="cal-weekday">{day}</div>
          ))}
        </div>
        <div className="cal-days-grid">
          {days.map((day, idx) => {
            const dayEvents = getEventsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isTodayDate = isToday(day);
            const isSelected = isSameDay(day, selectedDate);
            return (
              <div
                key={idx}
                className={`cal-day-cell 
                  ${!isCurrentMonth ? 'other-month' : ''} 
                  ${isTodayDate ? 'today' : ''} 
                  ${isSelected ? 'selected' : ''}`}
                onClick={() => onDateClick(day)}
              >
                <div className="cal-day-number">{format(day, 'd')}</div>
                <div className="cal-day-events">
                  {dayEvents.slice(0, 2).map(ev => (
                    <div
                      key={ev.id}
                      className={`cal-event ${ev.event_type}`}
                      onClick={(e) => { e.stopPropagation(); onEventClick(ev); }}
                    >
                      <span className="cal-event-time">{format(parseISO(ev.start_time), 'h:mm a')}</span>
                      <span className="cal-event-title">{ev.title}</span>
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="cal-more-events">+{dayEvents.length - 2} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ----- MODERN WEEK VIEW -----
  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const hours = Array.from({ length: 24 }, (_, i) => i).slice(8, 20); // 8 AM – 8 PM

    return (
      <div className="cal-week-view">
        <div className="cal-week-header">
          <div className="cal-time-col"></div>
          {weekDays.map((day, i) => (
            <div key={i} className={`cal-week-day-header ${isToday(day) ? 'today' : ''}`}>
              <div className="cal-week-day-name">{format(day, 'EEE')}</div>
              <div className="cal-week-day-date">{format(day, 'MMM d')}</div>
            </div>
          ))}
        </div>
        <div className="cal-week-times">
          {hours.map(hour => (
            <div key={hour} className="cal-hour-row">
              <div className="cal-hour-label">{format(setHours(setMinutes(new Date(), 0), hour), 'h a')}</div>
              <div className="cal-hour-slots">
                {weekDays.map((day, idx) => {
                  const slotEvents = getEventsForTimeSlot(day, hour);
                  return (
                    <div
                      key={idx}
                      className="cal-hour-slot"
                      onClick={() => onDateClick(setHours(setMinutes(day, 0), hour))}
                    >
                      {slotEvents.map(ev => {
                        const start = parseISO(ev.start_time);
                        const end = parseISO(ev.end_time);
                        const durationHours = (end - start) / (1000 * 60 * 60);
                        const height = Math.min(durationHours * 70, 180);
                        return (
                          <div
                            key={ev.id}
                            className={`cal-slot-event ${ev.event_type}`}
                            style={{ height: `${height}px` }}
                            onClick={(e) => { e.stopPropagation(); onEventClick(ev); }}
                          >
                            <div className="cal-slot-event-time">{formatEventTime(ev)}</div>
                            <div className="cal-slot-event-title">{ev.title}</div>
                          </div>
                        );
                      })}
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

  // ----- MODERN DAY VIEW -----
  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i).slice(6, 22);
    const dayEvents = getEventsForDate(selectedDate);

    return (
      <div className="cal-day-view">
        <div className="cal-day-header">
          <div className="cal-day-title">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</div>
          <div className="cal-day-event-count">{dayEvents.length} events</div>
        </div>
        <div className="cal-day-timeline">
          {hours.map(hour => {
            const hourEvents = dayEvents.filter(e => getHours(parseISO(e.start_time)) === hour);
            return (
              <div key={hour} className="cal-day-hour-row">
                <div className="cal-day-hour-label">{format(setHours(setMinutes(new Date(), 0), hour), 'h a')}</div>
                <div className="cal-day-hour-events">
                  {hourEvents.length ? (
                    hourEvents.map(ev => (
                      <div
                        key={ev.id}
                        className={`cal-day-event ${ev.event_type}`}
                        onClick={() => onEventClick(ev)}
                      >
                        <div className="cal-day-event-time">{formatEventTime(ev)}</div>
                        <div className="cal-day-event-title">{ev.title}</div>
                        {ev.zoom_link && <div className="cal-day-event-zoom">🎥 Zoom</div>}
                      </div>
                    ))
                  ) : (
                    <div className="cal-day-empty-slot" onClick={() => onDateClick(setHours(setMinutes(selectedDate, 0), hour))}>
                      + Add event
                    </div>
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
    <div className="cal-container">
      <div className="cal-header">
        <div className="cal-nav-buttons">
          <button onClick={handlePrevious} className="cal-nav-btn">←</button>
          <button onClick={handleToday} className="cal-today-btn">Today</button>
          <button onClick={handleNext} className="cal-nav-btn">→</button>
        </div>
        <h2 className="cal-title">{getCurrentPeriod()}</h2>
        <div className="cal-view-buttons">
          <button className={view === 'month' ? 'active' : ''} onClick={() => setView('month')}>Month</button>
          <button className={view === 'week' ? 'active' : ''} onClick={() => setView('week')}>Week</button>
          <button className={view === 'day' ? 'active' : ''} onClick={() => setView('day')}>Day</button>
        </div>
      </div>
      <div className="cal-body">
        {view === 'month' && renderMonthView()}
        {view === 'week' && renderWeekView()}
        {view === 'day' && renderDayView()}
      </div>
    </div>
  );
}