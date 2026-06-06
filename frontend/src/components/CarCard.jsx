import React from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../services/api';

const CarCard = ({ car }) => {
  // Helper to format image URLs from local uploads or external seeds
  const resolveCarImage = (url) => {
    if (!url) return 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `${API_BASE_URL}${url}`;
  };

  return (
    <div className="card">
      <img
        src={resolveCarImage(car.imageUrl)}
        alt={`${car.make} ${car.model}`}
        className="car-card-img"
        onError={(e) => {
          // Fallback image in case link fails
          e.target.src = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80';
        }}
      />
      
      <div className="car-card-header">
        <div>
          <h3 className="car-card-title">{car.make} {car.model}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Year: {car.year}</p>
        </div>
        <span className={`car-card-badge ${car.isAvailable ? 'badge-available' : 'badge-unavailable'}`}>
          {car.isAvailable ? 'Available' : 'Rented'}
        </span>
      </div>

      <div className="car-card-specs">
        <span>Category: <strong>{car.type}</strong></span>
      </div>

      <div className="car-card-footer">
        <div className="car-card-price">
          <span>${car.pricePerDay.toFixed(2)}</span> / day
        </div>
        
        {car.isAvailable ? (
          <Link to={`/booking/${car._id}`} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            Book Now
          </Link>
        ) : (
          <button className="btn btn-secondary btn-disabled" disabled style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            Unavailable
          </button>
        )}
      </div>
    </div>
  );
};

export default CarCard;
