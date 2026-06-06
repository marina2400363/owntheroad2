// =================================================================
// VIEW: Booking.jsx
// Part of the MVC View layer. Details a car's metrics and captures
// start/end dates. Computes price dynamically and creates booking request.
// =================================================================

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { carAPI, bookingAPI, API_BASE_URL } from '../services/api';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const Booking = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  // Form states (Default tomorrow to day after tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfterTomorrow = new Date();
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

  const [startDate, setStartDate] = useState(tomorrow.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(dayAfterTomorrow.toISOString().split('T')[0]);
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [estimatedDays, setEstimatedDays] = useState(1);

  // Retrieve user details to verify driving license status
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const hasUploadedLicense = user && user.licenseImage && user.licenseImage.trim() !== '';

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        setLoading(true);
        const response = await carAPI.getCarById(id);
        if (response.data.success) {
          setCar(response.data.car);
        }
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to fetch car details');
      } finally {
        setLoading(false);
      }
    };

    fetchCarDetails();
  }, [id]);

  // Recalculate estimated pricing dynamically in the frontend view
  useEffect(() => {
    if (!car) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start && end && end > start) {
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
      setEstimatedDays(diffDays);
      setEstimatedPrice(diffDays * car.pricePerDay);
    } else {
      setEstimatedDays(0);
      setEstimatedPrice(0);
    }
  }, [startDate, endDate, car]);

  // Frontend Date Validations before API submission
  const validateBookingDates = () => {
    setError('');
    
    if (!startDate || !endDate) {
      setError('Both start and end dates are required');
      return false;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    now.setHours(0,0,0,0);

    if (start < now) {
      setError('Start date cannot be in the past');
      return false;
    }

    if (end <= start) {
      setError('End date must be at least 1 day after start date');
      return false;
    }

    return true;
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!validateBookingDates()) return;

    setBookingLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await bookingAPI.createBooking({
        carId: car._id,
        startDate,
        endDate,
      });

      if (response.data.success) {
        setSuccess('Booking submitted successfully! Directing to your rentals dashboard...');
        setTimeout(() => {
          navigate('/my-bookings');
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Booking collision. Overlap detected.');
    } finally {
      setBookingLoading(false);
    }
  };

  // Helper to format images
  const resolveCarImage = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `${API_BASE_URL}${url}`;
  };

  if (loading) return <div className="main-content"><Loading message="Retrieving vehicle dossier..." /></div>;
  if (!car) return <div className="main-content"><ErrorMessage message="Vehicle record not found" /></div>;

  return (
    <div className="main-content">
      <Link to="/" style={{ color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
        &larr; Back to Catalog Listing
      </Link>

      <div className="booking-flow-container">
        {/* Left Side: Vehicle details card */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <img
            src={resolveCarImage(car.imageUrl)}
            alt={`${car.make} ${car.model}`}
            style={{ width: '100%', height: '350px', objectFit: 'cover' }}
          />
          <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)' }}>{car.make} {car.model}</h2>
              <span className={`car-card-badge ${car.isAvailable ? 'badge-available' : 'badge-unavailable'}`} style={{ fontSize: '0.9rem', padding: '0.4rem 0.8rem' }}>
                {car.isAvailable ? 'Available' : 'Rented'}
              </span>
            </div>
            
            <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              <div>Year Model: <strong style={{ color: '#fff' }}>{car.year}</strong></div>
              <div>Class Style: <strong style={{ color: '#fff' }}>{car.type}</strong></div>
              <div>Daily Rate: <strong style={{ color: '#fff' }}>${car.pricePerDay.toFixed(2)}</strong></div>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>
              This high-performance {car.year} {car.make} {car.model} {car.type} comes with fully loaded capabilities, top safety reviews, and pristine cleaning between rentals. Lock down dates today to guarantee reservation availability.
            </p>
          </div>
        </div>

        {/* Right Side: Booking interaction form */}
        <div className="card" style={{ height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontFamily: 'var(--font-title)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            Reservation Details
          </h3>

          {error && <ErrorMessage message={error} />}
          {success && <div className="alert alert-success">{success}</div>}

          {/* driving license check warning */}
          {!hasUploadedLicense && (
            <div className="alert alert-danger" style={{ fontSize: '0.85rem', padding: '0.75rem', marginBottom: '1.25rem' }}>
              <strong>Notice:</strong> You have not uploaded a driving license yet. You can book, but must upload it in your <Link to="/my-bookings" style={{ textDecoration: 'underline', color: 'white' }}>dashboard</Link> before key collection.
            </div>
          )}

          <form onSubmit={handleBookingSubmit}>
            {/* Start Date */}
            <div className="form-group">
              <label className="form-label">Pick-Up Date</label>
              <input
                type="date"
                className="form-control"
                value={startDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            {/* End Date */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Return Date</label>
              <input
                type="date"
                className="form-control"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>

            {/* Price Calculations Output */}
            {estimatedDays > 0 && (
              <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  <span>Rental Duration:</span>
                  <span>{estimatedDays} {estimatedDays === 1 ? 'day' : 'days'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  <span>Daily Rate:</span>
                  <span>${car.pricePerDay.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', borderTop: '1px dashed var(--border-color)', paddingTop: '0.5rem', fontWeight: 'bold', color: '#ffffff' }}>
                  <span>Total Amount:</span>
                  <span style={{ color: 'var(--color-primary)' }}>${estimatedPrice.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className={`btn btn-primary ${bookingLoading || !car.isAvailable ? 'btn-disabled' : ''}`}
              disabled={bookingLoading || !car.isAvailable}
              style={{ width: '100%', padding: '0.85rem' }}
            >
              {bookingLoading ? 'Requesting...' : car.isAvailable ? 'Confirm Booking' : 'Not Available for Rent'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Booking;
// Note: MVC Flow: Booking view estimates totalPrice dynamically on state change, validates dates, and triggers booking creation on submit.
