import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { RESTAURANT_ABI, RESTAURANT_ADDRESS } from "../BlockchainConfig";
import StartPage from './StartPage';

const web3 = new Web3(Web3.givenProvider || "http://localhost:8545");

function BookingPage() {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [date, setDate] = useState('');
  const [numGuests, setNumGuests] = useState(1);
  const [bookings, setBookings] = useState([]);
  const [availabilityStatus, setAvailabilityStatus] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [showStartPage, setShowStartPage] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const initializeContract = async () => {
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);
      console.log(accounts[0]);

      const restaurantContract = new web3.eth.Contract(
        RESTAURANT_ABI,
        RESTAURANT_ADDRESS
      );
      setContract(restaurantContract);
    };

    initializeContract();
  }, []);

    useEffect(() => {
      const fetchBookings = async () => {
        const accounts = await web3.eth.getAccounts();
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
    
        const filteredBookings = fetchedBookings.filter(
          (booking) => booking.date === date
        );
    
        setBookings(filteredBookings);
      };
    
      fetchBookings();
    }, [date]);
    

  const handleBack = () => {
    setShowStartPage(true);
  };

const handleCheckAvailability = async () => {
  if (!date || !numGuests || numGuests < 1 || numGuests > 6) {
    setError("Please select a valid date and number of guests (1-6).");
    console.error("Please select a valid date and number of guests (1-6).");
    return;
  }

  setError('');

  const dateObj = new Date(date);
  const unixTimestamp = Math.floor(dateObj.getTime() / 1000); // Convert to seconds
  const dateBN = web3.utils.toBN(unixTimestamp);

  const fetchedBookings = await contract.methods.getBookings(dateBN.toString()).call();
  const parsedBookings = fetchedBookings.map((booking) => ({
    restaurantId: parseInt(booking.restaurantId),
    date: booking.date,
    time: booking.time,
    numGuests: parseInt(booking[1]), // Access the correct key for numberOfGuests
  }));

  setBookings(parsedBookings);

  const bookingsForSelectedDate = parsedBookings.filter(
    (booking) => booking.date === date
  );
  const totalGuests = bookingsForSelectedDate.reduce(
    (acc, booking) => acc + booking.numGuests,
    0
  );

  console.log("Total guests booked for the selected date:", totalGuests);

  if (bookingsForSelectedDate.length >= 2) {
    // Maximum number of bookings reached, show error message
    setAvailabilityStatus('unavailable');
  } else {
    // Check if any of the timeslots are available
    const availableTimeslots = ['18:00', '21:00'];

    const bookedTimeslots = bookingsForSelectedDate.map((booking) => booking.time);
    const availableTimeslotsFiltered = availableTimeslots.filter(
      (timeslot) => !bookedTimeslots.includes(timeslot)
    );

    if (availableTimeslotsFiltered.length === 0) {
      // All timeslots are booked, show error message
      setAvailabilityStatus('unavailable');
    } else {
      // At least one timeslot is available, allow selecting a time
      setAvailabilityStatus('available');
    }
  }
};

  
  
  
  
  

  const handleTimeSelection = (time) => {
    setSelectedTime(time);
  };

  const handleBook = async () => {
    if (!selectedTime || !numGuests || numGuests < 1 || numGuests > 6) {
      setError("Please select a valid time and number of guests (1-6).");
      return;
    }
  
    setError('');
  
    const dateObj = new Date(date);
    const unixTimestamp = Math.floor(dateObj.getTime() / 1000); // Convert to seconds
    const dateBN = web3.utils.toBN(unixTimestamp);
    const selectedTimeBN = web3.utils.toBN(selectedTime.replace(':', '')); // Convert selectedTime to BigNumber
  
    const filteredBookings = bookings.filter(
      (booking) =>
        booking.date === dateBN.toString() && booking.time === selectedTime
    );
  
    const totalGuests = filteredBookings.reduce(
      (acc, booking) => acc + parseInt(booking.numGuests),
      0
    );
  
    if (totalGuests + numGuests > 90) {
      setError("This timeslot is fully booked.");
      return;
    }
  
    // Check if the selected timeslot is available
    const isTimeSlotAvailable = filteredBookings.length < 2;
    if (!isTimeSlotAvailable) {
      setError("This timeslot is fully booked.");
      return;
    }
  
    await contract.methods
      .createBooking(
        numGuests,
        account,
        dateBN.toString(),
        selectedTimeBN.toString(), // Pass selectedTime as a string BigNumber
        1 // Replace with the desired restaurantId
      )
      .send({ from: account });
  
    console.log("Booking created successfully!");
  };
  
  
  
  

  
  
  

  if (showStartPage) {
    return <StartPage />;
  }

  return (
    <div style={{ backgroundColor: '#EEEDE8', minHeight: '100vh' }}>
      <div
        style={{
          backgroundColor: '#D3D3D3',
          padding: '33px',
          position: 'relative',
          border: '2px solid darkgrey'
        }}
      ></div>
      <h1>Booking:</h1>
      <p>Check available tables</p>
      <button style={{ position: 'absolute', top: '20px', left: '20px' }} onClick={handleBack}>Back</button>

      <div style={{ marginTop: '20px' }}>
        <label htmlFor="date">Date: </label>
        <input
          type="date"
          id="date"
          name="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
      </div>

      <div style={{ marginTop: '20px' }}>
        <label htmlFor="numGuests">Number of Guests: </label>
        <input
          type="number"
          id="numGuests"
          name="numGuests"
          value={numGuests}
          min={1}
          max={6}
          onChange={(event) => setNumGuests(parseInt(event.target.value))}
        />
      </div>

      <button type="button" onClick={handleCheckAvailability} style={{ marginTop: '20px' }}>
        Check Availability
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {availabilityStatus === 'available' && (
        <>
          <h2>Available Time Slots:</h2>
          <div>
  {['18:00', '21:00'].map((timeslot, index) => {
  const bookedPersonsCount = bookings
    .filter((booking) => booking.time === timeslot && booking.date === date)
    .reduce((acc, booking) => acc + booking.numGuests, 0);

  const isButtonDisabled = bookedPersonsCount >= 90;

  return (
    <button
      key={timeslot}
      type="button"
      onClick={() => handleTimeSelection(timeslot)}
      style={{
        marginRight: index === 0 ? '5px' : '0',
        marginLeft: index === 1 ? '5px' : '0',
        opacity: isButtonDisabled ? 0.5 : 1
      }}
      disabled={isButtonDisabled}
    >
      {timeslot}
    </button>
  );
})}


          </div>
        </>
      )}

      {availabilityStatus === 'unavailable' && (
        <p>Please select another date. Bookings are full.</p>
      )}

      {selectedTime && (
        <div>
          <p>You have selected {selectedTime} for {numGuests} guests.</p>
          <button type="button" onClick={handleBook}>
            Book
          </button>
        </div>
      )}
    </div>
  );
}

export default BookingPage;


