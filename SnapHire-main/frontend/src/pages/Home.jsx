import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaBell } from "react-icons/fa";
import toast from "react-hot-toast";
import axios from "axios";
import socket from "../socket";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const eventTypes = [
  "Wedding Photography","Birthday Photography","Event Photography",
  "Fashion Shoot","Reel Making","Product Shoot",
  "Travel Shoot","Concert Shoot","Corporate Shoot",
];

const packages = [
  {
    name: "Wedding Bliss",
    price: "₹1,00,000",
    tag: "Complete coverage",
    emoji: "💍",
    stripePriceId: "price_1SF80hAznHviGJspEkL7MEBc",
    desc: "Full wedding coverage including pre-wedding shoot, wedding day, and reception.",
    deliverables: ["10 Instagram/TikTok Reels (30–60 sec each)","50 high-resolution aesthetic photos","2 Highlight Videos (3–5 min each)","Drone shots for aerial coverage"],
    duration: "2–3 days",
    teamSize: "3–7 members",
    teamDetails: ["Photographers: 2–4","Videographers: 1–2","Drone operator: 1","Assistants: 1–2"],
  },
  {
    name: "Corporate Spotlight",
    price: "₹30,000",
    tag: "Professional grade",
    emoji: "🏛️",
    stripePriceId: "price_1SF9SXAznHviGJsphttjQuvL",
    desc: "Ideal for corporate events with professional coverage and fast delivery.",
    deliverables: ["5 Instagram/TikTok Reels (30–60 sec each)","30 high-resolution photos","1 Highlight Video (2–3 min)"],
    duration: "1–2 days",
    teamSize: "2–4 members",
    teamDetails: ["Photographers: 1–2","Videographers: 1–2"],
  },
  {
    name: "Birthday Bash",
    price: "₹35,000",
    tag: "Fun & candid",
    emoji: "🎂",
    stripePriceId: "price_1SF9Z7AznHviGJspLOBYw4j3",
    desc: "Capture all fun birthday moments, from cake-cutting to candid smiles.",
    deliverables: ["3 Instagram/TikTok Reels (30–60 sec each)","50 candid photos (some edited, some raw)","Raw video clips for memories"],
    duration: "1 day",
    teamSize: "1–3 members",
    teamDetails: ["Photographer: 1–2","Videographer: 1"],
  },
  {
    name: "Creative Custom",
    price: "From ₹10,000",
    tag: "Fully flexible",
    emoji: "✨",
    stripePriceId: "price_1SF9bEAznHviGJspHZgyw8uQ",
    desc: "Fully customizable plan for personal, fashion, travel, or any shoot.",
    deliverables: ["Custom reels, photos, and videos per requirement"],
    duration: "Flexible",
    teamSize: "1–5 members",
    teamDetails: ["Photographers/Videographers as needed"],
    note: "Pay ₹10,000 advance — our team contacts you to finalize everything.",
  },
];

const adSlides = [
  { title: "Capture Moments That Last Forever", sub: "Your story deserves cinematic elegance and timeless beauty." },
  { title: "Premium Wedding Cinematics", sub: "From teary smiles to grand lights — every moment preserved." },
  { title: "Elite Corporate Coverage", sub: "Sharp, polished visuals tailored for brands and business events." },
  { title: "Every Frame, A Beautiful Story", sub: "Soft tones. Real emotions. Cinematic artistry designed to move." },
  { title: "Ultra-Fast Delivery. Zero Compromise.", sub: "Premium editing pipelines delivering world-class results on time." },
];

const reviews = [
  { name: "Aarav Mehta", role: "Influencer", text: "SnapHire made booking photographers seamless and professional." },
  { name: "Ananya Rao", role: "Brand Owner", text: "High-quality reels delivered quickly. Excellent service!" },
  { name: "Karan Verma", role: "Event Manager", text: "Smooth process, great results, perfect for events." },
  { name: "Diya Singh", role: "Content Creator", text: "Reliable reel makers with fast delivery. Highly recommended." },
  { name: "Rohan Kapoor", role: "Startup Founder", text: "Affordable, professional, and efficient experience." },
];

const GOLD = "#e6be64";
const BG = "#0a0a0a";
const SURFACE = "rgba(255,255,255,.04)";
const BORDER = "rgba(255,255,255,.08)";

export default function Home() {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [location, setLocation] = useState("");
  const [shootType, setShootType] = useState("");
  const [currentAd, setCurrentAd] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredPkg, setHoveredPkg] = useState(null);
  const [adFade, setAdFade] = useState(true);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fonts = ["https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap"];
    fonts.forEach(href => {
      if (!document.querySelector(`link[href="${href}"]`)) {
        const l = document.createElement("link"); l.rel = "stylesheet"; l.href = href;
        document.head.appendChild(l);
      }
    });
    document.documentElement.style.scrollBehavior = "smooth";
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); document.documentElement.style.scrollBehavior = ""; };
  }, []);

  useEffect(() => {
    const firstname = localStorage.getItem("firstname");
    const lastname = localStorage.getItem("lastname");
    setUser({ fullname: { firstname: firstname || "User", lastname: lastname || "" } });

    const interval = setInterval(() => {
      setAdFade(false);
      setTimeout(() => { setCurrentAd(p => (p + 1) % adSlides.length); setAdFade(true); }, 350);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    let raf;
    const tick = () => {
      if (scrollRef.current) {
        scrollRef.current.scrollLeft += 0.5;
        if (scrollRef.current.scrollLeft >= scrollRef.current.scrollWidth / 2) scrollRef.current.scrollLeft = 0;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!userId) return;
    const fetch = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/bookings/user/${userId}`);
        const pending = (res.data.bookings || []).filter(b => b.status === "Pending").map(b => `Booking for ${b.shootType} is pending.`);
        setNotifications(pending);
      } catch {}
    };
    fetch();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    socket.emit("joinUserRoom", userId);
    socket.on("userNotification", (data) => { if (data?.message) setNotifications(p => [...p, data.message]); });
    return () => socket.off("userNotification");
  }, [userId]);

  const handleLogout = () => { localStorage.clear(); toast.success("Logged out!"); navigate("/login"); };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!location || !shootType) { toast.error("Please fill all fields"); return; }
    navigate(`/available-partners?location=${encodeURIComponent(location)}&shootType=${encodeURIComponent(shootType)}`);
  };

  const handleCheckout = async (priceId) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/create-checkout-session`, { priceId, userId });
      window.location.href = res.data.url;
    } catch { toast.error("Payment failed. Try again!"); }
  };

  const getInitial = (name) => name?.charAt(0).toUpperCase() || "U";
  const go = (path) => { setMobileOpen(false); navigate(path); };
  const firstName = user?.fullname?.firstname || "there";

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: BG, color: "#f0ede8", minHeight: "100vh" }}>
      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
        @keyframes shimmer { 0%,100%{opacity:.5} 50%{opacity:1} }
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:.6} 100%{transform:scale(1.8);opacity:0} }
        .pkg-card { transition: transform .35s cubic-bezier(.22,1,.36,1), border-color .3s, box-shadow .3s; }
        .pkg-card:hover { transform: translateY(-8px); }
        .nav-btn { background:none; border:none; color:rgba(240,237,232,.65); font-size:14px; cursor:pointer; padding:0; font-family:inherit; position:relative; transition:color .2s; }
        .nav-btn::after { content:''; position:absolute; bottom:-3px; left:0; width:0; height:1px; background:${GOLD}; transition:width .3s; }
        .nav-btn:hover { color:#f0ede8; }
        .nav-btn:hover::after { width:100%; }
        .search-input { background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.12); color:#f0ede8; border-radius:12px; padding:14px 18px; font-size:15px; font-family:inherit; outline:none; transition:border-color .2s, box-shadow .2s; flex:1; }
        .search-input::placeholder { color:rgba(240,237,232,.35); }
        .search-input:focus { border-color:rgba(230,190,100,.5); box-shadow:0 0 0 3px rgba(230,190,100,.08); }
        .search-select { background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.12); color:#f0ede8; border-radius:12px; padding:14px 18px; font-size:15px; font-family:inherit; outline:none; cursor:pointer; transition:border-color .2s; flex:1; }
        .search-select:focus { border-color:rgba(230,190,100,.5); }
        .search-select option { background:#1a1a1a; color:#f0ede8; }
        .gold-btn { background:${GOLD}; color:#0a0a0a; border:none; border-radius:100px; padding:14px 32px; font-size:15px; font-weight:700; cursor:pointer; font-family:"Syne",sans-serif; letter-spacing:.01em; transition:transform .25s, box-shadow .25s; }
        .gold-btn:hover { transform:scale(1.04); box-shadow:0 0 28px rgba(230,190,100,.3); }
        .outline-btn { background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.15); color:#f0ede8; border-radius:100px; padding:9px 20px; font-size:14px; cursor:pointer; font-family:inherit; transition:background .2s, border-color .2s; }
        .outline-btn:hover { background:rgba(255,255,255,.1); border-color:rgba(255,255,255,.25); }
        .review-card { min-width:300px; background:rgba(255,255,255,.03); border:1px solid ${BORDER}; border-radius:16px; padding:24px; flex-shrink:0; transition:border-color .3s, background .3s; }
        .review-card:hover { border-color:rgba(230,190,100,.25); background:rgba(255,255,255,.05); }
        @media (max-width:768px) { .desktop-nav,.desktop-right { display:none !important; } .hamburger { display:flex !important; } .search-row { flex-direction:column; } }
      `}</style>

      {/* ── NAVBAR ── */}
      <header style={{
        position:"fixed", top:0, left:0, width:"100%", zIndex:100,
        padding:"12px 24px", boxSizing:"border-box",
        background: scrolled ? "rgba(10,10,10,.92)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? `1px solid ${BORDER}` : "none",
        transition:"background .4s, backdrop-filter .4s, border-color .4s",
      }}>
        <div style={{ maxWidth:1200, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <img src="/assets/SnapHire-6-2-removebg-preview.png" alt="SnapHire" style={{ height:34, cursor:"pointer" }} onClick={() => navigate("/")} />

          {/* Desktop nav */}
          <nav className="desktop-nav" style={{ display:"flex", gap:32, alignItems:"center" }}>
            {[["Home","/home"],["Partner","/captain-signup"],["Contact","/contact"],["My Bookings","/my-bookings"]].map(([l,p]) => (
              <button key={p} className="nav-btn" onClick={() => navigate(p)}>{l}</button>
            ))}
          </nav>

          {/* Desktop right */}
          <div className="desktop-right" style={{ display:"flex", alignItems:"center", gap:20 }}>
            {/* Notifications */}
            <div style={{ position:"relative" }} ref={notifRef}>
              <button onClick={() => setNotifOpen(v => !v)} style={{ background:"none", border:"none", cursor:"pointer", padding:4, position:"relative", display:"flex" }}>
                <FaBell style={{ color: notifications.length > 0 ? GOLD : "rgba(240,237,232,.4)", fontSize:18 }} />
                {notifications.length > 0 && (
                  <>
                    <span style={{ position:"absolute", top:0, right:0, width:8, height:8, background:GOLD, borderRadius:"50%", border:"2px solid #0a0a0a" }} />
                    <span style={{ position:"absolute", top:0, right:0, width:8, height:8, background:GOLD, borderRadius:"50%", animation:"pulse-ring 1.5s ease-out infinite" }} />
                  </>
                )}
              </button>
              {notifOpen && (
                <div style={{ position:"absolute", right:0, top:"calc(100% + 12px)", width:280, background:"#141414", border:`1px solid ${BORDER}`, borderRadius:16, padding:20, zIndex:200, boxShadow:"0 20px 60px rgba(0,0,0,.6)" }}>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, color:GOLD, marginBottom:12 }}>Notifications</div>
                  {notifications.length === 0
                    ? <div style={{ fontSize:13, color:"rgba(240,237,232,.35)" }}>You're all caught up ✓</div>
                    : <ul style={{ listStyle:"none", padding:0, margin:0, display:"flex", flexDirection:"column", gap:10, maxHeight:200, overflowY:"auto" }}>
                        {notifications.map((msg, i) => (
                          <li key={i} style={{ fontSize:13, color:"rgba(240,237,232,.75)", lineHeight:1.5, paddingLeft:12, borderLeft:`2px solid ${GOLD}` }}>{msg}</li>
                        ))}
                      </ul>
                  }
                </div>
              )}
            </div>

            {/* User avatar + dropdown */}
            <div style={{ position:"relative" }} ref={dropdownRef}>
              <button onClick={() => setDropdownOpen(v => !v)}
                style={{ display:"flex", alignItems:"center", gap:10, background:"rgba(255,255,255,.06)", border:`1px solid ${BORDER}`, borderRadius:100, padding:"6px 14px 6px 6px", cursor:"pointer" }}>
                <div style={{ width:30, height:30, borderRadius:"50%", background:GOLD, color:"#0a0a0a", fontWeight:800, fontFamily:"'Syne',sans-serif", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  {getInitial(user?.fullname?.firstname)}
                </div>
                <span style={{ fontSize:14, color:"#f0ede8", fontWeight:400 }}>{user?.fullname?.firstname}</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ opacity:.5, transition:"transform .2s", transform: dropdownOpen ? "rotate(180deg)" : "none" }}>
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {dropdownOpen && (
                <div style={{ position:"absolute", right:0, top:"calc(100% + 10px)", width:180, background:"#141414", border:`1px solid ${BORDER}`, borderRadius:14, padding:8, zIndex:200, boxShadow:"0 20px 60px rgba(0,0,0,.6)", animation:"fadeIn .15s ease" }}>
                  {[["Profile","/profile"],["Settings","/settings"],["My Bookings","/my-bookings"]].map(([l,p]) => (
                    <button key={p} onClick={() => navigate(p)} style={{ display:"block", width:"100%", padding:"10px 14px", textAlign:"left", background:"none", border:"none", color:"rgba(240,237,232,.75)", fontSize:14, cursor:"pointer", borderRadius:8, fontFamily:"inherit", transition:"background .15s, color .15s" }}
                      onMouseEnter={e => { e.target.style.background="rgba(255,255,255,.06)"; e.target.style.color="#f0ede8"; }}
                      onMouseLeave={e => { e.target.style.background="none"; e.target.style.color="rgba(240,237,232,.75)"; }}>
                      {l}
                    </button>
                  ))}
                  <div style={{ height:1, background:BORDER, margin:"8px 0" }} />
                  <button onClick={handleLogout} style={{ display:"block", width:"100%", padding:"10px 14px", textAlign:"left", background:"none", border:"none", color:"#e05a5a", fontSize:14, cursor:"pointer", borderRadius:8, fontFamily:"inherit", transition:"background .15s" }}
                    onMouseEnter={e => e.target.style.background="rgba(224,90,90,.08)"}
                    onMouseLeave={e => e.target.style.background="none"}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Hamburger */}
          <button className="hamburger" onClick={() => setMobileOpen(s => !s)}
            style={{ display:"none", background:"none", border:"none", cursor:"pointer", padding:8, flexDirection:"column", gap:5 }}>
            {[0,1,2].map(i => <span key={i} style={{ display:"block", width:22, height:1.5, background:"#f0ede8", borderRadius:2 }} />)}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div style={{ background:"rgba(10,10,10,.98)", borderTop:`1px solid ${BORDER}`, padding:"20px 24px", display:"flex", flexDirection:"column", gap:12 }}>
            {[["Home","/home"],["Partner","/captain-signup"],["Contact","/contact"],["My Bookings","/my-bookings"],["Profile","/profile"]].map(([l,p]) => (
              <button key={p} onClick={() => go(p)} style={{ background:"none", border:"none", color:"#f0ede8", textAlign:"left", fontSize:16, cursor:"pointer", fontFamily:"inherit", padding:"6px 0", borderBottom:`1px solid ${BORDER}` }}>{l}</button>
            ))}
            <button onClick={() => { handleLogout(); setMobileOpen(false); }} style={{ background:"none", border:"none", color:"#e05a5a", textAlign:"left", fontSize:16, cursor:"pointer", fontFamily:"inherit", padding:"6px 0" }}>Logout</button>
          </div>
        )}
      </header>

      {/* ── AD HERO ── */}
      <section style={{ height:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"0 24px", textAlign:"center", position:"relative", overflow:"hidden" }}>
        {/* bg radial glow */}
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 70% 50% at 50% 50%, rgba(230,190,100,.07) 0%, transparent 70%)", pointerEvents:"none" }} />

        {/* Dot grid */}
        <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(rgba(255,255,255,.06) 1px, transparent 1px)", backgroundSize:"40px 40px", pointerEvents:"none" }} />

        <div style={{ position:"relative", zIndex:1, maxWidth:800, opacity: adFade ? 1 : 0, transition:"opacity .35s ease" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(230,190,100,.1)", border:"1px solid rgba(230,190,100,.2)", borderRadius:100, padding:"6px 16px", marginBottom:28 }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:GOLD, display:"inline-block", animation:"shimmer 2s ease-in-out infinite" }} />
            <span style={{ fontSize:12, color:GOLD, letterSpacing:".08em", textTransform:"uppercase", fontWeight:500 }}>Featured</span>
          </div>
          <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(36px,6vw,72px)", fontWeight:800, lineHeight:1.08, letterSpacing:"-.025em", margin:"0 0 20px", color:"#f0ede8" }}>
            {adSlides[currentAd].title}
          </h1>
          <p style={{ fontSize:"clamp(16px,2vw,22px)", color:"rgba(240,237,232,.55)", margin:0, lineHeight:1.6, fontWeight:300 }}>
            {adSlides[currentAd].sub}
          </p>
        </div>

        {/* Slide dots */}
        <div style={{ position:"absolute", bottom:48, display:"flex", gap:8 }}>
          {adSlides.map((_, i) => (
            <button key={i} onClick={() => { setAdFade(false); setTimeout(() => { setCurrentAd(i); setAdFade(true); }, 200); }}
              style={{ width: i === currentAd ? 24 : 6, height:6, borderRadius:100, background: i === currentAd ? GOLD : "rgba(255,255,255,.2)", border:"none", cursor:"pointer", padding:0, transition:"width .3s, background .3s" }} />
          ))}
        </div>
      </section>

      {/* ── GREETING + SEARCH ── */}
      <section style={{ padding:"clamp(60px,8vw,100px) 24px", background:"#0d0d0d", borderTop:`1px solid ${BORDER}` }}>
        <div style={{ maxWidth:800, margin:"0 auto" }}>
          <div style={{ marginBottom:48 }}>
            <div style={{ fontSize:12, letterSpacing:".14em", textTransform:"uppercase", color:GOLD, fontWeight:500, marginBottom:12 }}>Find a creator</div>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(28px,4vw,48px)", fontWeight:800, lineHeight:1.1, letterSpacing:"-.02em", margin:0, color:"#f0ede8" }}>
              Hey {firstName}, who are<br />you looking for today?
            </h2>
          </div>

          <form onSubmit={handleSearch}>
            <div className="search-row" style={{ display:"flex", gap:12, marginBottom:12 }}>
              <input className="search-input" type="text" placeholder="Enter location (e.g., Vadodara)"
                value={location} onChange={e => setLocation(e.target.value)} required />
              <select className="search-select" value={shootType} onChange={e => setShootType(e.target.value)} required>
                <option value="">Select shoot type</option>
                {eventTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <button type="submit" className="gold-btn" style={{ width:"100%" }}>
              Find Available Creators →
            </button>
          </form>
        </div>
      </section>

      {/* ── PACKAGES ── */}
      <section style={{ padding:"clamp(60px,8vw,100px) 24px", background:BG, borderTop:`1px solid ${BORDER}` }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ marginBottom:56 }}>
            <div style={{ fontSize:12, letterSpacing:".14em", textTransform:"uppercase", color:GOLD, fontWeight:500, marginBottom:12 }}>Packages</div>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(28px,4vw,52px)", fontWeight:800, lineHeight:1.1, letterSpacing:"-.02em", margin:0, color:"#f0ede8" }}>
              Choose your perfect plan.
            </h2>
            <p style={{ color:"rgba(240,237,232,.4)", marginTop:12, fontSize:16, fontWeight:300 }}>Transparent pricing. No hidden fees. Book with confidence.</p>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:20 }}>
            {packages.map((pkg, i) => (
              <div key={pkg.name} className="pkg-card"
                onMouseEnter={() => setHoveredPkg(i)}
                onMouseLeave={() => setHoveredPkg(null)}
                style={{
                  background: hoveredPkg === i ? "rgba(230,190,100,.06)" : SURFACE,
                  border: hoveredPkg === i ? `1px solid rgba(230,190,100,.3)` : `1px solid ${BORDER}`,
                  borderRadius:20, padding:28, display:"flex", flexDirection:"column",
                  boxShadow: hoveredPkg === i ? "0 20px 60px rgba(0,0,0,.5)" : "none",
                  cursor:"default",
                }}>
                {/* Header */}
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
                  <div>
                    <div style={{ fontSize:11, letterSpacing:".1em", textTransform:"uppercase", color:"rgba(230,190,100,.6)", fontWeight:500, marginBottom:6 }}>{pkg.tag}</div>
                    <div style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:700, color:"#f0ede8" }}>{pkg.name}</div>
                  </div>
                  <span style={{ fontSize:28 }}>{pkg.emoji}</span>
                </div>

                <p style={{ fontSize:14, color:"rgba(240,237,232,.5)", margin:"0 0 20px", lineHeight:1.6, fontWeight:300 }}>{pkg.desc}</p>

                {/* Price */}
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(24px,3vw,32px)", fontWeight:800, color:"#f0ede8", letterSpacing:"-.02em", marginBottom:20 }}>{pkg.price}</div>

                <div style={{ height:1, background:BORDER, marginBottom:20 }} />

                {/* Deliverables */}
                <div style={{ fontSize:11, letterSpacing:".08em", textTransform:"uppercase", color:"rgba(230,190,100,.6)", fontWeight:500, marginBottom:10 }}>Deliverables</div>
                <ul style={{ listStyle:"none", padding:0, margin:"0 0 16px", display:"flex", flexDirection:"column", gap:8 }}>
                  {pkg.deliverables.map((d, j) => (
                    <li key={j} style={{ display:"flex", alignItems:"flex-start", gap:10, fontSize:13, color:"rgba(240,237,232,.65)", fontWeight:300, lineHeight:1.5 }}>
                      <span style={{ color:GOLD, marginTop:2, flexShrink:0 }}>✓</span>{d}
                    </li>
                  ))}
                </ul>

                {/* Meta */}
                <div style={{ display:"flex", gap:16, marginBottom:16, flexWrap:"wrap" }}>
                  <div style={{ background:"rgba(255,255,255,.04)", borderRadius:8, padding:"6px 12px", fontSize:12, color:"rgba(240,237,232,.5)" }}>
                    🕒 {pkg.duration}
                  </div>
                  <div style={{ background:"rgba(255,255,255,.04)", borderRadius:8, padding:"6px 12px", fontSize:12, color:"rgba(240,237,232,.5)" }}>
                    👥 {pkg.teamSize}
                  </div>
                </div>

                {pkg.note && (
                  <div style={{ background:"rgba(230,190,100,.08)", border:"1px solid rgba(230,190,100,.15)", borderRadius:10, padding:"10px 14px", fontSize:12, color:"rgba(230,190,100,.8)", marginBottom:16, lineHeight:1.5 }}>
                    ℹ️ {pkg.note}
                  </div>
                )}

                <button className="gold-btn" onClick={() => handleCheckout(pkg.stripePriceId)}
                  style={{ marginTop:"auto", width:"100%", padding:"13px 0", fontSize:14, borderRadius:12 }}>
                  Book Now →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section style={{ padding:"clamp(60px,8vw,100px) 0", background:"#0d0d0d", borderTop:`1px solid ${BORDER}`, overflow:"hidden" }}>
        <div style={{ maxWidth:1100, margin:"0 auto 48px", padding:"0 24px" }}>
          <div style={{ fontSize:12, letterSpacing:".14em", textTransform:"uppercase", color:GOLD, fontWeight:500, marginBottom:12 }}>Reviews</div>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(28px,4vw,48px)", fontWeight:800, lineHeight:1.1, letterSpacing:"-.02em", margin:0, color:"#f0ede8" }}>
            What our clients say.
          </h2>
        </div>
        <div style={{ position:"relative" }}>
          <div style={{ position:"absolute", left:0, top:0, bottom:0, width:100, background:`linear-gradient(to right, #0d0d0d, transparent)`, zIndex:2, pointerEvents:"none" }} />
          <div style={{ position:"absolute", right:0, top:0, bottom:0, width:100, background:`linear-gradient(to left, #0d0d0d, transparent)`, zIndex:2, pointerEvents:"none" }} />
          <div ref={scrollRef} style={{ display:"flex", gap:16, padding:"8px 24px", overflowX:"auto", scrollbarWidth:"none", msOverflowStyle:"none" }}>
            {[...reviews, ...reviews].map((r, i) => (
              <div key={i} className="review-card">
                <div style={{ display:"flex", gap:3, marginBottom:14 }}>
                  {[...Array(5)].map((_,j) => <span key={j} style={{ color:GOLD, fontSize:12 }}>★</span>)}
                </div>
                <p style={{ fontSize:14, color:"rgba(240,237,232,.65)", margin:"0 0 18px", lineHeight:1.65, fontWeight:300 }}>"{r.text}"</p>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, color:"#f0ede8" }}>{r.name}</div>
                <div style={{ fontSize:12, color:"rgba(240,237,232,.3)", marginTop:2 }}>{r.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT BANNER ── */}
      <section style={{ padding:"clamp(48px,6vw,80px) 24px", background:BG, borderTop:`1px solid ${BORDER}` }}>
        <div style={{ maxWidth:680, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:24 }}>
          <div>
            <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(20px,3vw,28px)", fontWeight:800, margin:"0 0 8px", letterSpacing:"-.01em", color:"#f0ede8" }}>
              Any questions, {firstName}?
            </h3>
            <p style={{ fontSize:15, color:"rgba(240,237,232,.4)", margin:0, fontWeight:300 }}>We're here to help — reach out any time.</p>
          </div>
          <Link to="/contact" className="gold-btn" style={{ textDecoration:"none", padding:"13px 28px", fontSize:14 }}>
            Contact Us →
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background:"#080808", borderTop:`1px solid ${BORDER}`, padding:"32px 24px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:16 }}>
          <img src="/assets/SnapHire-6-2-removebg-preview.png" alt="SnapHire" style={{ height:26, opacity:.6 }} />
          <div style={{ display:"flex", gap:24 }}>
            {[["Partner","/captain-signup"],["Contact","/contact"],["My Bookings","/my-bookings"]].map(([l,p]) => (
              <button key={p} onClick={() => navigate(p)} style={{ background:"none", border:"none", color:"rgba(240,237,232,.3)", fontSize:13, cursor:"pointer", fontFamily:"inherit", padding:0, transition:"color .2s" }}
                onMouseEnter={e => e.target.style.color="rgba(240,237,232,.7)"}
                onMouseLeave={e => e.target.style.color="rgba(240,237,232,.3)"}>
                {l}
              </button>
            ))}
          </div>
          <p style={{ color:"rgba(240,237,232,.18)", fontSize:13, margin:0 }}>© 2026 SnapHire. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}