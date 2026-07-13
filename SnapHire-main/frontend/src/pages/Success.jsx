import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";

const Success = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [sessionValid, setSessionValid] = useState(false);

  // try to read user's first name from localStorage to personalize message
  const firstname = localStorage.getItem("firstname") || "";

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      navigate("/"); // redirect if no session
      return;
    }

    const verifySession = async () => {
      try {
        // keep same backend route you had; adjust if your backend expects a different base path
        const res = await axios.get(`/api/stripe-session/${sessionId}`);
        // If backend returns success or session info, mark valid
        if (res?.status === 200) setSessionValid(true);
      } catch (err) {
        console.error("Stripe session verify error:", err);
        setSessionValid(false);
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, [location, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white font-sans flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">Verifying payment...</div>
          <div className="w-12 h-12 rounded-full border-4 border-yellow-400 border-t-transparent animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full font-sans text-white bg-black min-h-screen">
      {/* Top Bar - same style as home */}
      <div className="flex justify-between items-center p-5 fixed w-full z-50 bg-black/60 backdrop-blur-xl border-b border-yellow-500/10 shadow-lg">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 bg-yellow-500 text-black font-bold rounded-full flex items-center justify-center text-lg"
            aria-hidden
          >
            {firstname ? firstname.charAt(0).toUpperCase() : "U"}
          </div>
          {firstname ? (
            <div className="hidden sm:flex flex-col">
              <span className="text-yellow-400 font-semibold text-sm">Hello, {firstname}</span>
              <span className="text-white/60 text-xs -mt-0.5">Creators · Gigs · Growth</span>
            </div>
          ) : (
            <div className="hidden sm:flex flex-col">
              <span className="text-yellow-400 font-semibold text-sm">Welcome</span>
              <span className="text-white/60 text-xs -mt-0.5">Creators · Gigs · Growth</span>
            </div>
          )}
        </div>

        {/* center title */}
        <div className="hidden md:flex items-center gap-4">
          <div className="text-sm font-semibold text-yellow-300">SnapHire</div>
          <div className="text-xs text-white/60">Creators · Gigs · Growth</div>
        </div>

        {/* actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition"
          >
            Home
          </button>
          <Link to="/my-bookings" className="px-4 py-2 rounded-full bg-yellow-400 text-black font-semibold hover:bg-yellow-500 transition">
            My Bookings
          </Link>
        </div>
      </div>

      {/* Main content */}
      <main className="pt-28 pb-12 px-6 flex items-center justify-center">
        <div className="max-w-3xl w-full text-center bg-black/40 border border-yellow-400/20 rounded-2xl p-10 backdrop-blur-lg shadow-lg">
          {sessionValid ? (
            <>
              <div className="text-6xl mb-4">🎉</div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-yellow-300 mb-4">Thank you — Booking Confirmed!</h1>
              <p className="text-white/80 text-lg mb-6">
                {firstname ? `Thanks, ${firstname}! ` : ""}
                Your payment was successful and your booking is confirmed. We’ll make your day special — our team will contact you soon to finalize details.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                <button
                  onClick={() => navigate("/")}
                  className="bg-yellow-500 text-black px-6 py-3 rounded-full font-bold hover:bg-yellow-600 transition"
                >
                  Back to Home
                </button>
                <Link to="/my-bookings" className="border border-yellow-400 text-yellow-300 px-6 py-3 rounded-full hover:bg-yellow-500/10 transition">
                  View My Bookings
                </Link>
              </div>

              <p className="text-white/60 mt-6 text-sm">A confirmation email has been sent to you. If you don’t see it, check your spam folder.</p>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-yellow-300 mb-4">Payment Verification Failed</h1>
              <p className="text-white/80 mb-6">We couldn't verify the payment session. If the amount was deducted, please contact support or check your bookings page.</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => navigate("/")} className="bg-yellow-500 text-black px-6 py-3 rounded-full font-bold hover:bg-yellow-600 transition">Home</button>
                <Link to="/contact" className="border border-yellow-400 text-yellow-300 px-6 py-3 rounded-full hover:bg-yellow-500/10 transition">Contact Support</Link>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Success;
