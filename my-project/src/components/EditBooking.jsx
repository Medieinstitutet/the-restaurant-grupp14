import { BlockchainService } from "../BlockchainService";
import { useState } from "react";

export function EditBooking() {
    
  const { bookingList, changeBooking } = BlockchainService();
  const [showEditBookingForm, setShowEditBookingForm] = useState(false);
  const [oneBooking, setOneBooking] = useState({});
  const [editingBookingId, setEditingBookingId] = useState(null);
  
  const handleEditBooking = (id) => {
 
    const bookingToEdit = bookingList.find((booking) => booking.id === id);
  
    setOneBooking(bookingToEdit);
    setEditingBookingId(id);
    setShowEditBookingForm(true); 
  };
  
  const handleChange = (e) => {
      
    const { name, value } = e.target;
    setOneBooking((prevBooking) => ({
      ...prevBooking,
      [name]: value,
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    changeBooking(oneBooking);
    setShowEditBookingForm(false);
  };

  return {
    handleEditBooking,
    handleChange,
    handleSubmit,
    showEditBookingForm,
    oneBooking,
    editingBookingId
  };
};
  