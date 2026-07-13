import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const features = [
  { icon: '⚡', title: 'Instant Booking', desc: 'Book top creators in under 60 seconds. No back-and-forth.' },
  { icon: '🎨', title: 'Verified Creators', desc: 'Every photographer and reel maker is vetted and certified.' },
  { icon: '🚀', title: 'Fast Delivery', desc: 'Receive edited reels within hours of your shoot.' },
  { icon: '📱', title: 'Any Device', desc: 'Seamless experience on mobile, tablet, and desktop.' },
  { icon: '💡', title: 'Creative Direction', desc: 'Unique concepts tailored to your brand and style.' },
  { icon: '🕒', title: 'Flexible Hours', desc: 'Book around your schedule — morning to midnight.' },
  { icon: '💰', title: 'Clear Pricing', desc: 'No hidden fees. Know exactly what you pay upfront.' },
  { icon: '⭐', title: 'Rated 4.9/5', desc: 'Thousands of verified reviews from happy clients.' },
];

const plans = [
  {
    name: 'Hourly', price: '₹1,299', tag: 'Quick & sharp',
    features: ['1-hour shoot', '1 edited reel', 'Shot on iPhone 15 Pro', '10-min delivery', 'Certified creator'],
    cta: 'Book Now',
  },
  {
    name: 'Half-Day', price: '₹3,499', tag: 'Most popular',
    features: ['Up to 3-hour shoot', '2 edited reels', 'Shot on iPhone 15 Pro', 'Fast delivery', 'Certified creator'],
    cta: 'Book Now', highlight: true,
  },
];

const reviews = [
  { name: 'Aarav Mehta', role: 'Influencer', text: 'SnapHire made booking photographers seamless and professional. Absolutely love the results.' },
  { name: 'Ananya Rao', role: 'Brand Owner', text: 'High-quality reels delivered within hours. My content game has never been stronger.' },
  { name: 'Karan Verma', role: 'Event Manager', text: 'Smooth process, great results. Perfect for events and brand shoots.' },
  { name: 'Diya Singh', role: 'Content Creator', text: 'Reliable, fast, professional. I use SnapHire for every single shoot now.' },
  { name: 'Rohan Kapoor', role: 'Startup Founder', text: 'Affordable, polished, and incredibly efficient. Best investment for our brand.' },
  { name: 'Isha Patel', role: 'Wedding Planner', text: 'Fast booking, stunning quality. My clients are always impressed.' },
];

const stats = [
  { value: 10000, suffix: '+', label: 'Bookings completed' },
  { value: 500, suffix: '+', label: 'Verified creators' },
  { value: 4.9, suffix: '★', label: 'Average rating', decimal: true },
  { value: 98, suffix: '%', label: 'Client satisfaction' },
];

// Particle config
const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2.5 + 0.5,
  speed: Math.random() * 0.4 + 0.1,
  opacity: Math.random() * 0.25 + 0.05,
  drift: (Math.random() - 0.5) * 0.15,
}));

// Counter hook
function useCounter(target, duration = 1800, decimal = false) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      current = Math.min(target, increment * step);
      setCount(decimal ? Math.round(current * 10) / 10 : Math.floor(current));
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [started, target, duration, decimal]);

  return [count, ref];
}

// Scroll reveal hook
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.12 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, visible];
}

// Single stat counter component
function StatCounter({ stat }) {
  const [count, ref] = useCounter(stat.value, 1800, stat.decimal);
  return (
    <div ref={ref} style={{ textAlign: 'center', padding: '12px 24px' }}>
      <div style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 800, color: '#e6be64', letterSpacing: '-.02em', lineHeight: 1, fontFamily: "'Syne',sans-serif" }}>
        {count}{stat.suffix}
      </div>
      <div style={{ fontSize: 13, color: 'rgba(240,237,232,.45)', marginTop: 6, fontWeight: 300 }}>{stat.label}</div>
    </div>
  );
}

export default function Start() {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const heroRef = useRef(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(null);
  const [parallaxY, setParallaxY] = useState(0);
  const [particles, setParticles] = useState(PARTICLES);
  const [pageVisible, setPageVisible] = useState(false);
  const particleRaf = useRef(null);
  const particlesRef = useRef(PARTICLES);

  // Section reveal refs
  const [statsRef, statsVisible] = useReveal();
  const [featRef, featVisible] = useReveal();
  const [plansRef, plansVisible] = useReveal();
  const [reviewsRef, reviewsVisible] = useReveal();
  const [ctaRef, ctaVisible] = useReveal();

  // Page enter animation
  useEffect(() => {
    const t = setTimeout(() => setPageVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Font load
  useEffect(() => {
    const href = 'https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap';
    if (!document.querySelector(`link[href="${href}"]`)) {
      const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href;
      document.head.appendChild(l);
    }
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => { document.documentElement.style.scrollBehavior = ''; };
  }, []);

  // Parallax + scroll tracking
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      const heroH = heroRef.current?.offsetHeight || window.innerHeight;
      const progress = Math.min(window.scrollY / heroH, 1);
      setParallaxY(progress * 120);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Floating particles animation
  useEffect(() => {
    const tick = () => {
      particlesRef.current = particlesRef.current.map(p => ({
        ...p,
        y: p.y - p.speed * 0.04,
        x: p.x + p.drift * 0.04,
        y: ((p.y - p.speed * 0.04) + 100) % 100,
        x: ((p.x + p.drift * 0.04) + 100) % 100,
      }));
      setParticles([...particlesRef.current]);
      particleRaf.current = requestAnimationFrame(tick);
    };
    particleRaf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(particleRaf.current);
  }, []);

  // Review auto scroll
  useEffect(() => {
    let raf;
    const tick = () => {
      if (scrollRef.current) {
        scrollRef.current.scrollLeft += 0.6;
        if (scrollRef.current.scrollLeft >= scrollRef.current.scrollWidth / 2)
          scrollRef.current.scrollLeft = 0;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const go = (path) => { setMobileOpen(false); navigate(path); };

  const revealStyle = (visible, delay = 0) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(36px)',
    transition: `opacity .7s cubic-bezier(.22,1,.36,1) ${delay}s, transform .7s cubic-bezier(.22,1,.36,1) ${delay}s`,
  });

  return (
    <div style={{
      fontFamily: "'DM Sans', system-ui, sans-serif",
      background: '#0a0a0a', color: '#f0ede8', minHeight: '100vh',
      opacity: pageVisible ? 1 : 0,
      transition: 'opacity .5s ease',
    }}>
      <style>{`
        @keyframes shimmer { 0%,100%{opacity:.5} 50%{opacity:1} }
        @keyframes heroWord { from{opacity:0;transform:translateY(40px) skewY(2deg)} to{opacity:1;transform:none} }
        @keyframes heroBadge { from{opacity:0;transform:translateY(-16px)} to{opacity:1;transform:none} }
        @keyframes heroSub { from{opacity:0;transform:translateY(20px)} to{opacity:.65;transform:none} }
        @keyframes heroBtns { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
        @keyframes scrollLine { from{height:0;opacity:0} to{height:40px;opacity:.5} }
        .nav-link { position:relative; background:none; border:none; color:rgba(240,237,232,.65); font-size:14px; cursor:pointer; padding:0; font-family:inherit; }
        .nav-link::after { content:''; position:absolute; bottom:-2px; left:0; width:0; height:1px; background:#e6be64; transition:width .3s; }
        .nav-link:hover { color:#f0ede8; }
        .nav-link:hover::after { width:100%; }
        .cta-btn { transition:transform .25s, box-shadow .25s; }
        .cta-btn:hover { transform:scale(1.04); box-shadow:0 0 32px rgba(230,190,100,.3); }
        .outline-btn { transition:background .25s, border-color .25s; }
        .outline-btn:hover { background:rgba(230,190,100,.08) !important; border-color:rgba(230,190,100,.5) !important; }
        .feature-card { transition:transform .3s cubic-bezier(.22,1,.36,1), border-color .3s, box-shadow .3s; }
        .feature-card:hover { transform:translateY(-6px) scale(1.02); border-color:rgba(230,190,100,.3) !important; box-shadow:0 16px 48px rgba(0,0,0,.4); }
        .feat-icon { transition:transform .3s; display:inline-block; }
        .feature-card:hover .feat-icon { transform:scale(1.15) rotate(-4deg); }
        .plan-card { transition:transform .35s cubic-bezier(.22,1,.36,1), box-shadow .35s; }
        .plan-card:hover { transform:translateY(-8px); box-shadow:0 24px 60px rgba(0,0,0,.5); }
        .review-card { transition:border-color .3s, background .3s; }
        .review-card:hover { border-color:rgba(230,190,100,.25) !important; background:rgba(255,255,255,.05) !important; }
        @media (max-width:768px) {
          .desktop-nav, .desktop-ctas { display:none !important; }
          .hamburger { display:flex !important; }
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 100,
        padding: '14px 32px', boxSizing: 'border-box',
        background: scrolled ? 'rgba(10,10,10,.9)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,.07)' : 'none',
        transition: 'all .4s',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Text logo */}
          <div onClick={() => navigate('/')} style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'baseline' }}>
            <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, color: '#f0ede8', letterSpacing: '-.5px' }}>snap</span>
            <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, color: '#e6be64', letterSpacing: '-.5px' }}>hire</span>
          </div>

          <nav className="desktop-nav" style={{ display: 'flex', gap: 36, alignItems: 'center' }}>
            {[['Home', '/'], ['Become a Partner', '/captain-signup'], ['Contact', '/contact']].map(([l, p]) => (
              <button key={p} className="nav-link" onClick={() => navigate(p)}>{l}</button>
            ))}
          </nav>

          <div className="desktop-ctas" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button className="outline-btn" onClick={() => navigate('/login')}
              style={{ border: '1px solid rgba(255,255,255,.2)', background: 'none', color: '#f0ede8', borderRadius: 100, padding: '9px 22px', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
              Log in
            </button>
            <button className="cta-btn" onClick={() => navigate('/login')}
              style={{ background: '#e6be64', color: '#0a0a0a', borderRadius: 100, padding: '9px 22px', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: "'Syne',sans-serif" }}>
              Get Started
            </button>
          </div>

          <button onClick={() => setMobileOpen(s => !s)} className="hamburger"
            style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 8, flexDirection: 'column', gap: 5 }}>
            {[0,1,2].map(i => <span key={i} style={{ display: 'block', width: 22, height: 1.5, background: '#f0ede8', borderRadius: 2 }} />)}
          </button>
        </div>

        {mobileOpen && (
          <div style={{ background: 'rgba(10,10,10,.98)', borderTop: '1px solid rgba(255,255,255,.08)', padding: '20px 32px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[['Home', '/'], ['Become a Partner', '/captain-signup'], ['Contact', '/contact']].map(([l, p]) => (
              <button key={p} onClick={() => go(p)} style={{ background: 'none', border: 'none', color: '#f0ede8', textAlign: 'left', fontSize: 16, cursor: 'pointer', fontFamily: 'inherit', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,.07)' }}>{l}</button>
            ))}
            <button onClick={() => go('/login')} style={{ background: '#e6be64', color: '#0a0a0a', border: 'none', borderRadius: 100, padding: '13px 0', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: "'Syne',sans-serif", marginTop: 8 }}>
              Get Started →
            </button>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section ref={heroRef} style={{ position: 'relative', height: '100vh', minHeight: 640, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

        {/* Parallax image */}
        <img src="/assets/pexels-photo-29180825-3-2.jpg" alt=""
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '115%',
            objectFit: 'cover', objectPosition: 'center center',
            transform: `translateY(${parallaxY}px)`,
            transition: 'transform .05s linear',
            top: '-8%',
          }} />

        {/* Floating particles */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', overflow: 'hidden' }}>
          {particles.map(p => (
            <div key={p.id} style={{
              position: 'absolute',
              left: `${p.x}%`, top: `${p.y}%`,
              width: p.size, height: p.size,
              borderRadius: '50%',
              background: '#e6be64',
              opacity: p.opacity,
              willChange: 'transform',
            }} />
          ))}
        </div>

        {/* Overlays */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to bottom, rgba(10,10,10,.7) 0%, rgba(10,10,10,.35) 50%, rgba(10,10,10,.9) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(230,190,100,.07) 0%, transparent 70%)' }} />

        {/* Hero content */}
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 24px', maxWidth: 860, margin: '0 auto' }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(230,190,100,.12)', border: '1px solid rgba(230,190,100,.25)', borderRadius: 100, padding: '6px 16px', marginBottom: 32, animation: 'heroBadge .8s cubic-bezier(.22,1,.36,1) .1s both' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#e6be64', display: 'inline-block', animation: 'shimmer 2s ease-in-out infinite' }} />
            <span style={{ fontSize: 13, color: '#e6be64', fontWeight: 500, letterSpacing: '.03em' }}>Now live across India</span>
          </div>

          {/* Headline — word by word */}
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(42px,7.5vw,88px)', fontWeight: 800, lineHeight: 1.04, letterSpacing: '-.025em', margin: '0 0 24px', color: '#f0ede8' }}>
            {['Book', 'creators.'].map((word, i) => (
              <span key={i} style={{ display: 'inline-block', marginRight: i === 0 ? '.25em' : 0, animation: `heroWord .8s cubic-bezier(.22,1,.36,1) ${.2 + i * .12}s both` }}>{word}</span>
            ))}
            <br />
            {['Go', 'viral.'].map((word, i) => (
              <span key={i} style={{ display: 'inline-block', color: '#e6be64', marginRight: i === 0 ? '.25em' : 0, animation: `heroWord .8s cubic-bezier(.22,1,.36,1) ${.44 + i * .12}s both` }}>{word}</span>
            ))}
          </h1>

          <p style={{ fontSize: 'clamp(16px,2vw,20px)', color: 'rgba(240,237,232,.65)', maxWidth: 540, margin: '0 auto 40px', lineHeight: 1.65, fontWeight: 300, animation: 'heroSub .9s cubic-bezier(.22,1,.36,1) .7s both' }}>
            On-demand photographers and reel makers — booked in seconds, delivered fast. Built for creators, brands, and businesses.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', animation: 'heroBtns .8s cubic-bezier(.22,1,.36,1) .85s both' }}>
            <button className="cta-btn" onClick={() => navigate('/login')}
              style={{ background: '#e6be64', color: '#0a0a0a', border: 'none', borderRadius: 100, padding: '15px 36px', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: "'Syne',sans-serif" }}>
              Book a Creator →
            </button>
            <button className="outline-btn" onClick={() => navigate('/captain-signup')}
              style={{ border: '1px solid rgba(255,255,255,.25)', background: 'rgba(255,255,255,.05)', color: '#f0ede8', borderRadius: 100, padding: '15px 36px', fontSize: 16, cursor: 'pointer', fontFamily: 'inherit' }}>
              Become a Partner
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, zIndex: 2 }}>
          <span style={{ fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(240,237,232,.4)' }}>Scroll</span>
          <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, rgba(230,190,100,.6), transparent)', animation: 'scrollLine 1.2s ease .5s both' }} />
        </div>
      </section>

      {/* ── STATS ── */}
      <section ref={statsRef} style={{ background: '#111', borderTop: '1px solid rgba(255,255,255,.06)', borderBottom: '1px solid rgba(255,255,255,.06)', padding: '40px 24px', ...revealStyle(statsVisible) }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 0 }}>
          {stats.map((s, i) => (
            <div key={i} style={{ borderRight: i < stats.length - 1 ? '1px solid rgba(255,255,255,.07)' : 'none', ...revealStyle(statsVisible, i * 0.1) }}>
              <StatCounter stat={s} />
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: 'clamp(60px,8vw,120px) 24px', background: '#0a0a0a' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div ref={featRef} style={{ marginBottom: 64, maxWidth: 540, ...revealStyle(featVisible) }}>
            <div style={{ fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', color: '#e6be64', fontWeight: 500, marginBottom: 16 }}>Why SnapHire</div>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(30px,4vw,52px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-.02em', margin: 0, color: '#f0ede8' }}>
              Everything you need,<br />nothing you don't.
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {features.map((f, i) => (
              <div key={i} className="feature-card"
                onMouseEnter={() => setActiveFeature(i)}
                onMouseLeave={() => setActiveFeature(null)}
                style={{
                  background: activeFeature === i ? 'rgba(230,190,100,.06)' : 'rgba(255,255,255,.03)',
                  border: '1px solid rgba(255,255,255,.07)',
                  borderRadius: 16, padding: '28px 24px', cursor: 'default',
                  ...revealStyle(featVisible, 0.1 + i * 0.06),
                }}>
                <span className="feat-icon" style={{ fontSize: 28, marginBottom: 16, display: 'block' }}>{f.icon}</span>
                <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 700, color: '#f0ede8', margin: '0 0 8px' }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: 'rgba(240,237,232,.5)', margin: 0, lineHeight: 1.6, fontWeight: 300 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLANS ── */}
      <section style={{ padding: 'clamp(60px,8vw,120px) 24px', background: '#0d0d0d', borderTop: '1px solid rgba(255,255,255,.05)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div ref={plansRef} style={{ textAlign: 'center', marginBottom: 64, ...revealStyle(plansVisible) }}>
            <div style={{ fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', color: '#e6be64', fontWeight: 500, marginBottom: 16 }}>Pricing</div>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(30px,4vw,52px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-.02em', margin: 0, color: '#f0ede8' }}>Simple, honest pricing.</h2>
            <p style={{ color: 'rgba(240,237,232,.45)', marginTop: 16, fontSize: 16, fontWeight: 300 }}>No subscriptions. No hidden fees. Pay per shoot.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {plans.map((plan, i) => (
              <div key={i} className="plan-card" style={{
                background: plan.highlight ? 'rgba(230,190,100,.08)' : 'rgba(255,255,255,.03)',
                border: plan.highlight ? '1px solid rgba(230,190,100,.35)' : '1px solid rgba(255,255,255,.08)',
                borderRadius: 20, padding: '36px 32px', position: 'relative', overflow: 'hidden',
                ...revealStyle(plansVisible, i * 0.15),
              }}>
                {plan.highlight && (
                  <div style={{ position: 'absolute', top: 20, right: 20, background: '#e6be64', color: '#0a0a0a', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 100, letterSpacing: '.06em', textTransform: 'uppercase', fontFamily: "'Syne',sans-serif" }}>Popular</div>
                )}
                <div style={{ fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', color: plan.highlight ? '#e6be64' : 'rgba(240,237,232,.4)', fontWeight: 500, marginBottom: 12 }}>{plan.tag}</div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(38px,5vw,52px)', fontWeight: 800, color: '#f0ede8', letterSpacing: '-.03em', lineHeight: 1, marginBottom: 6 }}>{plan.price}</div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 700, color: '#f0ede8', marginBottom: 28 }}>{plan.name} Plan</div>
                <div style={{ height: 1, background: 'rgba(255,255,255,.07)', marginBottom: 28 }} />
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 36px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {plan.features.map((feat, j) => (
                    <li key={j} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, color: 'rgba(240,237,232,.75)', fontWeight: 300 }}>
                      <span style={{ width: 18, height: 18, borderRadius: '50%', background: plan.highlight ? 'rgba(230,190,100,.2)' : 'rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 10, color: plan.highlight ? '#e6be64' : 'rgba(240,237,232,.5)' }}>✓</span>
                      {feat}
                    </li>
                  ))}
                </ul>
                <button className="cta-btn" onClick={() => navigate('/login')} style={{
                  width: '100%', padding: '14px 0', borderRadius: 100, border: 'none', cursor: 'pointer',
                  fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 700,
                  background: plan.highlight ? '#e6be64' : 'rgba(255,255,255,.08)',
                  color: plan.highlight ? '#0a0a0a' : '#f0ede8',
                }}>{plan.cta} →</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section ref={reviewsRef} style={{ padding: 'clamp(60px,8vw,120px) 0', background: '#0a0a0a', borderTop: '1px solid rgba(255,255,255,.05)', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', marginBottom: 48, ...revealStyle(reviewsVisible) }}>
          <div style={{ fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', color: '#e6be64', fontWeight: 500, marginBottom: 16 }}>Reviews</div>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(30px,4vw,52px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-.02em', margin: 0, color: '#f0ede8' }}>
            Loved by creators<br />and brands alike.
          </h2>
        </div>
        <div style={{ overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 120, background: 'linear-gradient(to right, #0a0a0a, transparent)', zIndex: 2, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 120, background: 'linear-gradient(to left, #0a0a0a, transparent)', zIndex: 2, pointerEvents: 'none' }} />
          <div ref={scrollRef} style={{ display: 'flex', gap: 20, padding: '8px 24px', overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {reviews.concat(reviews).map((r, i) => (
              <div key={i} className="review-card" style={{ minWidth: 320, maxWidth: 320, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 16, padding: '28px 24px', flexShrink: 0 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                  {[...Array(5)].map((_, j) => <span key={j} style={{ color: '#e6be64', fontSize: 13 }}>★</span>)}
                </div>
                <p style={{ fontSize: 15, color: 'rgba(240,237,232,.7)', margin: '0 0 20px', lineHeight: 1.65, fontWeight: 300 }}>"{r.text}"</p>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, color: '#f0ede8', fontSize: 14 }}>{r.name}</div>
                <div style={{ fontSize: 12, color: 'rgba(240,237,232,.35)', marginTop: 2 }}>{r.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section ref={ctaRef} style={{ padding: 'clamp(60px,8vw,100px) 24px', background: '#111', borderTop: '1px solid rgba(255,255,255,.06)', ...revealStyle(ctaVisible) }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(32px,5vw,60px)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-.025em', margin: '0 0 24px', color: '#f0ede8' }}>
            Your next viral reel<br />starts here.
          </h2>
          <p style={{ fontSize: 17, color: 'rgba(240,237,232,.5)', margin: '0 0 40px', fontWeight: 300, lineHeight: 1.6 }}>
            Join thousands of creators and brands who trust SnapHire to capture their best moments.
          </p>
          <button className="cta-btn" onClick={() => navigate('/login')}
            style={{ background: '#e6be64', color: '#0a0a0a', border: 'none', borderRadius: 100, padding: '16px 44px', fontSize: 17, fontWeight: 700, cursor: 'pointer', fontFamily: "'Syne',sans-serif" }}>
            Book Your First Shoot →
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#0a0a0a', borderTop: '1px solid rgba(255,255,255,.06)', padding: '40px 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div onClick={() => navigate('/')} style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'baseline' }}>
            <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20, color: '#f0ede8', letterSpacing: '-.5px' }}>snap</span>
            <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20, color: '#e6be64', letterSpacing: '-.5px' }}>hire</span>
          </div>
          <div style={{ display: 'flex', gap: 32 }}>
            {[['Partner', '/captain-signup'], ['Contact', '/contact'], ['Login', '/login']].map(([l, p]) => (
              <button key={p} onClick={() => navigate(p)} style={{ background: 'none', border: 'none', color: 'rgba(240,237,232,.3)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', padding: 0, transition: 'color .2s' }}
                onMouseEnter={e => e.target.style.color = 'rgba(240,237,232,.7)'}
                onMouseLeave={e => e.target.style.color = 'rgba(240,237,232,.3)'}>
                {l}
              </button>
            ))}
          </div>
          <p style={{ color: 'rgba(240,237,232,.2)', fontSize: 13, margin: 0 }}>© 2026 SnapHire. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}