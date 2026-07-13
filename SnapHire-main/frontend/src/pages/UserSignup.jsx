// src/pages/UserSignup.jsx
import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { UserDataContext } from '../context/UserContext';

const UserSignup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const { setUser } = useContext(UserDataContext);
  const navigate = useNavigate();

  // Inject Poppins font (front-end only)
  useEffect(() => {
    const id = 'signup-poppins';
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

    const newUser = {
      fullname: { firstname, lastname },
      email,
      password
    };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/users/register`,
        newUser
      );

      if (response.status === 201) {
        const data = response.data;
        setUser(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.user._id);
        localStorage.setItem('firstname', data.user.fullname.firstname);
        localStorage.setItem('lastname', data.user.fullname.lastname);
        toast.success('User registered successfully!');
        navigate('/home');
      }

      setEmail('');
      setFirstname('');
      setLastname('');
      setPassword('');
    } catch (error) {
      console.error('Signup failed:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* GLADIA-STYLE NAVBAR */}
      <header className="fixed top-4 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <div className="pointer-events-auto w-full max-w-7xl px-4">
          <div className="w-full bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl px-6 sm:px-10 py-3 flex items-center justify-between shadow-[0_8px_40px_rgba(0,0,0,0.6)]">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <img
                src="/assets/SnapHire-6-2-removebg-preview.png"
                alt="SnapHire Logo"
                className="w-20 sm:w-28"
                loading="lazy"
              />
            </div>

            {/* Center links */}
            <nav className="hidden md:flex items-center gap-10">
              <button onClick={() => navigate('/')} className="text-white/90 hover:text-white transition text-sm font-medium">Home</button>
              <button onClick={() => navigate('/captain-signup')} className="text-white/90 hover:text-white transition text-sm font-medium">Partner</button>
              <button onClick={() => navigate('/contact')} className="text-white/90 hover:text-white transition text-sm font-medium">Contact</button>
            </nav>

            {/* Right CTAs */}
            <div className="hidden md:flex items-center gap-4">
              <button className="bg-white/10 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-white/20 transition" onClick={() => navigate('/login')}>Request a Demo</button>
              <button className="bg-white text-black px-5 py-2 rounded-full text-sm font-semibold hover:bg-gray-200 transition" onClick={() => navigate('/login')}>Sign Up</button>
            </div>

            {/* Mobile CTA */}
            <div className="md:hidden">
              <button onClick={() => navigate('/login')} className="bg-yellow-500 text-black px-3 py-2 rounded-full text-sm font-medium">Get Started</button>
            </div>
          </div>
        </div>
      </header>

      {/* spacer for fixed header */}
      <div className="h-28 md:h-28" />

      {/* SIGNUP CARD */}
      <main className="flex justify-center items-start px-4">
        <section className="w-full max-w-3xl mt-8 mb-12">
          <div className="mx-auto bg-black/70 backdrop-blur-md border border-yellow-400/20 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] p-10 max-w-lg">
            <div className="flex flex-col items-center mb-6">
              <img
                className="w-28 mb-4"
                src="/assets/SnapHire-3-removebg-preview-2.png"
                alt="SnapHire Logo"
                loading="lazy"
              />
              <h2 className="text-3xl font-bold text-yellow-400">Create your account</h2>
              <p className="text-white/70 text-sm mt-2 text-center">Sign up to hire photographers and reel makers in seconds.</p>
            </div>

            <form onSubmit={submithandler} className="space-y-4" aria-label="Signup form">
              <div className="flex gap-3">
                <label className="sr-only">First name</label>
                <input
                  required
                  value={firstname}
                  onChange={(e) => setFirstname(e.target.value)}
                  placeholder="First Name"
                  className="flex-1 px-4 py-3 rounded bg-black/20 border border-yellow-400/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />

                <label className="sr-only">Last name</label>
                <input
                  required
                  value={lastname}
                  onChange={(e) => setLastname(e.target.value)}
                  placeholder="Last Name"
                  className="flex-1 px-4 py-3 rounded bg-black/20 border border-yellow-400/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              <label className="sr-only">Email</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full px-4 py-3 rounded bg-black/20 border border-yellow-400/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                aria-label="Email"
              />

              <label className="sr-only">Password</label>
              <input
                required
                type="password"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (min 6 characters)"
                className="w-full px-4 py-3 rounded bg-black/20 border border-yellow-400/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                aria-label="Password"
              />

              <button className="w-full py-3 bg-yellow-500 text-black font-semibold rounded-full shadow-lg hover:bg-yellow-600 transition" type="submit">
                Create Account
              </button>

              <p className="text-center text-sm text-white/70">
                Already have an account?{' '}
                <Link to="/login" className="text-yellow-400 hover:underline">Login Here</Link>
              </p>
            </form>

            <div className="mt-6 text-center text-xs text-white/60">By signing up you agree to our Terms & Privacy</div>
          </div>

      
        </section>
      </main>

      <footer className="bg-black text-yellow-400 py-6 text-center border-t border-yellow-400/20">
        &copy; 2025 SnapHire. All rights reserved.
      </footer>
    </div>
  );
};

export default UserSignup;
