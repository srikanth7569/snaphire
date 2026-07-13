import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import React from 'react';

const CaptainLogout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear captain data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('captainId');

    toast.success('Logged out successfully!');
    navigate('/captain-login'); // Redirect to login page
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full text-left p-2 rounded flex items-center gap-2 hover:bg-gray-100 transition"
    >
      Logout
    </button>
  );
};

export default CaptainLogout;
