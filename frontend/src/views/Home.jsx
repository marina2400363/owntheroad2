// =================================================================
// VIEW: Home.jsx
// Part of the MVC View layer. Renders the paginated catalog index of cars.
// Connects UI forms to backend car search, sort, and filter endpoints.
// =================================================================

import React, { useState, useEffect } from 'react';
import { carAPI } from '../services/api';
import CarCard from '../components/CarCard';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const Home = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search, Filter, Sort, Pagination States
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); // Only updates on form submit
  const [carType, setCarType] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCarsCount, setTotalCarsCount] = useState(0);

  // Fetch cars when query conditions change
  useEffect(() => {
    const fetchCarsList = async () => {
      try {
        setLoading(true);
        setError('');
        
        const params = {
          page: currentPage,
          limit: 6,
          search: searchQuery,
          type: carType,
          sort: sortBy,
        };

        const response = await carAPI.getCars(params);
        if (response.data.success) {
          setCars(response.data.cars);
          setTotalPages(response.data.pagination.totalPages);
          setTotalCarsCount(response.data.pagination.totalCars);
        }
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to connect to backend api');
      } finally {
        setLoading(false);
      }
    };

    fetchCarsList();
  }, [currentPage, searchQuery, carType, sortBy]);

  // Handle Search Submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page
    setSearchQuery(searchTerm);
  };

  // Reset Filters helper
  const handleResetFilters = () => {
    setSearchTerm('');
    setSearchQuery('');
    setCarType('All');
    setSortBy('newest');
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="main-content">
      {/* Hero Header */}
      <header style={{ textAlign: 'center', marginBottom: '3rem', marginTop: '1rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem', fontFamily: 'var(--font-title)' }}>
          OWN THE <span style={{ color: 'var(--color-primary)' }}>ROAD</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          Discover the premium car rental experience. Drive what you love, check our availability, and book instantly.
        </p>
      </header>

      {/* Filter and Search Bar */}
      <form onSubmit={handleSearchSubmit} className="search-filter-bar">
        {/* Search Make/Model */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Search Vehicle</label>
          <input
            type="text"
            className="form-control"
            placeholder="Search by make or model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter Type */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Category</label>
          <select
            className="form-control"
            value={carType}
            onChange={(e) => {
              setCarType(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="All">All Categories</option>
            <option value="SUV">SUV</option>
            <option value="Sedan">Sedan</option>
            <option value="Hatchback">Hatchback</option>
            <option value="Luxury">Luxury</option>
            <option value="Sports">Sports</option>
            <option value="Truck">Truck</option>
            <option value="Van">Van</option>
          </select>
        </div>

        {/* Sort By Price */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Sort By</label>
          <select
            className="form-control"
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="newest">Newest Arrivals</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '44px' }}>
            Filter
          </button>
          <button
            type="button"
            onClick={handleResetFilters}
            className="btn btn-secondary"
            style={{ height: '44px', padding: '0.75rem' }}
            title="Reset Filters"
          >
            Reset
          </button>
        </div>
      </form>

      {/* Main Catalog Rendering */}
      {error && <ErrorMessage message={error} />}

      {loading ? (
        <Loading message="Fetching rental catalog..." />
      ) : (
        <>
          {cars.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
              <h3>No vehicles matching your criteria were found</h3>
              <p>Try modifying your search text or filter categories.</p>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                <span>Found {totalCarsCount} matching vehicle(s)</span>
                <span>Page {currentPage} of {totalPages}</span>
              </div>
              
              <div className="grid-cars">
                {cars.map((car) => (
                  <CarCard key={car._id} car={car} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="pagination-container">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`btn btn-secondary ${currentPage === 1 ? 'btn-disabled' : ''}`}
                  >
                    Previous
                  </button>
                  <span className="page-info">
                    Page <strong>{currentPage}</strong> of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`btn btn-secondary ${currentPage === totalPages ? 'btn-disabled' : ''}`}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Home;
