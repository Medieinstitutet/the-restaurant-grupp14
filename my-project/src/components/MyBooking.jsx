import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { RESTAURANT_ABI, RESTAURANT_ADDRESS } from "../BlockchainConfig";
import { EditBooking } from "./EditBooking";

const web3 = new Web3(Web3.givenProvider || "http://localhost:8545");

function MyBooking({ accounts }) {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      const contract = new web3.eth.Contract(
        RESTAURANT_ABI,
        RESTAURANT_ADDRESS
      );

      const restaurantId = 1; // Replace with the desired restaurantId
      const bookingIds = await contract.methods.getBookings(restaurantId).call();
      const fetchedBookings = [];

      for (let i = 0; i < bookingIds.length; i++) {
        const bookingId = bookingIds[i];
        const booking = await contract.methods.bookings(bookingId).call();
        fetchedBookings.push(booking);
      }

      // Filter bookings based on names matching the user's Ethereum address
      const filteredBookings = fetchedBookings.filter((booking) => booking.name === accounts[0]);

      setBookings(filteredBookings);
    };

    fetchBookings();
  }, [accounts]);

  const handleDeleteBooking = async (bookingId) => {
    try {
      const contract = new web3.eth.Contract(
        RESTAURANT_ABI,
        RESTAURANT_ADDRESS
      );
      
      await contract.methods.removeBooking(bookingId).send({ from: accounts[0] });

      const updatedBookings = bookings.filter((booking) => booking.id !== bookingId);
      setBookings(updatedBookings);
    } catch (error) {
      console.error(error);
      // Handle error if the transaction fails
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    return `${day}-${month}-${year}`;
  };

  const { handleEditBooking, handleChange, handleSubmit, showEditBookingForm, oneBooking, editingBookingId } = EditBooking();

  return (
    <div style={{ backgroundColor: '#EEEDE8', minHeight: '100vh'}}>
      <h2 style={{textDecorationLine: 'underline'}}>My Bookings:</h2>
      <ul style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        {bookings.map((booking, index) => (
          <li
            key={index}
            style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}
          >
            {showEditBookingForm && editingBookingId === booking.id ? (
              <div style={{ flex: '1', textAlign: 'center', margin: "50px" }}>
                <form onSubmit={handleSubmit}>
                  <label htmlFor="numberOfGuests"><strong>Number of Guests:</strong></label>
                  <input
                    type="number"
                    name="numberOfGuests"
                    id="numberOfGuests"
                    value={oneBooking.numberOfGuests}
                    onChange={handleChange}
                    min={1}
                    max={6}
                    required
                    style={{ marginLeft: "5px", marginRight: '5px' }}
                  />

                  <label htmlFor="time"><strong>Time:</strong></label>
                  <select
                    name="time"
                    id="time"
                    value={oneBooking.time}
                    onChange={handleChange}
                    style={{ marginLeft: "5px", marginRight: '5px' }}
                  >
                    <option value="1800">18:00</option>
                    <option value="2100">21:00</option>
                  </select>
                  <p style={{ fontweight: "lighter"}}>
Would you like to change the date? No worries! Simply cancel your current order and make a new booking with the desired date.</p>

                  <button type="submit" style={{ marginLeft: '10px' }}>Save</button>
                </form>
              </div>
            ) : (
              <>
                <div style={{ flex: '1' }}>
                  <p style={{ marginLeft: "30px", marginBottom: '5px' }}>
                    <span style={{ fontWeight: 'bold' }}>Booking ID: </span>{booking.id}<br />
                    <span style={{ fontWeight: 'bold' }}>Number of Guests: </span>{booking.numberOfGuests}<br />
                    <span style={{ fontWeight: 'bold' }}>Name:</span> {booking.name}<br />
                    <span style={{ fontWeight: 'bold' }}>Date </span>{formatDate(booking.date)}<br />
                    <span style={{ fontWeight: 'bold' }}>Time: </span> {booking.time}<br />
                  </p>
                </div>
                <button
                  title="Cancel booking"
                  className="delete"
                  style={{ width: '33px', height: '33px', padding: '3px' }}
                  onClick={() => handleDeleteBooking(booking.id)}
                >
                  X
                </button>
                <button
                  title="Edit booking"
                  className="edit"
                  style={{ width: '33px', height: '33px', padding: '3px' }}
                  onClick={() => handleEditBooking(booking.id)}
                >
                  Edit
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ParentComponent() {
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    const fetchAccounts = async () => {
      const fetchedAccounts = await web3.eth.getAccounts();
      setAccounts(fetchedAccounts);
    };

    fetchAccounts();
  }, []);

  return (
    <div>
      <MyBooking accounts={accounts} />
    </div>
  );
}

export default ParentComponent;
