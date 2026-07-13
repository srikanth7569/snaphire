import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FaMapMarkerAlt,
  FaCameraRetro,
  FaInstagram,
  FaStar,
  FaRegStar,
  FaTimes,
  FaGlobe,
  FaPhotoVideo,
  FaFilter,
} from "react-icons/fa";
import socket from "../socket";

const BASE = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

const RatingStars = ({ rating = 4 }) => {
  const full = Math.floor(rating || 0);
  return (
    <div className="flex items-center gap-1 mt-2">
      {[...Array(5)].map((_, i) =>
        i < full ? (
          <FaStar key={i} className="text-yellow-400" />
        ) : (
          <FaRegStar key={i} className="text-yellow-400" />
        )
      )}
    </div>
  );
};

const SkeletonCard = () => (
  <div className="bg-black/60 border border-yellow-400 rounded-2xl p-6 animate-pulse min-h-[220px]">
    <div className="flex gap-4 items-center mb-4">
      <div className="w-14 h-14 bg-yellow-400 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-white/20 rounded w-3/5" />
        <div className="h-3 bg-white/10 rounded w-1/3" />
      </div>
    </div>
    <div className="h-5 bg-white/10 rounded w-2/3 mb-3" />
    <div className="h-4 bg-white/10 rounded w-1/2 mb-3" />
    <div className="flex gap-2 mt-auto">
      <div className="h-10 bg-white/10 rounded w-1/2" />
      <div className="h-10 bg-white/10 rounded w-1/3" />
    </div>
  </div>
);

// Normalize backend status from socket into a simple label
const normalizeStatus = (status) => {
  const s = (status || "").toString().toLowerCase();
  if (s.includes("accept")) return "Accepted";
  if (s.includes("declin") || s.includes("reject") || s.includes("cancel"))
    return "Declined";
  if (s.includes("pend") || s.includes("request") || s.includes("wait"))
    return "Pending";
  return "Pending";
};

const AvailablePartners = () => {
  const [searchParams] = useSearchParams();
  const location = searchParams.get("location") || "";
  const shootType = searchParams.get("shootType") || "";
  const navigate = useNavigate();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userId] = useState(localStorage.getItem("userId") || null);

  // Only store "Pending" here (per captain)
  const [bookingStatuses, setBookingStatuses] = useState({}); // { [captainId]: 'Pending' }

  const [confirmModal, setConfirmModal] = useState({
    open: false,
    captainId: null,
    captainName: "",
  });
  const [processingBook, setProcessingBook] = useState(false);

  const [sortBy, setSortBy] = useState("recommended");
  const [filterSkill, setFilterSkill] = useState("");
  const [queryError, setQueryError] = useState(null);

  const token = localStorage.getItem("token");

  // fetch captains
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setQueryError(null);

    const fetchResults = async () => {
      try {
        const res = await axios.get(`${BASE}/captains/search`, {
          params: { location, skill: shootType },
        });
        const data = res.data?.captains ?? res.data ?? [];
        if (!mounted) return;
        setResults(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Search error:", err?.response?.data || err?.message);
        setQueryError("Could not fetch captains. Try again later.");
        setResults([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (location && shootType) fetchResults();
    else {
      setLoading(false);
      setResults([]);
    }

    return () => {
      mounted = false;
    };
  }, [location, shootType]);

  // socket: join user room & listen
  useEffect(() => {
    if (!userId) return;
    try {
      socket.emit("joinUserRoom", userId);
      socket.on("userNotification", (data) => {
        if (data?.message) toast.info(data.message);

        if (data?.captainId && data?.status) {
          const normalized = normalizeStatus(data.status);

          // When captain responds, we show toast and clear "Pending"
          if (normalized === "Accepted") {
            toast.success("🎉 Captain accepted your booking!");
            setBookingStatuses((prev) => {
              const copy = { ...prev };
              delete copy[data.captainId]; // enable Book Now again
              return copy;
            });
          } else if (normalized === "Declined") {
            toast.error("❌ Captain declined your booking.");
            setBookingStatuses((prev) => {
              const copy = { ...prev };
              delete copy[data.captainId]; // enable Book Now again
              return copy;
            });
          }
        }
      });
    } catch (e) {
      console.warn("Socket issue:", e);
    }
    return () => {
      try {
        socket.off("userNotification");
      } catch (e) {}
    };
  }, [userId]);

  // sorting/filtering
  const processedResults = useMemo(() => {
    const arr = Array.isArray(results) ? [...results] : [];
    const filtered = filterSkill
      ? arr.filter((c) =>
          (c.skills || []).some((s) =>
            s.toLowerCase().includes(filterSkill.toLowerCase())
          )
        )
      : arr;
    if (sortBy === "ratingAsc")
      filtered.sort((a, b) => (a.rating || 0) - (b.rating || 0));
    else if (sortBy === "ratingDesc")
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return filtered;
  }, [results, sortBy, filterSkill]);

  const openConfirm = (captainId, captain) => {
    setConfirmModal({
      open: true,
      captainId,
      captainName: `${captain?.fullname?.firstname ?? ""} ${
        captain?.fullname?.lastname ?? ""
      }`.trim(),
    });
  };

  // booking call — show Pending on that captain's button; allow other captains
  const handleBook = async (captainId) => {
    if (!userId) return toast.error("You must be logged in to book!");
    if (!captainId) return;

    setProcessingBook(true);
    try {
      // Immediately show "Booking Pending..." on that captain
      setBookingStatuses((prev) => ({
        ...prev,
        [captainId]: "Pending",
      }));

      const res = await axios.post(
        `${BASE}/bookings`,
        { captainId, userId, shootType, location },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      if (res.status === 201 || res.status === 200) {
        toast.success("Booking request sent successfully!");
      } else {
        toast.error("Booking failed. Please try again.");
        // rollback Pending
        setBookingStatuses((prev) => {
          const copy = { ...prev };
          delete copy[captainId];
          return copy;
        });
      }

      setConfirmModal({ open: false, captainId: null, captainName: "" });
    } catch (err) {
      console.error("Booking error:", err?.response?.data || err?.message);
      toast.error(err?.response?.data?.message || "Booking failed");
      setBookingStatuses((prev) => {
        const copy = { ...prev };
        delete copy[captainId];
        return copy;
      });
    } finally {
      setProcessingBook(false);
    }
  };

  const safeText = (v) => (v === undefined || v === null ? "N/A" : v);

  return (
    <div className="min-h-screen bg-black text-white px-6 py-8 relative">
      <header className="flex items-center justify-between mb-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-4">
          <button
            className="text-sm text-yellow-400 bg-yellow-900/5 px-3 py-2 rounded-lg flex items-center gap-2 hover:scale-105 transition"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-xl font-bold text-yellow-400">
              Photographers — {shootType}
            </h1>
            <p className="text-sm text-white/70">
              Showing creators in <strong>{location}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg">
            <FaFilter className="text-yellow-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent outline-none text-white text-sm"
              aria-label="Sort results"
            >
              <option value="recommended">Recommended</option>
              <option value="ratingDesc">Top Rated</option>
              <option value="ratingAsc">Lowest Rated</option>
            </select>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg">
            <input
              placeholder="Filter skill (e.g., Wedding)"
              value={filterSkill}
              onChange={(e) => setFilterSkill(e.target.value)}
              className="bg-transparent outline-none text-white text-sm placeholder-white/50 w-48"
              aria-label="Filter by skill"
            />
          </div>

          <div className="relative">
            <div
              className="w-11 h-11 bg-yellow-500 text-black font-bold rounded-full flex items-center justify-center text-lg cursor-pointer select-none"
              onClick={() => setSidebarOpen(true)}
              role="button"
              aria-label="Open profile sidebar"
            >
              {(() => {
                const fn = localStorage.getItem("firstname");
                if (fn && fn.length) return fn.charAt(0).toUpperCase();
                if (userId && userId.length) return userId.charAt(0).toUpperCase();
                return "U";
              })()}
            </div>
          </div>
        </div>
      </header>

      {sidebarOpen && (
        <aside className="fixed top-0 right-0 h-full w-72 bg-black/95 border-l border-yellow-400 z-50 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-sm text-white/70">Signed in as</div>
              <div className="text-lg font-semibold">
                {localStorage.getItem("firstname") || "User"}
              </div>
              <div className="text-xs text-white/60">
                {localStorage.getItem("email") || ""}
              </div>
            </div>
            <FaTimes
              className="cursor-pointer"
              onClick={() => setSidebarOpen(false)}
            />
          </div>

          <nav className="flex flex-col gap-3 mt-4">
            <button
              onClick={() => {
                setSidebarOpen(false);
                navigate("/home");
              }}
              className="text-left px-3 py-2 rounded hover:bg-white/5"
            >
              Home
            </button>
            <button
              onClick={() => {
                setSidebarOpen(false);
                navigate("/my-bookings");
              }}
              className="text-left px-3 py-2 rounded hover:bg-white/5"
            >
              My Bookings
            </button>
            <button
              onClick={() => {
                setSidebarOpen(false);
                navigate("/profile");
              }}
              className="text-left px-3 py-2 rounded hover:bg-white/5"
            >
              Profile
            </button>
            <button
              onClick={() => {
                localStorage.clear();
                toast.success("Logged out");
                navigate("/login");
              }}
              className="text-left text-red-400 px-3 py-2 rounded hover:bg-white/5 mt-4"
            >
              Logout
            </button>
          </nav>

          <div className="mt-8 text-sm text-white/60">
            <div className="font-semibold mb-2">Quick tips</div>
            <ul className="list-disc list-inside space-y-1">
              <li>Click a profile to view portfolio links.</li>
              <li>Use the filter to narrow results by skills.</li>
              <li>Accepted / Declined notifications appear in real-time.</li>
            </ul>
          </div>
        </aside>
      )}

      <main className="max-w-6xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="mt-8 bg-white/5 p-8 rounded-lg text-center">
            <p className="text-lg text-white/70">
              No photographers found for <strong>{shootType}</strong> in{" "}
              <strong>{location}</strong>.
            </p>
            <p className="text-sm text-white/50 mt-2">
              Try adjusting filters or try another location.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {processedResults.map((captain) => {
              const cid = captain._id;
              const status = bookingStatuses[cid]; // only "Pending" or undefined

              const isPending = status === "Pending";

              return (
                <article
                  key={cid}
                  className="bg-black/60 border border-yellow-400 rounded-2xl shadow-lg p-6 backdrop-blur-md flex flex-col"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-yellow-500 text-black flex items-center justify-center text-xl font-bold uppercase">
                      {String(captain.fullname?.firstname ?? "").charAt(0)}
                      {String(captain.fullname?.lastname ?? "").charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-yellow-300">
                        {safeText(captain.fullname?.firstname)}{" "}
                        {safeText(captain.fullname?.lastname)}
                      </h3>
                      <div className="flex items-center text-sm text-gray-300 mt-1">
                        <FaCameraRetro className="mr-1" />{" "}
                        {safeText(
                          (captain.camera?.cameraType &&
                            captain.camera.cameraType.join?.(", ")) ||
                            captain.camera?.cameraType ||
                            "N/A"
                        )}
                      </div>
                    </div>
                  </div>

                  <RatingStars rating={captain.rating ?? 4} />

                  <div className="mt-3 mb-3 flex flex-wrap gap-2">
                    {(captain.skills || [])
                      .slice(0, 6)
                      .map((skill, i) => (
                        <span
                          key={i}
                          className="text-xs bg-yellow-200 text-black px-3 py-1 rounded-full font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                  </div>

                  <div className="flex items-center text-sm text-gray-300 mb-2">
                    <FaMapMarkerAlt className="mr-1 text-red-400" />
                    <span>{captain.location?.city ?? "Unknown City"}</span>
                    {captain.location?.state ? (
                      <span className="mx-2">•</span>
                    ) : null}
                    <span className="text-white/60">
                      {captain.location?.state ?? ""}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3 mt-2">
                    {captain.socialLinks?.instagram && (
                      <a
                        href={captain.socialLinks.instagram}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm inline-flex items-center gap-1 text-pink-500 hover:underline"
                      >
                        <FaInstagram /> Instagram
                      </a>
                    )}
                    {captain.socialLinks?.vsco && (
                      <a
                        href={captain.socialLinks.vsco}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm inline-flex items-center gap-1 text-blue-400 hover:underline"
                      >
                        <FaPhotoVideo /> VSCO
                      </a>
                    )}
                    {captain.socialLinks?.portfolio && (
                      <a
                        href={captain.socialLinks.portfolio}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm inline-flex items-center gap-1 text-green-400 hover:underline"
                      >
                        <FaGlobe /> Portfolio
                      </a>
                    )}
                  </div>

                  {/* Button = also shows status (no text below) */}
                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={() => openConfirm(cid, captain)}
                      className={`flex-1 py-2 rounded-xl font-medium text-sm transition ${
                        isPending
                          ? "bg-yellow-600 text-black cursor-not-allowed"
                          : "bg-yellow-500 text-black hover:bg-yellow-600"
                      }`}
                      disabled={isPending}
                    >
                      {isPending ? "Booking Pending..." : "Book Now"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {confirmModal.open && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-black rounded-xl p-6 max-w-md w-full border border-yellow-400">
            <div className="flex items-start justify-between">
              <h3 className="text-xl font-bold text-yellow-400">
                Confirm Booking
              </h3>
              <button
                onClick={() =>
                  setConfirmModal({
                    open: false,
                    captainId: null,
                    captainName: "",
                  })
                }
                className="text-white/60"
              >
                <FaTimes />
              </button>
            </div>

            <p className="mt-4 text-white/80">
              You're about to send a booking request to:
            </p>
            <p className="mt-2 font-semibold text-white">
              {confirmModal.captainName || "Selected Creator"}
            </p>
            <p className="mt-3 text-sm text-white/60">
              Event: <strong>{shootType}</strong> · Location:{" "}
              <strong>{location}</strong>
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => handleBook(confirmModal.captainId)}
                disabled={processingBook}
                className="flex-1 bg-yellow-500 text-black py-2 rounded font-semibold hover:bg-yellow-600 disabled:opacity-70"
              >
                {processingBook ? "Sending..." : "Confirm & Send Request"}
              </button>
              <button
                onClick={() =>
                  setConfirmModal({
                    open: false,
                    captainId: null,
                    captainName: "",
                  })
                }
                className="py-2 px-4 rounded border border-white/10"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailablePartners;
