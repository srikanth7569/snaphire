import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AiOutlineCamera, AiOutlineLogout, AiOutlineSetting } from 'react-icons/ai';
import { MdOutlineDashboard, MdOutlinePerson, MdOutlinePhotoLibrary } from 'react-icons/md';
import socket from '../socket';
import { FaBell } from 'react-icons/fa';

// Booking Card Component
const BookingCard = ({ booking, onStatusChange }) => {
  const statusColors = {
    Pending: 'text-yellow-400',
    Accepted: 'text-green-400',
    Declined: 'text-red-400',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-black/30 backdrop-blur-md border border-yellow-400/20 rounded-2xl shadow-lg p-5 transition"
    >
      <h2 className="text-xl font-semibold text-yellow-400 mb-2 flex items-center gap-2">
        <AiOutlineCamera /> {booking.shootType}
      </h2>
      <p className="text-gray-200">📍 Location: {booking.location?.city || booking.location}</p>
      <p className="text-gray-200">
        🧑 Booked By: {booking.userId?.fullname?.firstname || 'Unknown'}{' '}
        {booking.userId?.fullname?.lastname || ''}
      </p>
      <p className="text-gray-200">📧 Email: {booking.userId?.email || 'N/A'}</p>
      <p className={`mt-2 font-semibold ${statusColors[booking.status] || 'text-gray-400'}`}>
        Status: {booking.status}
      </p>
      {booking.status === 'Pending' && onStatusChange && (
        <div className="mt-4 flex gap-2 justify-center">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onStatusChange(booking._id, 'Accepted')}
            className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg shadow transition"
          >
            Accept
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onStatusChange(booking._id, 'Declined')}
            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg shadow transition"
          >
            Decline
          </motion.button>
        </div>
      )}
    </motion.div>
  );
};

// Sidebar Button
const SidebarButton = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 p-2 rounded-xl transition
      ${active ? 'bg-yellow-500/30 text-white font-semibold' : 'text-white/80 hover:bg-yellow-500/20'}`}
  >
    {icon} {label}
  </button>
);

// Logout Button
const LogoutButton = ({ onLogout }) => (
  <motion.button
    whileTap={{ scale: 0.95 }}
    onClick={onLogout}
    className="w-full text-left p-2 rounded flex items-center gap-2 hover:bg-yellow-500/20 text-yellow-400 font-semibold mt-auto"
  >
    <AiOutlineLogout /> Logout
  </motion.button>
);

// Previous Bookings in Sidebar
const PreviousBookings = ({ bookings }) => (
  <div className="mt-6">
    <h3 className="text-yellow-400 font-semibold mb-2">Previous Bookings</h3>
    <div className="space-y-1 max-h-48 overflow-y-auto">
      {bookings.map(b => (
        <p key={b._id} className="text-white/80 text-sm">
          {b.shootType} - {b.status}
        </p>
      ))}
    </div>
  </div>
);

// Profile Tab
const ProfileTab = ({ profileData, setProfileData }) => {
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const handleChange = (e) => {
    setProfileData(prev => ({
      ...prev,
      fullname: { ...prev.fullname, [e.target.name]: e.target.value }
    }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.patch(
        `${BASE_URL}/captains/${profileData._id}`,
        profileData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Profile updated successfully!");
      setProfileData(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile");
    }
  };

  return (
    <div className="max-w-md space-y-4">
      <input
        type="text"
        name="firstname"
        value={profileData.fullname?.firstname || ''}
        onChange={handleChange}
        placeholder="First Name"
        className="w-full p-2 rounded bg-black/20 text-white"
      />
      <input
        type="text"
        name="lastname"
        value={profileData.fullname?.lastname || ''}
        onChange={handleChange}
        placeholder="Last Name"
        className="w-full p-2 rounded bg-black/20 text-white"
      />
      <input
        type="email"
        name="email"
        value={profileData.email || ''}
        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
        placeholder="Email"
        className="w-full p-2 rounded bg-black/20 text-white"
      />
      <input
        type="text"
        name="city"
        value={profileData.location?.city || ''}
        onChange={(e) => setProfileData({ ...profileData, location: { ...profileData.location, city: e.target.value } })}
        placeholder="City"
        className="w-full p-2 rounded bg-black/20 text-white"
      />
      <button
        onClick={handleSave}
        className="bg-yellow-500 hover:bg-yellow-600 py-2 px-4 rounded text-black font-semibold"
      >
        Save Changes
      </button>
    </div>
  );
};

// Media Upload Tab
const MediaUploadTab = () => {
  const [files, setFiles] = useState([]);
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const handleFileChange = (e) => setFiles(e.target.files);

  const handleUpload = async () => {
    if (!files.length) return toast.error("Select files to upload!");
    const formData = new FormData();
    Array.from(files).forEach(file => formData.append('media', file));

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${BASE_URL}/captains/upload-media`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
      });
      toast.success("Files uploaded successfully!");
      setFiles([]);
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    }
  };

  return (
    <div className="max-w-md space-y-4">
      <input type="file" multiple onChange={handleFileChange} className="text-white" />
      <button
        onClick={handleUpload}
        className="bg-yellow-500 hover:bg-yellow-600 py-2 px-4 rounded text-black font-semibold"
      >
        Upload Media
      </button>
    </div>
  );
};

// Booking History Tab
const BookingHistoryTab = ({ bookings }) => {
  const performance = {
    total: bookings.length,
    accepted: bookings.filter(b => b.status === 'Accepted').length,
    declined: bookings.filter(b => b.status === 'Declined').length,
    pending: bookings.filter(b => b.status === 'Pending').length,
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-yellow-400">Booking History</h2>

      <div className="mb-6 p-4 rounded-xl bg-black/20">
        <p>Total Bookings: {performance.total}</p>
        <p className="text-green-400">Accepted: {performance.accepted}</p>
        <p className="text-red-400">Declined: {performance.declined}</p>
        <p className="text-yellow-400">Pending: {performance.pending}</p>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {bookings.map(b => (
          <BookingCard key={b._id} booking={b} onStatusChange={null} />
        ))}
      </div>
    </div>
  );
};

const POLLING_INTERVAL = 5000; // 5 seconds

const CaptainDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [captain, setCaptain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [profileData, setProfileData] = useState({});
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const captainId = localStorage.getItem('captainId');

  const menuItems = [
    { label: 'Dashboard', icon: <MdOutlineDashboard /> },
    { label: 'Booking History', icon: <AiOutlineCamera /> },
    { label: 'Profile', icon: <MdOutlinePerson /> },
    { label: 'Media Upload', icon: <MdOutlinePhotoLibrary /> },
    { label: 'Settings', icon: <AiOutlineSetting /> },
  ];

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { Authorization: token ? `Bearer ${token}` : '' };
  };

  useEffect(() => {
    const storedCaptainId = localStorage.getItem('captainId');
    if (!storedCaptainId) {
      toast.error("Captain ID not found. Please login again.");
      navigate('/captain-login');
      return;
    }

    const fetchCaptainData = async () => {
      try {
        const captainRes = await axios.get(`${BASE_URL}/captains/${storedCaptainId}`, { headers: getAuthHeaders() });
        setCaptain(captainRes.data);
        setProfileData(captainRes.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load captain profile");
      }
    };

    const fetchBookings = async () => {
      try {
        const bookingsRes = await axios.get(`${BASE_URL}/bookings/captain/${storedCaptainId}`, { headers: getAuthHeaders() });
        setBookings(Array.isArray(bookingsRes.data) ? bookingsRes.data : bookingsRes.data.bookings || []);
        setLoading(false);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load bookings");
        setLoading(false);
      }
    };

    fetchCaptainData();
    fetchBookings();
    const interval = setInterval(fetchBookings, POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, [navigate]);

  useEffect(() => {
    if (!captainId) return;
    socket.emit('joinCaptainRoom', captainId);

    socket.on('captainNotification', (data) => {
      setNotifications(prev => [...prev, data.message]);
    });

    return () => {
      socket.off('captainNotification');
    };
  }, [captainId]);

  const handleBookingStatusChange = async (bookingId, status) => {
    try {
      const response = await axios.patch(
        `${BASE_URL}/bookings/${bookingId}`,
        { status },
        { headers: getAuthHeaders() }
      );

      const updatedBooking = response.data;
      setBookings(prev => prev.map(b => (b._id === bookingId ? { ...b, status: updatedBooking.status } : b)));
      toast.success(`Booking ${status.toLowerCase()} successfully!`);

      const userId = updatedBooking.userId?._id || updatedBooking.userId;
      if (!userId) return;

      await axios.post(
        `${BASE_URL}/notifications`,
        { userId, message: `Your booking for "${updatedBooking.shootType}" has been ${status.toLowerCase()}.` },
        { headers: getAuthHeaders() }
      );
    } catch (err) {
      console.error("Error updating booking status or sending notification:", err.response?.data || err.message);
      toast.error("Failed to update booking status or send notification.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('captainId');
    toast.success('Logged out successfully!');
    navigate('/captain-login');
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      {/* Sidebar */}
      <aside className="w-64 p-4 bg-black/30 backdrop-blur-md rounded-3xl shadow-lg flex flex-col">
        <div className="flex items-center gap-3 mb-8 cursor-pointer">
          <div className="w-12 h-12 bg-yellow-500/30 backdrop-blur-md rounded-full flex items-center justify-center text-black font-bold">
            {captain?.fullname?.firstname?.charAt(0) || 'C'}
          </div>
          <div>
            <p className="font-semibold">{captain?.fullname?.firstname || 'Captain'}</p>
            <p className="text-yellow-400 text-sm">View Profile</p>
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-2">
          {menuItems.map(item => (
            <SidebarButton
              key={item.label}
              icon={item.icon}
              label={item.label}
              active={activeMenu === item.label}
              onClick={() => setActiveMenu(item.label)}
            />
          ))}
          <PreviousBookings bookings={bookings} />
          <LogoutButton onLogout={handleLogout} />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-4"
        >
          Captain Dashboard
        </motion.h1>

        <div className="relative mb-4">
          <FaBell className="text-yellow-400 text-2xl cursor-pointer" />
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-yellow-500 w-4 h-4 rounded-full border border-black text-[10px] flex items-center justify-center">
              {notifications.length}
            </span>
          )}
        </div>
        <div>
          {notifications.map((note, idx) => (
            <div key={idx} className="text-sm text-yellow-400">{note}</div>
          ))}
        </div>

        {activeMenu === 'Dashboard' && (
          <>
            <h2 className="text-2xl font-semibold mb-4 text-yellow-400 flex items-center gap-2"><MdOutlineDashboard /> Booking Requests</h2>
            {loading ? <p>Loading...</p> : bookings.filter(b => b.status === 'Pending').length === 0 ? <p>No pending bookings!</p> :
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {bookings.filter(b => b.status === 'Pending').map(b => (
                  <BookingCard key={b._id} booking={b} onStatusChange={handleBookingStatusChange} />
                ))}
              </div>
            }
          </>
        )}

        {activeMenu === 'Booking History' && <BookingHistoryTab bookings={bookings} />}
        {activeMenu === 'Profile' && <ProfileTab profileData={profileData} setProfileData={setProfileData} />}
        {activeMenu === 'Media Upload' && <MediaUploadTab />}
      </main>
    </div>
  );
};

export default CaptainDashboard;
