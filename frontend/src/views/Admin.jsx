// =================================================================
// VIEW: Admin.jsx
// Part of the MVC View layer. Renders the administrative console.
// Connects CRUD forms, admin privilege toggles, status updates,
// and statistical compilations to backend controllers.
// =================================================================

import React, { useState, useEffect } from 'react';
import { adminAPI, carAPI, bookingAPI, uploadAPI, API_BASE_URL } from '../services/api';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data States
  const [stats, setStats] = useState({ totalCars: 0, totalUsers: 0, totalBookings: 0, totalRevenue: 0 });
  const [cars, setCars] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const handleUpdateBookingStatus = async (id, status, branchIndex = '') => {
  try {
    const updateData = { status };

    if (status === 'confirmed') {
      if (branchIndex === '') {
        setError('Please select a pickup branch first.');
        return;
      }

      updateData.pickupLocation = pickupBranches[branchIndex];
    }

    const res = await bookingAPI.updateBooking(id, updateData);
    if (res.data.success) loadTabData();
  } catch (err) {
    console.error(err);
    setError(err.response?.data?.message || 'Failed to update booking status.');
  }
};

  // Loading & Error States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');

  // Car Form States (for Create & Update CRUD)
  const [showCarModal, setShowCarModal] = useState(false);
  const [editingCarId, setEditingCarId] = useState(null); // Null means Add Mode, ID means Edit Mode
  const [carForm, setCarForm] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    type: 'SUV',
    pricePerDay: '',
    imageUrl: '',
  });
  const [uploadingCarImage, setUploadingCarImage] = useState(false);

  // Sync data depending on active tab
  useEffect(() => {
    loadTabData();
  }, [activeTab]);

  const loadTabData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'overview') {
        const res = await adminAPI.getStats();
        if (res.data.success) setStats(res.data.stats);
      } else if (activeTab === 'cars') {
        const res = await carAPI.getCars({ limit: 100 }); // Fetch all cars for management listing
        if (res.data.success) setCars(res.data.cars);
      } else if (activeTab === 'users') {
        const res = await adminAPI.getUsers();
        if (res.data.success) setUsers(res.data.users);
      } else if (activeTab === 'bookings') {
        const res = await bookingAPI.getBookings(); // Admins get all bookings automatically
        if (res.data.success) setBookings(res.data.bookings);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to sync database dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  // =================================================================
  // CARS CRUD EVENT HANDLERS
  // =================================================================
  
  // Open Add Car Modal
  const openAddCarModal = () => {
    setEditingCarId(null);
    setCarForm({ make: '', model: '', year: 2024, type: 'SUV', pricePerDay: '', imageUrl: '' });
    setFormError('');
    setFormSuccess('');
    setShowCarModal(true);
  };

  // Open Edit Car Modal
  const openEditCarModal = (car) => {
    setEditingCarId(car._id);
    setCarForm({
      make: car.make,
      model: car.model,
      year: car.year,
      type: car.type,
      pricePerDay: car.pricePerDay,
      imageUrl: car.imageUrl,
    });
    setFormError('');
    setFormSuccess('');
    setShowCarModal(true);
  };

  // Handle image upload from computer (Multer API)
  const handleCarImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormError('');
    setFormSuccess('');

    // Frontend validations
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setFormError('Invalid file type. Only JPEG, JPG, and PNG are accepted.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setFormError('File size limit exceeded. Max 2MB allowed.');
      return;
    }

    setUploadingCarImage(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await uploadAPI.uploadCarImage(formData);
      if (res.data.success) {
        setCarForm((prev) => ({ ...prev, imageUrl: res.data.imageUrl }));
        setFormSuccess('Image file uploaded to server directory successfully.');
      }
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Car image upload failed.');
    } finally {
      setUploadingCarImage(false);
    }
  };

  // Submit Car Create or Update Form
  const handleCarSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    // Frontend Validation
    const { make, model, year, type, pricePerDay, imageUrl } = carForm;
    if (!make.trim() || !model.trim() || !imageUrl.trim() || !pricePerDay) {
      setFormError('Please enter all required fields.');
      return;
    }
    if (Number(pricePerDay) <= 0) {
      setFormError('Daily rental rate must be positive.');
      return;
    }

    try {
      if (editingCarId) {
        // Run update car CRUD endpoint
        const res = await carAPI.updateCar(editingCarId, carForm);
        if (res.data.success) {
          setFormSuccess('Vehicle listing updated successfully.');
          setTimeout(() => {
            setShowCarModal(false);
            loadTabData();
          }, 1000);
        }
      } else {
        // Run create car CRUD endpoint
        const res = await carAPI.createCar(carForm);
        if (res.data.success) {
          setFormSuccess('Vehicle listing added successfully.');
          setTimeout(() => {
            setShowCarModal(false);
            loadTabData();
          }, 1000);
        }
      }
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Failed to save vehicle details.');
    }
  };

  // Toggle Car Availability status
  const handleToggleAvailability = async (car) => {
    try {
      await carAPI.updateCar(car._id, { isAvailable: !car.isAvailable });
      loadTabData();
    } catch (err) {
      console.error(err);
      setError('Failed to update availability status.');
    }
  };

  // Delete Car CRUD endpoint
  const handleDeleteCar = async (id) => {
    if (!window.confirm('Delete this vehicle from inventory permanently?')) return;

    try {
      const res = await carAPI.deleteCar(id);
      if (res.data.success) loadTabData();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to delete vehicle record.');
    }
  };

  // =================================================================
  // USERS CRUD EVENT HANDLERS
  // =================================================================
  
  // Toggle Admin status
  const handleToggleAdmin = async (id) => {
    try {
      const res = await adminAPI.makeUserAdmin(id);
      if (res.data.success) loadTabData();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to modify user roles.');
    }
  };

  // Delete User Account (CRUD Delete)
  const handleDeleteUser = async (id) => {
    if (!window.confirm('Deactivate user account? This cancels all their booking records.')) return;

    try {
      const res = await adminAPI.deleteUser(id);
      if (res.data.success) loadTabData();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  // =================================================================
  // BOOKINGS CONTROL PANEL
  // =================================================================
  
  // Admin updates booking status
 const handleUpdateBookingStatus = async (id, status, branchIndex = '') => {
  try {
    const updateData = { status };

    if (status === 'confirmed') {
      if (branchIndex === '') {
        setError('Please select a pickup branch first.');
        return;
      }

      updateData.pickupLocation = pickupBranches[branchIndex];
    }

    const res = await bookingAPI.updateBooking(id, updateData);
    if (res.data.success) loadTabData();
  } catch (err) {
    console.error(err);
    setError(err.response?.data?.message || 'Failed to update booking status.');
  }
};

  // Admin delete booking (CRUD Delete)
  const handleDeleteBooking = async (id) => {
    if (!window.confirm('Delete booking log entry permanently?')) return;
    try {
      await bookingAPI.deleteBooking(id);
      loadTabData();
    } catch (err) {
      console.error(err);
      setError('Failed to delete booking entry.');
    }
  };

  const resolveImage = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${API_BASE_URL}${url}`;
  };

  return (
    <div className="main-content">
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)' }}>Admin Console</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage system statistics, cars catalog, user accounts, and rental approval workflows.</p>
        </div>
        
        {activeTab === 'cars' && (
          <button onClick={openAddCarModal} className="btn btn-primary">
            + Add New Vehicle
          </button>
        )}
      </div>

      {/* Tabs Header */}
      <div className="tabs-header">
        <button onClick={() => setActiveTab('overview')} className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}>Overview Stats</button>
        <button onClick={() => setActiveTab('cars')} className={`tab-btn ${activeTab === 'cars' ? 'active' : ''}`}>Cars Catalog</button>
        <button onClick={() => setActiveTab('users')} className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}>Users Register</button>
        <button onClick={() => setActiveTab('bookings')} className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}>Reservations</button>
      </div>

      {/* Global Error Banner */}
      {error && <ErrorMessage message={error} />}

      {/* Main Tab Renderings */}
      {loading ? (
        <Loading message="Syncing data registry details..." />
      ) : (
        <>
          {/* TAB 1: OVERVIEW STATISTICS */}
          {activeTab === 'overview' && (
            <div>
              <div className="stats-grid">
                <div className="stat-card">
                  <span className="stat-label">Total Vehicles</span>
                  <span className="stat-value">{stats.totalCars}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Registered Accounts</span>
                  <span className="stat-value">{stats.totalUsers}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Bookings Count</span>
                  <span className="stat-value">{stats.totalBookings}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Aggregate Revenue</span>
                  <span className="stat-value" style={{ color: 'var(--success)' }}>${stats.totalRevenue.toFixed(2)}</span>
                </div>
              </div>

              <div className="card" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontFamily: 'var(--font-title)' }}>System Admin Instructions</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1rem' }}>
                  Use the administrative tabs to monitor operations. In order to test the booking workflows, you can navigate to <strong>Reservations</strong> to approve, confirm, or cancel rental requests. Under the <strong>Users Register</strong>, you can elevate user privileges or remove accounts.
                </p>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '1rem', borderLeft: '3px solid var(--color-primary)', borderRadius: '4px', fontSize: '0.9rem' }}>
                  <strong>Revenue Calculation Rule:</strong> Total revenue sums up rental prices from bookings with status <code>"confirmed"</code>. Pending and cancelled bookings are omitted.
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CARS CATALOG CRUD */}
          {activeTab === 'cars' && (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>IMAGE</th>
                    <th>MAKE/MODEL</th>
                    <th>YEAR</th>
                    <th>TYPE</th>
                    <th>PRICE/DAY</th>
                    <th>STATUS</th>
                    <th style={{ textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {cars.map((car) => (
                    <tr key={car._id}>
                      <td>
                        <img
                          src={resolveImage(car.imageUrl)}
                          alt={car.make}
                          style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                      </td>
                      <td><strong>{car.make} {car.model}</strong></td>
                      <td>{car.year}</td>
                      <td>{car.type}</td>
                      <td><strong>{car.pricePerDay.toFixed(2)}EGP</strong></td>
                      <td>
                        <button
                          onClick={() => handleToggleAvailability(car)}
                          className={`car-card-badge ${car.isAvailable ? 'badge-available' : 'badge-unavailable'}`}
                          style={{ border: 'none', cursor: 'pointer' }}
                          title="Click to toggle availability"
                        >
                          {car.isAvailable ? 'Available' : 'Rented/Block'}
                        </button>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                          <button onClick={() => openEditCarModal(car)} className="btn btn-warning" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                            Edit
                          </button>
                          <button onClick={() => handleDeleteCar(car._id)} className="btn btn-danger" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {cars.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No cars in database. Click Add New Vehicle to begin.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: USERS REGISTER */}
          {activeTab === 'users' && (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>NAME</th>
                    <th>EMAIL</th>
                    <th>ROLE</th>
                    <th>LICENSE DOCUMENT</th>
                    <th style={{ textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td><strong>{user.name}</strong></td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`car-card-badge ${user.isAdmin ? 'badge-available' : 'badge-secondary'}`} style={{ backgroundColor: user.isAdmin ? 'rgba(0, 242, 254, 0.15)' : 'rgba(255,255,255,0.05)', color: user.isAdmin ? 'var(--color-primary)' : 'var(--text-muted)' }}>
                          {user.isAdmin ? 'Administrator' : 'Standard'}
                        </span>
                      </td>
                      <td>
                        {user.licenseImage ? (
                          <a href={resolveImage(user.licenseImage)} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>
                            View License File
                          </a>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No upload yet</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                          <button onClick={() => handleToggleAdmin(user._id)} className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                            Toggle Role
                          </button>
                          <button onClick={() => handleDeleteUser(user._id)} className="btn btn-danger" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                            Delete Profile
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 4: RESERVATIONS */}
          {activeTab === 'bookings' && (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>CAR</th>
                    <th>USER</th>
                    <th>PICK-UP DATE</th>
                    <th>RETURN DATE</th>
                    <th>TOTAL</th>
                    <th>STATUS</th>
                    <th style={{ textAlign: 'right' }}>MANAGE</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking._id}>
                      <td>
                        <span style={{ fontWeight: 600 }}>{booking.car ? `${booking.car.make} ${booking.car.model}` : 'Deleted Car'}</span>
                      </td>
                      <td>
                        <span style={{ display: 'block', fontWeight: 500 }}>{booking.user?.name || 'Deleted User'}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{booking.user?.email}</span>
                      </td>
                      <td>{new Date(booking.startDate).toLocaleDateString()}</td>
                      <td>{new Date(booking.endDate).toLocaleDateString()}</td>
                      <td><span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>${booking.totalPrice.toFixed(2)}</span></td>
                      <td>
                        <span className={`car-card-badge ${booking.status === 'confirmed' ? 'badge-available' : booking.status === 'pending' ? 'badge-warning' : 'badge-unavailable'}`} style={{ padding: '0.2rem 0.4rem', fontSize: '0.8rem' }}>
                          {booking.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          {booking.status === 'pending' && (
                            <>
                              <select
                            onChange={(e) => handleUpdateBookingStatus(booking._id, 'confirmed', e.target.value)}
  defaultValue=""
  className="btn btn-success"
  style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
 >
  <option value="" disabled>Confirm + Branch</option>
  {pickupBranches.map((branch, index) => (
    <option key={branch.branchName} value={index}>
      {branch.branchName}
    </option>
  ))}
</select>
                              <button onClick={() => handleUpdateBookingStatus(booking._id, 'cancelled')} className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
                                Decline
                              </button>
                            </>
                          )}
                          <button onClick={() => handleDeleteBooking(booking._id)} className="btn btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} title="Delete booking entry">
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No bookings logged in the system registry.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* =================================================================
         MODAL DIALOG FOR CAR ADD/EDIT (CRUD OPERATIONS)
         ================================================================= */}
      {showCarModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '1.5rem' }}>
                {editingCarId ? 'Update Vehicle Details' : 'Add New Vehicle to Inventory'}
              </h2>
              <button onClick={() => setShowCarModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: '#fff', cursor: 'pointer' }}>
                &times;
              </button>
            </div>

            {formError && <ErrorMessage message={formError} />}
            {formSuccess && <div className="alert alert-success" style={{ padding: '0.5rem', fontSize: '0.9rem' }}>{formSuccess}</div>}

            <form onSubmit={handleCarSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* Make */}
                <div className="form-group">
                  <label className="form-label">Make *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Ford"
                    value={carForm.make}
                    onChange={(e) => setCarForm((prev) => ({ ...prev, make: e.target.value }))}
                    required
                  />
                </div>

                {/* Model */}
                <div className="form-group">
                  <label className="form-label">Model *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Explorer"
                    value={carForm.model}
                    onChange={(e) => setCarForm((prev) => ({ ...prev, model: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* Year */}
                <div className="form-group">
                  <label className="form-label">Year *</label>
                  <input
                    type="number"
                    className="form-control"
                    value={carForm.year}
                    onChange={(e) => setCarForm((prev) => ({ ...prev, year: e.target.value }))}
                    required
                  />
                </div>

                {/* Type */}
                <div className="form-group">
                  <label className="form-label">Vehicle Type *</label>
                  <select
                    className="form-control"
                    value={carForm.type}
                    onChange={(e) => setCarForm((prev) => ({ ...prev, type: e.target.value }))}
                  >
                    <option value="SUV">SUV</option>
                    <option value="Sedan">Sedan</option>
                    <option value="Hatchback">Hatchback</option>
                    <option value="Luxury">Luxury</option>
                    <option value="Sports">Sports</option>
                    <option value="Truck">Truck</option>
                    <option value="Van">Van</option>
                  </select>
                </div>
              </div>

              {/* Price Per Day */}
              <div className="form-group">
                <label className="form-label">Rental Price (Per Day USD) *</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="e.g. 75.00"
                  value={carForm.pricePerDay}
                  onChange={(e) => setCarForm((prev) => ({ ...prev, pricePerDay: e.target.value }))}
                  required
                />
              </div>

              {/* Image selection */}
              <div className="form-group" style={{ border: '1px dashed var(--border-color)', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem' }}>
                <label className="form-label">Vehicle Image Source</label>
                
                {/* File Upload Option */}
                <div style={{ marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Option A: Upload local image file (Multer)</span>
                  <label className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                    {uploadingCarImage ? 'Uploading image...' : 'Choose File'}
                    <input type="file" onChange={handleCarImageUpload} style={{ display: 'none' }} disabled={uploadingCarImage} />
                  </label>
                </div>

                {/* Direct URL Option */}
                <div>
                  <span style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Option B: Paste photo web URL directly</span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. https://images.unsplash.com/photo-..."
                    value={carForm.imageUrl}
                    onChange={(e) => setCarForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                  />
                </div>
              </div>

              {carForm.imageUrl && (
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Image Preview:</span>
                  <img
                    src={resolveImage(carForm.imageUrl)}
                    alt="Preview"
                    style={{ maxHeight: '120px', maxWidth: '100%', objectFit: 'contain', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                  />
                </div>
              )}

              <div className="modal-footer">
                <button type="button" onClick={() => setShowCarModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCarId ? 'Save Changes' : 'Add Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
// Note: MVC Flow: Admin view handles Statistics, Cars CRUD (includes photo file uploads), Users CRUD admin elevation, and Bookings status confirmations.
