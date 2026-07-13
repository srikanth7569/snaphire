import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import socket from '../socket';

const CaptainLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const submithandler = async (e) => {
    e.preventDefault();
    const loginData = { email, password };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/captains/login`,
        loginData
      );

      if (response.status === 200) {
        const data = response.data;
        console.log("✅ Login API Response:", response.data);

        // Store token + captainId
        localStorage.setItem('token', data.token);
        localStorage.setItem('captainId', data.captain._id);
        localStorage.setItem('captainId', data.captain._id);
        localStorage.setItem('firstname', data.captain.fullname.firstname);
        localStorage.setItem('lastname', data.captain.fullname.lastname);

        socket.emit('joinCaptainRoom', data.captain._id);

        toast.success('Captain logged in successfully!');
        navigate('/captain-dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      console.error(error);
    }

    setEmail('');
    setPassword('');
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-black text-white font-sans">
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 sm:px-16 py-4 bg-black/50 backdrop-blur-md shadow-md">
        <img
          className="w-20 sm:w-28 cursor-pointer"
          src="/assets/SnapHire-6-2-removebg-preview.png"
          alt="Logo"
          onClick={() => navigate('/')}
        />
        <div className="hidden sm:flex gap-6 text-white font-semibold text-sm sm:text-base">
          <span onClick={() => navigate('/')} className="hover:text-yellow-400 cursor-pointer">Home</span>
          <span onClick={() => navigate('/captain-signup')} className="hover:text-yellow-400 cursor-pointer">Partner</span>
          <span onClick={() => navigate('/contact')}className="hover:text-yellow-400 cursor-pointer">Contact Us</span>
        </div>
      </nav>

      {/* Login Form Section */}
      <section className="flex-grow flex justify-center items-center px-6 sm:px-0 pt-24">
        <div className="w-full max-w-md bg-black/70 backdrop-blur-md border border-yellow-400/30 rounded-2xl shadow-xl p-8">
          <div className="flex flex-col items-center mb-6">
            <img 
              className="w-24 mb-4"
              src="/assets/SnapHire-3-removebg-preview-2.png"
              alt="SnapHire Logo"
            />
            <h2 className="text-2xl font-bold text-yellow-400">Captain Login</h2>
            <p className="text-white/70 text-sm mt-2">Sign in to manage your shoots and gigs</p>
          </div>

          <form onSubmit={submithandler} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block mb-1 text-yellow-300">Email</label>
              <input
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-black/50 border border-yellow-400/40 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                type="email"
                placeholder="email@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block mb-1 text-yellow-300">Password</label>
              <input
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-black/50 border border-yellow-400/40 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                type="password"
                placeholder="Enter your password"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-yellow-500 text-black font-semibold rounded-lg shadow-md hover:bg-yellow-600 transition"
            >
              Login
            </button>

            <p className="text-center text-sm text-white/70">
              New here?{" "}
              <Link to="/captain-signup" className="text-yellow-400 hover:underline">
                Register as a Captain
              </Link>
            </p>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <hr className="flex-grow border-yellow-400/30" />
            <span className="mx-2 text-sm text-white/50">or</span>
            <hr className="flex-grow border-yellow-400/30" />
          </div>

          {/* Switch to User Login */}
          <Link
            to="/login"
            className="block w-full text-center py-3 bg-green-600 hover:bg-green-700 transition text-white font-semibold rounded-lg shadow-md"
          >
            Sign In As User
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-yellow-400 py-6 text-center border-t border-yellow-400/20">
        &copy; 2025 SnapHire. All rights reserved.
      </footer>
    </div>
  );
};

export default CaptainLogin;
