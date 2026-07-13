import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [ratingBookingId, setRatingBookingId] = useState(null);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchBookings = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/bookings/user/${userId}`
        );
        setBookings(response.data.bookings || []);
      } catch (error) {
        toast.error('Failed to fetch bookings');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [userId]);

  const handleRate = async (bookingId) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_BASE_URL}/bookings/review/${bookingId}`,
        {
          rating,
          review,
        }
      );
      toast.success('Rating submitted!');
      setRatingBookingId(null);
      setRating(5);
      setReview('');

      // Refresh bookings list
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/bookings/user/${userId}`
      );
      setBookings(response.data.bookings || []);
    } catch (error) {
      toast.error('Failed to submit rating');
      console.error(error);
    }
  };

  const statusStyles = {
    pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/40',
    accepted: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40',
    completed: 'bg-blue-500/10 text-blue-400 border-blue-500/40',
    cancelled: 'bg-red-500/10 text-red-400 border-red-500/40',
  };

  const getStatusClass = (status = '') => {
    const key = status.toLowerCase();
    return statusStyles[key] || 'bg-gray-500/10 text-gray-300 border-gray-500/40';
  };

  const renderStars = (value, onSelect) => (
    <div className="flex items-center gap-1 text-2xl">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onSelect && onSelect(n)}
          className="focus:outline-none"
        >
          <span className={n <= value ? 'text-yellow-400' : 'text-gray-500'}>
            ★
          </span>
        </button>
      ))}
    </div>
  );

  return (
    <div
      className="min-h-screen w-full bg-gradient-to-b from-black via-gray-900 to-black py-24 px-4 sm:px-8 md:px-16 text-white"
      style={{
        fontFamily:
          "'Poppins', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
      }}
    >
      {/* Page Heading */}
      <div className="max-w-6xl mx-auto mb-10">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight flex items-center gap-2">
          <span>All your shoots in one place.</span>
        </h2>
        <p className="text-sm sm:text-base text-white/70 mt-2 max-w-xl">
        View your shoots, track their status, and share your feedback.
        </p>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-white/70">
            <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mb-4" />
            <p>Fetching your bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div
            className="rounded-2xl py-16 px-6 sm:px-10 text-center max-w-xl mx-auto"
            style={{
              background: 'rgba(0,0,0,0.6)',
              border: '1px solid rgba(255,255,255,0.12)',
              backdropFilter: 'blur(16px)',
            }}
          >
            <h3 className="text-xl font-semibold mb-2 text-yellow-400">
              No bookings yet
            </h3>
            <p className="text-white/70 mb-4">
              Once you book a photographer or reel maker, your bookings will
              appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="relative rounded-2xl p-5 sm:p-6 flex flex-col shadow-[0_0_30px_rgba(0,0,0,0.4)] hover:shadow-[0_0_40px_rgba(250,204,21,0.25)] transform hover:-translate-y-1 transition-all cursor-default"
                style={{
                  background: 'rgba(0,0,0,0.7)',
                  backdropFilter: 'blur(18px)',
                  border: '1px solid rgba(255,255,255,0.18)',
                }}
              >
                {/* Status badge */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-wide ${getStatusClass(
                      booking.status
                    )}`}
                  >
                    {booking.status}
                  </span>
                  {/* Removed hash/id display */}
                </div>

                {/* Main info */}
                <h3 className="text-xl font-bold mb-1 text-yellow-400">
                  📸 {booking.shootType || 'Photoshoot'}
                </h3>
                <p className="text-xs text-white/60 mb-4">
                  Booked on{' '}
                  <span className="font-medium text-white/80">
                    {booking.bookedAt
                      ? new Date(booking.bookedAt).toLocaleString()
                      : '—'}
                  </span>
                </p>

                <div className="space-y-1 mb-4 text-sm">
                  <p className="text-white/80">
                    <span className="text-white/50">Captain: </span>
                    {booking.captainId?.fullname?.firstname}{' '}
                    {booking.captainId?.fullname?.lastname}
                  </p>
                  <p className="text-white/80">
                    <span className="text-white/50">Location: </span>
                    {booking.location || 'Not specified'}
                  </p>
                  {booking.plan && (
                    <p className="text-white/80">
                      <span className="text-white/50">Plan: </span>
                      {booking.plan}
                    </p>
                  )}
                </div>

                {/* Rating / Review */}
                {booking.rating && (
                  <div className="mt-2 mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-white/70 font-medium">
                        Your Rating
                      </span>
                      {/* Just stars, no numeric value text */}
                      <span className="flex items-center gap-1 text-sm text-yellow-400">
                        {renderStars(booking.rating)}
                      </span>
                    </div>
                    {booking.review && (
                      <p className="text-xs text-white/70 bg-white/5 rounded-lg p-2 mt-1">
                        “{booking.review}”
                      </p>
                    )}
                  </div>
                )}

                {/* Rating form */}
                {!booking.rating && (
                  <>
                    {ratingBookingId === booking._id ? (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <p className="text-sm font-semibold mb-2 text-white/80">
                          Rate your experience
                        </p>

                        {/* Star selector */}
                        <div className="flex items-center gap-3 mb-3">
                          {renderStars(rating, setRating)}
                        </div>

                        <textarea
                          value={review}
                          onChange={(e) => setReview(e.target.value)}
                          placeholder="Share what you liked, or what could be better..."
                          className="w-full text-sm px-3 py-2 rounded-xl bg-black/40 border border-white/15 focus:outline-none focus:ring-2 focus:ring-yellow-400/70 focus:border-transparent placeholder:text-white/40 text-white mb-3"
                          rows={3}
                        />

                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleRate(booking._id)}
                            className="px-4 py-2 rounded-full text-sm font-semibold bg-yellow-400 text-black hover:bg-yellow-500 transition shadow-lg"
                          >
                            Submit Review
                          </button>
                          <button
                            onClick={() => {
                              setRatingBookingId(null);
                              setRating(5);
                              setReview('');
                            }}
                            className="px-4 py-2 rounded-full text-sm font-semibold border border-white/20 bg-white/5 hover:bg-white/10 transition text-white"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setRatingBookingId(booking._id);
                          setRating(5);
                          setReview('');
                        }}
                        className="mt-4 inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-semibold bg-yellow-400 text-black hover:bg-yellow-500 transition shadow-lg"
                      >
                        ⭐ Rate Your Captain
                      </button>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
