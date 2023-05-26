import React, { useState } from 'react';
import BookingPage from './BookingPage';
import AdminPage from './AdminPage';
import MyBookings from './MyBooking';
import ContactPage from './ContactPage';
import backgroundImage from '../images/food.jpeg'; // Import the background image

function StartPage() {
  const [showBookingPage, setShowBookingPage] = useState(false);
  const [showAdminPage, setShowAdminPage] = useState(false);
  const [showMyBookings, setShowMyBookings] = useState(false);
  const [showContactPage, setShowContactPage] = useState(false);

  const handleBookNow = () => {
    setShowBookingPage(true);
  };

  const handleToggleAdminPage = () => {
    setShowAdminPage(!showAdminPage);
    setShowMyBookings(false); // Hide My Bookings
    setShowContactPage(false); // Hide Contact Us button
  };

  const handleToggleMyBookings = () => {
    setShowMyBookings(!showMyBookings);
    setShowAdminPage(false); // Hide Admin Mode
    setShowContactPage(false); // Hide Contact Us button
  };

  const handleToggleContactPage = () => {
    setShowContactPage(!showContactPage);
  };

  if (showBookingPage) {
    return <BookingPage />;
  }

  return (
    <div
      style={{
        backgroundImage: showAdminPage || showMyBookings ? 'none' : `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
      }}
    >
      <div
        style={{
          backgroundColor: '#D3D3D3',
          padding: '33px',
          position: 'relative',
          border: '2px solid darkgrey',
        }}
      >
          <button
            style={{ position: 'absolute', top: '20px', right: '20px' }}
            onClick={handleBookNow}
          >
            Book Now
          </button>

        {!showAdminPage && (
          <button
            style={{ position: 'absolute', top: '20px', right: '150px' }}
            onClick={handleToggleMyBookings}
          >
            {showMyBookings ? 'Hide My Bookings' : 'My Bookings'}
          </button>
        )}

        {!showMyBookings && (
          <button
            style={{ position: 'absolute', top: '20px', left: '20px', marginRight: '50px' }}
            onClick={handleToggleAdminPage}
          >
            {showAdminPage ? 'Hide Admin ' : 'Admin Mode'}
          </button>
        )}
      </div>

      {!showAdminPage && !showMyBookings && !showContactPage && (
        <div style={{ marginTop: '88px', marginBottom: '100px' }}>
          <h1 className="welcome-heading">Welcome to Our Restaurant</h1>
          <p>Here you can discover a delightful dining experience.</p>
        </div>
      )}

      {showAdminPage && <AdminPage />}
      {showMyBookings && <MyBookings />}

      {showContactPage && (
        <div>
          <ContactPage />
          <button
            style={{ position: 'fixed', bottom: '20px', left: "20px" }}
            onClick={handleToggleContactPage}
          >
            Back
          </button>
        </div>
      )}

      {!showContactPage && !showAdminPage && !showMyBookings && (
        <button
          style={{ position: 'fixed', bottom: '20px', left: "20px" }}
          onClick={handleToggleContactPage}
        >
          Contact Us
        </button>
      )}
    </div>
  );
}

export default StartPage;
