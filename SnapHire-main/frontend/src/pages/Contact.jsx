import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

const Contact = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const id = 'simple-poppins';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  const handleChange = (e) => {
    setFormData((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill all fields');
      return;
    }

    toast.success('Message sent! We will contact you soon.', {
      duration: 3000,
      style: { background: '#FFE55C', color: '#000', fontWeight: 600 },
    });

    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div
      className="w-full min-h-screen bg-black text-white pt-28 px-6 flex flex-col items-center"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      <Toaster />

      {/* Navbar - identical style to Start.jsx */}
      <header className="fixed top-0 left-0 w-full z-50">
        <div className="w-full flex justify-center px-4 py-3">
          <div className="w-full max-w-7xl bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl px-6 sm:px-10 py-3 flex items-center justify-between shadow-[0_0_20px_rgba(255,255,255,0.08)]">

            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setMobileOpen(false); navigate('/'); }}>
              <img
                src="/assets/SnapHire-6-2-removebg-preview.png"
                alt="SnapHire Logo"
                className="w-24 sm:w-32"
              />
            </div>

            {/* Center Nav Links */}
            <nav className="hidden md:flex items-center gap-8">
              <button onClick={() => { setMobileOpen(false); navigate('/'); }} className="text-white/80 hover:text-white transition text-sm font-medium">Home</button>
              <button onClick={() => { setMobileOpen(false); navigate('/captain-signup'); }} className="text-white/80 hover:text-white transition text-sm font-medium">Partner</button>
              <button onClick={() => { setMobileOpen(false); navigate('/contact'); }} className="text-yellow-400 transition text-sm font-medium">Contact</button>
            </nav>

            {/* Right Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <button onClick={() => { setMobileOpen(false); navigate('/login'); }} className="bg-white/10 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-white/20 transition">Login</button>
              <button onClick={() => { setMobileOpen(false); navigate('/login'); }} className="bg-white text-black px-5 py-2 rounded-full text-sm font-semibold hover:bg-gray-200 transition">Sign Up</button>
            </div>

            {/* Mobile Menu Button */}
            <button
              aria-label="Toggle menu"
              onClick={() => setMobileOpen((s) => !s)}
              className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d={mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileOpen && (
          <div className="md:hidden bg-black/90 border-t border-white/10 px-6 py-4 space-y-4 rounded-b-2xl">
            <button onClick={() => { setMobileOpen(false); navigate('/'); }} className="block text-white text-left text-sm py-2">Home</button>
            <button onClick={() => { setMobileOpen(false); navigate('/captain-signup'); }} className="block text-white text-left text-sm py-2">Partner</button>
            <button onClick={() => { setMobileOpen(false); navigate('/contact'); }} className="block text-yellow-400 text-left text-sm py-2 font-semibold">Contact</button>
            <button onClick={() => { setMobileOpen(false); navigate('/login'); }} className="bg-white text-black w-full py-2 rounded-full font-semibold">Sign Up</button>
          </div>
        )}
      </header>

      {/* Simple Contact Box */}
      <div className="w-full max-w-xl bg-black/40 border border-white/10 rounded-xl p-8 mt-10 backdrop-blur-sm shadow-md">
        <h2 className="text-3xl font-semibold text-center text-yellow-400 mb-4">Contact Us</h2>
        <p className="text-center text-white/70 mb-8 text-sm">
          Send us a message — we’ll get back to you shortly.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-black/50 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />

          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-black/50 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />

          <textarea
            name="message"
            placeholder="Your Message"
            value={formData.message}
            onChange={handleChange}
            rows="5"
            className="w-full p-3 rounded-lg bg-black/50 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />

          <button
            type="submit"
            className="w-full bg-yellow-500 text-black font-semibold py-3 rounded-lg hover:bg-yellow-600 transition"
          >
            Send Message
          </button>
        </form>
      </div>

      {/* Footer */}
      <footer className="mt-20 text-center text-yellow-400 text-sm py-6">
        © SnapHire. All rights reserved.
      </footer>
    </div>
  );
};

export default Contact;
