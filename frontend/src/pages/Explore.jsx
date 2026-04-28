import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Explore.css';

// MOCK DATA (used only when database is empty)
const MOCK_PROVIDERS = [
  {
    id: 1,
    name: "Dr. Priya Sharma",
    service_name: "Mathematics Tutoring",
    service_type: "teacher",
    description: "10+ years experience. IIT graduate.",
    price: 800,
    duration: 60,
    city: "Mumbai"
  },
  // ... (keep all your mock providers, but they will NOT be bookable)
];

export default function Explore() {
  const navigate = useNavigate();
  const [allProviders, setAllProviders] = useState([]);
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [realProvidersAvailable, setRealProvidersAvailable] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [cities, setCities] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  
  // Booking form
  const [bookingForm, setBookingForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    booking_date: '',
    booking_time: ''
  });
  const [bookingStep, setBookingStep] = useState(1);
  const [bookingResult, setBookingResult] = useState(null);

  const extractFilters = (providersList) => {
    const uniqueCities = [...new Set(providersList.map(p => p.city).filter(Boolean))];
    const uniqueTypes = [...new Set(providersList.map(p => p.service_type).filter(Boolean))];
    setCities(uniqueCities);
    setServiceTypes(uniqueTypes);
  };

  useEffect(() => {
    const fetchProviders = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:5000/api/providers');
        const data = await response.json();
        if (data.success && data.data.length > 0) {
          setAllProviders(data.data);
          extractFilters(data.data);
          setRealProvidersAvailable(true);
        } else {
          setAllProviders(MOCK_PROVIDERS);
          extractFilters(MOCK_PROVIDERS);
          setRealProvidersAvailable(false);
        }
      } catch (error) {
        console.error('Failed to fetch, using mock data:', error);
        setAllProviders(MOCK_PROVIDERS);
        extractFilters(MOCK_PROVIDERS);
        setRealProvidersAvailable(false);
      } finally {
        setLoading(false);
      }
    };
    fetchProviders();
  }, []);

  useEffect(() => {
    if (allProviders.length === 0) return;
    let filtered = [...allProviders];
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    if (selectedType) filtered = filtered.filter(p => p.service_type === selectedType);
    if (selectedCity) filtered = filtered.filter(p => p.city === selectedCity);
    filtered.sort((a, b) => a.price - b.price);
    setFilteredProviders(filtered);
  }, [allProviders, searchTerm, selectedType, selectedCity]);

  const handleBookNow = (provider) => {
    setSelectedProvider(provider);
    setShowBookingModal(true);
    setBookingStep(1);
    setBookingForm({
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      booking_date: '',
      booking_time: ''
    });
    setBookingResult(null);
  };

  const handleBookingChange = (e) => {
    setBookingForm({
      ...bookingForm,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateBooking = async () => {
    if (!bookingForm.customer_name || !bookingForm.customer_email || !bookingForm.booking_date || !bookingForm.booking_time) {
      alert('Please fill all required fields');
      return;
    }

    setBookingStep(2);

    try {
      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider_id: selectedProvider.id,
          customer_name: bookingForm.customer_name,
          customer_email: bookingForm.customer_email,
          customer_phone: bookingForm.customer_phone,
          booking_date: bookingForm.booking_date,
          booking_time: bookingForm.booking_time
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setBookingResult(data.data);
        setBookingStep(3);
      } else {
        alert('Booking failed: ' + data.message);
        setBookingStep(1);
      }
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Failed to create booking. Please try again.');
      setBookingStep(1);
    }
  };

  const getServiceIcon = (type) => {
    const icons = {
      teacher: '👨‍🏫',
      doctor: '👨‍⚕️',
      salon: '💇',
      gym: '💪',
      consultant: '💼',
      default: '📋'
    };
    return icons[type] || icons.default;
  };

  return (
    <div className="explore-page">
      <div className="explore-header">
        <h1>Find the right professional</h1>
        <p>Compare prices, read profiles, book instantly</p>
      </div>

      <div className="filters-bar">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by name, service, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select className="filter-select" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
          <option value="">All service types</option>
          {serviceTypes.map(type => <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>)}
        </select>
        <select className="filter-select" value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
          <option value="">All cities</option>
          {cities.map(city => <option key={city} value={city}>{city}</option>)}
        </select>
        {(searchTerm || selectedType || selectedCity) && (
          <button className="clear-filters" onClick={() => { setSearchTerm(''); setSelectedType(''); setSelectedCity(''); }}>
            Clear all
          </button>
        )}
      </div>

      <div className="results-info">
        <span>{filteredProviders.length} professionals found</span>
        <span className="sort-hint">Sorted by price (low to high)</span>
      </div>

      <div className="providers-grid">
        {loading ? (
          <div className="loading-state"><div className="spinner"></div><p>Loading professionals...</p></div>
        ) : filteredProviders.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">🔍</div><h3>No professionals found</h3><p>Try adjusting your filters or search term</p></div>
        ) : (
          filteredProviders.map(provider => (
            <div key={provider.id} className="provider-card">
              <div className="card-badge">{provider.price < 500 ? '💰 Best value' : '⭐ Top rated'}</div>
              <div className="provider-icon">{getServiceIcon(provider.service_type)}</div>
              <div className="provider-info">
                <h3>{provider.name}</h3>
                <p className="service-name">{provider.service_name}</p>
                <p className="description">{provider.description?.substring(0, 100)}...</p>
                <div className="price-row"><span className="price">₹{provider.price}</span><span className="duration">⏱️ {provider.duration} min</span></div>
                {provider.city && <div className="location">📍 {provider.city}</div>}
              </div>
              <button className="book-btn" onClick={() => handleBookNow(provider)}>Book session →</button>
            </div>
          ))
        )}
      </div>

      {showBookingModal && selectedProvider && (
        <div className="modal-overlay" onClick={() => setShowBookingModal(false)}>
          <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowBookingModal(false)}>✕</button>
            
            {bookingStep === 1 && (
              <>
                <h2>Book {selectedProvider.service_name}</h2>
                <p className="provider-detail">with {selectedProvider.name} · ₹{selectedProvider.price}</p>
                
                <div className="booking-form">
                  <div className="form-group"><label>Your Name *</label><input type="text" name="customer_name" value={bookingForm.customer_name} onChange={handleBookingChange} placeholder="Enter your full name" /></div>
                  <div className="form-group"><label>Email *</label><input type="email" name="customer_email" value={bookingForm.customer_email} onChange={handleBookingChange} placeholder="Enter your email" /></div>
                  <div className="form-group"><label>Phone (optional)</label><input type="tel" name="customer_phone" value={bookingForm.customer_phone} onChange={handleBookingChange} placeholder="Enter your phone number" /></div>
                  <div className="form-row">
                    <div className="form-group"><label>Date *</label><input type="date" name="booking_date" value={bookingForm.booking_date} onChange={handleBookingChange} min={new Date().toISOString().split('T')[0]} /></div>
                    <div className="form-group"><label>Time *</label><select name="booking_time" value={bookingForm.booking_time} onChange={handleBookingChange}>
                      <option value="">Select time</option><option value="09:00">9:00 AM</option><option value="10:00">10:00 AM</option>
                      <option value="11:00">11:00 AM</option><option value="14:00">2:00 PM</option><option value="15:00">3:00 PM</option>
                      <option value="16:00">4:00 PM</option><option value="17:00">5:00 PM</option>
                    </select></div>
                  </div>
                  {!realProvidersAvailable && <p style={{color: '#ef4444', marginTop: '8px', fontSize: '13px'}}>⚠️ No real providers in database. Please register as a provider first.</p>}
                  <button className="book-confirm-btn" onClick={handleCreateBooking} disabled={!realProvidersAvailable}>
                    Book Session →
                  </button>
                </div>
              </>
            )}
            
            {bookingStep === 2 && (<div className="processing"><div className="spinner"></div><h3>Creating your booking...</h3><p>Please wait...</p></div>)}
            
            {bookingStep === 3 && bookingResult && (
              <div className="booking-success">
                <div className="success-icon">✓</div>
                <h2>Session Booked!</h2>
                <p>Booking ID: <strong>{bookingResult.booking_id}</strong></p>
                <div className="booking-details">
                  <div className="detail-row"><span>Service:</span><strong>{bookingResult.service_name}</strong></div>
                  <div className="detail-row"><span>Provider:</span><strong>{bookingResult.provider_name}</strong></div>
                  <div className="detail-row"><span>Date & Time:</span><strong>{bookingResult.date} at {bookingResult.time}</strong></div>
                  <div className="detail-row"><span>Amount:</span><strong>₹{bookingResult.price}</strong></div>
                  <div className="detail-row zoom-link"><span>Zoom Link:</span><a href={bookingResult.zoom_link} target="_blank" rel="noopener noreferrer">Join Meeting →</a></div>
                </div>
                <button className="done-btn" onClick={() => { setShowBookingModal(false); navigate('/calendar'); }}>Go to Calendar</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}