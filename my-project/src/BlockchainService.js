import { useState, useEffect } from "react";
import Web3 from "web3";
import { RESTAURANT_ADDRESS, RESTAURANT_ABI } from "./BlockchainConfig";

export function BlockchainService() {
  const [account, setAccount] = useState();
  const [bookingList, setBookingList] = useState([]);
  const [contract, setContract] = useState();

  useEffect(() => {
    const getAccounts = async () => {
      const web3 = new Web3(Web3.givenProvider || "http://localhost:7545");
      const accountLoggedIn = await web3.eth.getAccounts();
      setAccount(accountLoggedIn[0]);
      const contract = new web3.eth.Contract(RESTAURANT_ABI, RESTAURANT_ADDRESS);
      setContract(contract);
      await updatedBookingList(contract);
    };
    if (account) return;
    getAccounts();
  });

  const updatedBookingList = async (contract) => {
    if (!contract) return;
    let bookingIndexes = await contract.methods.bookingCount().call();
    let bookingList = [];
    for (let i = 1; i <= bookingIndexes; i++) {
      let booking = await contract.methods.bookings(i).call();
      if (booking.id && booking.name) { 
        bookingList.push(booking);
      };
    };
    setBookingList(bookingList);
    console.log(bookingList);
    return bookingList;
  };

  const changeBooking = async (oneBooking) => {
    await contract.methods
      .editBooking(oneBooking.id, oneBooking.numberOfGuests, oneBooking.name, oneBooking.date, oneBooking.time)
      .send({ from: account })
      .once("receipt", async (receipt) => {
        await updatedBookingList(contract);
      });
    window.location.reload();
  };

  return {
    updatedBookingList, 
    changeBooking, 
    bookingList
  };
};