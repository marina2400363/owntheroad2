// =================================================================
// VIEW: MyBookings.jsx
// Part of the MVC View layer. Renders a user's booking history and
// driving license upload panel. Connects user interaction triggers
// (cancel rental, delete booking record, upload image) to controllers.
// =================================================================

import React, { useState, useEffect } from 'react';
import { bookingAPI, uploadAPI, API_BASE_URL } from '../services/api';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);

  // Sync logged in user profile details
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem('user')) || {}
  );

  useEffect(() => {
    fetchUserBookings();
  }, []);

  const fetchUserBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await bookingAPI.getBookings();
      if (response.data.success) {
        setBookings(response.data.bookings);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to retrieve booking dossier');
    } finally {
      setLoading(false);
    }
  };

  // User cancel booking controller trigger
  const handleCancelBooking = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking request?')) return;

    try {
      const response = await bookingAPI.updateBooking(id, { status: 'cancelled' });
      if (response.data.success) {
        // Refresh local bookings list
        fetchUserBookings();
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to cancel reservation');
    }
  };

  // User delete booking history entry (CRUD Operation)
  const handleDeleteBooking = async (id) => {
    if (!window.confirm('Remove this booking from your history file permanently?')) return;

    try {
      const response = await bookingAPI.deleteBooking(id);
      if (response.data.success) {
        fetchUserBookings();
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to delete record');
    }
  };

  // User Driver License Upload Handler (Multer connection)
  const handleLicenseUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset upload status banners
    setUploadError('');
    setUploadSuccess('');

    // Frontend File Validations (Type & Size checking)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Invalid format. Only JPEG, JPG, and PNG files are allowed.');
      return;
    }

    const maxSizeBytes = 2 * 1024 * 1024; // 2MB Limit
    if (file.size > maxSizeBytes) {
      setUploadError('File size exceeds the 2MB upload limit.');
      return;
    }

    setUploadLoading(true);

    const formData = new FormData();
    formData.append('license', file);

    try {
      // Trigger upload API controller
      const response = await uploadAPI.uploadLicense(formData);
      if (response.data.success) {
        setUploadSuccess('Driving license verification uploaded successfully.');
        
        // Update user state in localStorage and view
        const updatedUser = { ...currentUser, licenseImage: response.data.imageUrl };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
      }
    } catch (err) {
      console.error(err);
      setUploadError(err.response?.data?.message || 'License upload process failed.');
    } finally {
      setUploadLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'confirmed': return 'badge-available';
      case 'pending': return 'badge-warning'; // Let's make pending yellow-ish (we will style inline or rely on theme)
      case 'cancelled': return 'badge-unavailable';
      default: return '';
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const resolveCarImage = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `${API_BASE_URL}${url}`;
  };

  return (
    <div className="main-content">
      {/* 2-Column Responsive Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 3fr', gap: '2.5rem' }} className="booking-flow-container">
        
        {/* Left Side: Profile info & Document upload */}
        <div style={{ height: 'fit-content' }}>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontFamily: 'var(--font-title)' }}>
              Driver Dossier
            </h3>
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', fontSize: '0.95rem' }}>
              <p style={{ marginBottom: '0.5rem' }}>Name: <strong>{currentUser.name}</strong></p>
              <p style={{ marginBottom: '1rem' }}>Email: <strong>{currentUser.email}</strong></p>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontFamily: 'var(--font-title)' }}>
              Driving License
            </h3>

            {uploadError && <div className="alert alert-danger" style={{ fontSize: '0.85rem', padding: '0.5rem' }}>{uploadError}</div>}
            {uploadSuccess && <div className="alert alert-success" style={{ fontSize: '0.85rem', padding: '0.5rem' }}>{uploadSuccess}</div>}

            {currentUser.licenseImage ? (
              <div>
                <p style={{ color: 'var(--success)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}>
                  ✓ Verification Document Loaded
                </p>
                <img
                  src={`${API_BASE_URL}${currentUser.licenseImage}`}
                  alt="License File Uploaded"
                  className="license-preview"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                
                {/* Allow update uploads */}
                <div style={{ marginTop: '1rem' }}>
                  <label className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', width: '100%', cursor: 'pointer' }}>
                    {uploadLoading ? 'Uploading...' : 'Update Document'}
                    <input type="file" onChange={handleLicenseUpload} style={{ display: 'none' }} disabled={uploadLoading} />
                  </label>
                </div>
              </div>
            ) : (
              <div>
                <p style={{ color: 'var(--warning)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  A valid driving license image is required in order to check out vehicles.
                </p>
                
                <label className="btn btn-primary" style={{ padding: '0.65rem 1rem', fontSize: '0.9rem', width: '100%', cursor: 'pointer' }}>
                  {uploadLoading ? 'Uploading...' : 'Upload Image File'}
                  <input type="file" onChange={handleLicenseUpload} style={{ display: 'none' }} disabled={uploadLoading} />
                </label>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', textAlign: 'center' }}>
                  Only PNG, JPG, or JPEG up to 2MB allowed.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Bookings listings */}
        <div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', fontFamily: 'var(--font-title)' }}>
            Your Rentals Registry
          </h2>

          {error && <ErrorMessage message={error} />}

          {loading ? (
            <Loading message="Scanning active reservations..." />
          ) : bookings.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem', color: 'var(--text-muted)' }}>
              <h3>No bookings are logged on your account</h3>
              <p style={{ marginBottom: '1.5rem' }}>Find a vehicle in the catalog and lock down your reservation.</p>
              <a href="/" className="btn btn-primary">Browse Vehicles</a>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {bookings.map((booking) => (
                <div key={booking._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem' }}>
                  
                  {/* Booking Header: Car and Status */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <img
                        src={resolveCarImage(booking.car?.imageUrl)}
                        alt={booking.car ? `${booking.car.make} ${booking.car.model}` : 'Vehicle'}
                        style={{ width: '80px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                      <div>
                        <h4 style={{ fontSize: '1.15rem' }}>{booking.car ? `${booking.car.make} ${booking.car.model}` : 'Vehicle details deleted'}</h4>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Type: {booking.car?.type}</span>
                      </div>
                    </div>

                    <div>
                      <span className={`car-card-badge ${getStatusBadgeClass(booking.status)}`} style={{ padding: '0.3rem 0.60rem' }}>
                        {booking.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Booking Body: Dates and Pricing */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '1rem 0', fontSize: '0.9rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>PICK-UP DATE</span>
                      <strong>{formatDate(booking.startDate)}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>RETURN DATE</span>
                      <strong>{formatDate(booking.endDate)}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>TOTAL RENTAL COST</span>
                      <strong style={{ color: 'var(--color-primary)', fontSize: '1.1rem' }}>${booking.totalPrice.toFixed(2)}</strong>
                    </div>
                  </div>

                  {/* Booking Actions */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    {/* User Cancellation Check */}
                    {(booking.status === 'pending' || booking.status === 'confirmed') && (
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        className="btn btn-secondary"
                        style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', borderColor: 'var(--danger)', color: 'var(--danger)' }}
                      >
                        Cancel Reservation
                      </button>
                    )}

                    {/* Booking Removal (CRUD Delete) */}
                    {(booking.status === 'cancelled') && (
                      <button
                        onClick={() => handleDeleteBooking(booking._id)}
                        className="btn btn-danger"
                        style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                      >
                        Delete Record
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default MyBookings;
// Note: MVC Flow: MyBookings view implements driving license uploading (Multer API) and CRUD booking deletions on status = cancelled.
