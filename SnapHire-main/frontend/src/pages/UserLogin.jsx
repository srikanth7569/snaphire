import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserDataContext } from '../context/UserContext';
import socket from '../socket';

// design reference (dev environment will map path to a URL)
const uploadedScreenshot = "/mnt/data/Screenshot 2025-11-24 at 9.22.59 PM.png";

const UserLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { setUser } = useContext(UserDataContext);

  // Inject Poppins font for consistent polished UI (front-end only)
  useEffect(() => {
    const id = 'snaphire-poppins-login';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap';
      document.head.appendChild(link);
    }
    document.documentElement.style.fontFamily = "'Poppins', system-ui, -apple-system, 'Segoe UI', Roboto, Arial";
  }, []);

  const submithandler = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/users/login`, { email, password });
      if (response.status === 200) {
        const data = response.data;
        localStorage.setItem('userId', data.user._id);
        localStorage.setItem('userToken', data.token);
        localStorage.setItem('firstname', data.user.fullname.firstname);
        localStorage.setItem('lastname', data.user.fullname.lastname);
        if (setUser) setUser(data.user);

        // keep existing socket behavior
        socket.emit('joinUserRoom', data.user._id);
        // using toast or alert is fine; keep existing alert for now
        alert('Login successful ✅');
        navigate('/home');
      }
    } catch (error) {
      alert('Login failed ❌');
      console.error('Login error:', error.response?.data || error.message);
    }
    setEmail('');
    setPassword('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      {/* GLADIA-STYLE NAVBAR (consistent with other pages) */}
      <header className="fixed top-4 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <div className="pointer-events-auto w-full max-w-7xl px-4">
          <div className="w-full bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl px-6 sm:px-10 py-3 flex items-center justify-between shadow-[0_8px_40px_rgba(0,0,0,0.6)]">
            <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/')}>
              <img src="/assets/SnapHire-6-2-removebg-preview.png" alt="SnapHire Logo" className="w-20 sm:w-28" loading="lazy" />
            </div>

            <nav className="hidden md:flex items-center gap-10">
              <button onClick={() => navigate('/')} className="text-white/90 hover:text-white transition text-sm font-medium">Home</button>
              <button onClick={() => navigate('/captain-signup')} className="text-white/90 hover:text-white transition text-sm font-medium">Partner</button>
              <button onClick={() => navigate('/contact')} className="text-white/90 hover:text-white transition text-sm font-medium">Contact</button>
            </nav>

            <div className="hidden md:flex items-center gap-4">
              <button onClick={() => navigate('/login')} className="bg-white/10 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-white/20 transition">Request a Demo</button>
              <button onClick={() => navigate('/signup')} className="bg-white text-black px-5 py-2 rounded-full text-sm font-semibold hover:bg-gray-200 transition">Sign Up</button>
            </div>

            <div className="md:hidden">
              <button onClick={() => navigate('/login')} className="bg-yellow-500 text-black px-3 py-2 rounded-full text-sm font-medium">Get Started</button>
            </div>
          </div>
        </div>
      </header>

      {/* spacer for header */}
      <div className="h-28" />

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 pb-8">
        <form onSubmit={submithandler} className="w-full max-w-md bg-black/70 backdrop-blur-md p-8 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7)]">
          <h2 className="text-3xl font-bold mb-4 text-center text-yellow-400">Welcome back</h2>
          <p className="text-center text-white/70 mb-6">Login to continue hiring photographers and reel makers.</p>

          <label className="block mb-1 font-semibold text-yellow-400">Email</label>
          <input
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="email@example.com"
            className="w-full px-4 py-3 mb-4 rounded-lg bg-black/20 border border-yellow-400/30 text-white placeholder-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />

          <label className="block mb-1 font-semibold text-yellow-400">Password</label>
          <input
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="password"
            className="w-full px-4 py-3 mb-6 rounded-lg bg-black/20 border border-yellow-400/30 text-white placeholder-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />

          <button type="submit" className="w-full py-3 mb-4 rounded-full bg-yellow-500 text-black font-bold hover:bg-yellow-600 transition-shadow shadow-md">Login</button>

          <p className="text-center text-yellow-300 mb-2">New Here? <Link to="/signup" className="text-yellow-400 font-semibold underline">Create Account</Link></p>

          <div className="mt-3 flex justify-center">
            <Link to="/captain-signup" className="w-full max-w-sm py-3 flex items-center justify-center rounded-full bg-black/30 border-2 border-yellow-500 text-yellow-400 font-bold hover:bg-yellow-500 hover:text-black transition-shadow shadow-md">Sign In As Captain</Link>
          </div>
        </form>
      </main>

      <footer className="w-full bg-black py-4 text-center text-yellow-400 text-sm">&copy; SnapHire. All rights reserved.</footer>

      {/* reference path for QA */}
      
    </div>
  );
};

export default UserLogin;
