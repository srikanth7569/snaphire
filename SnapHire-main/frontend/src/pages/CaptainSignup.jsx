import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

// design reference screenshot (will be served by environment)
const uploadedScreenshot = "/mnt/data/Screenshot 2025-11-24 at 9.22.59 PM.png";

const features = [
  { icon: '📱', title: 'Flexible Work', desc: 'Choose your own schedule and projects.' },
  { icon: '💸', title: 'Instant Payment', desc: 'Get paid immediately after each shoot.' },
  { icon: '🌍', title: 'Global Exposure', desc: 'Work with clients locally and internationally.' },
  { icon: '🧠', title: 'Creative Community', desc: 'Collaborate and learn with fellow creators.' },
  { icon: '📈', title: 'Growth Path', desc: 'Top performers featured in brand campaigns.' },
];

const reviews = [
  { name: 'Aditya Sharma, Delhi', text: 'SnapHire helped me turn my hobby into a part-time income of ₹20K per month.' },
  { name: 'Sneha Gupta, Mumbai', text: 'Easy platform to get gigs instantly. Loved the community and flexibility!' },
  { name: 'Rahul Verma, Bangalore', text: 'Professional and hassle-free. Perfect for creators starting out.' },
];

const skillsOptions = ['Wedding Photography','Birthday Photography','Event Photography','Fashion Shoot','Reel Making','Product Shoot','Travel Shoot','Concert Shoot','Corporate Shoot'];
const cameraOptions = ["Smartphone","DSLR","iPhone 13","iPhone 13 Mini","iPhone 13 Pro","iPhone 13 Pro Max","iPhone 14","iPhone 14 Plus","iPhone 14 Pro","iPhone 14 Pro Max","iPhone 15","iPhone 15 Plus","iPhone 15 Pro","iPhone 15 Pro Max","iPhone 16","iPhone 16 Plus","iPhone 16 Pro","iPhone 16 Pro Max","Samsung Galaxy S23 Ultra","Samsung Galaxy S24 Ultra","Samsung Galaxy S25 Ultra","DSLR Camera","Mirrorless Camera"];

/* inline icons */
function ChevronDownIcon(props){return <svg {...props} width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
function XIcon(props){return <svg {...props} width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}

function MultiSelect({ label, options, values, setValues }){
  const [open, setOpen] = useState(false);
  const toggleOption = (opt) => {
    if(values.includes(opt)) setValues(values.filter(v => v !== opt)); else setValues([...values,opt]);
  };
  return (
    <div className="relative">
      <label className="block mb-1 text-yellow-300">{label}</label>
      <div onClick={() => setOpen(!open)} className="w-full px-4 py-2 flex flex-wrap gap-2 rounded border border-yellow-400 bg-black/50 text-white cursor-pointer">
        {values.length>0 ? values.map(val => (
          <span key={val} className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-300 border border-yellow-400 rounded-full text-sm">
            <span className="truncate max-w-[140px] block">{val}</span>
            <button type="button" className="ml-1" onClick={(e)=>{e.stopPropagation(); toggleOption(val);}} aria-label={`Remove ${val}`}><XIcon className="text-yellow-300"/></button>
          </span>
        )) : <span className="text-yellow-300/60">Select {label.toLowerCase()}...</span> }
        <ChevronDownIcon className="ml-auto text-yellow-400" />
      </div>
      {open && (
        <div className="absolute z-10 mt-2 w-full max-h-48 overflow-y-auto bg-black border border-yellow-400 rounded-lg shadow-lg">
          {options.map(opt=> (
            <div key={opt} onClick={() => toggleOption(opt)} className={`px-4 py-2 cursor-pointer hover:bg-yellow-500/20 ${values.includes(opt)? 'bg-yellow-500/30 text-yellow-300':'text-white'}`}>
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const CaptainSignup = () => {
  const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [firstname,setFirstname]=useState(''); const [lastname,setLastname]=useState(''); const [phone,setPhone]=useState('');
  const [cameraType,setCameraType]=useState([]); const [skills,setSkills]=useState([]); const [location,setLocation]=useState(''); const [instagram,setInstagram]=useState(''); const [vsco,setVsco]=useState(''); const [portfolio,setPortfolio]=useState('');

  const navigate = useNavigate(); const scrollRef = useRef(null); const signupRef = useRef(null); const rafRef = useRef(null); const pauseRef = useRef(false);

  useEffect(()=>{ const id='captain-poppins'; if(!document.getElementById(id)){ const link=document.createElement('link'); link.id=id; link.rel='stylesheet'; link.href='https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap'; document.head.appendChild(link);} document.documentElement.style.fontFamily = "'Poppins', system-ui, -apple-system, 'Segoe UI', Roboto, Arial"; },[]);

  useEffect(()=>{ const token=localStorage.getItem('token'); if(token){ toast('You are already logged in.'); navigate('/captain-dashboard'); } },[navigate]);

  useEffect(()=>{
    const ref=scrollRef.current; if(!ref) return; let px=0; const step=()=>{ if(!ref) return; if(!pauseRef.current){ px+=0.6; ref.scrollLeft=px; if(px>=ref.scrollWidth/2) px=0; } rafRef.current=requestAnimationFrame(step); }; rafRef.current=requestAnimationFrame(step); const interval=setInterval(()=>{ if(ref && px>=ref.scrollWidth/2) px=0; },500); setTimeout(()=>clearInterval(interval),3000); return ()=>cancelAnimationFrame(rafRef.current);
  },[]);

  const scrollToSignup = () => signupRef.current?.scrollIntoView({ behavior: 'smooth' });

  const submithandler = async (e)=>{
    e.preventDefault(); const parts=(location||'').split(',').map(s=>s.trim()); const city=parts[0]||''; const state=parts[1]||''; const country=parts[2]||'';
    const newCaptain = { fullname:{firstname,lastname}, email, phone, password, camera:{cameraType}, skills, location:{city,state,country}, socialLinks:{instagram,vsco,portfolio} };
    try{ await axios.post(`${import.meta.env.VITE_BASE_URL}/captains/register`, newCaptain); toast.success('Captain registered successfully!'); const loginRes = await axios.post(`${import.meta.env.VITE_BASE_URL}/captains/login`, { email, password }); localStorage.setItem('token', loginRes.data.token); localStorage.setItem('captainId', loginRes.data.captain._id); localStorage.setItem('firstname', loginRes.data.captain.fullname.firstname); localStorage.setItem('lastname', loginRes.data.captain.fullname.lastname); navigate('/captain-dashboard'); } catch(error){ console.error(error.response?.data||error.message); toast.error(error.response?.data?.message||'Registration failed'); }
    setEmail(''); setFirstname(''); setLastname(''); setPhone(''); setPassword(''); setCameraType([]); setSkills([]); setLocation(''); setInstagram(''); setVsco(''); setPortfolio('');
  };

  return (
    <div className="w-full font-sans">

      {/* Nav (clean) */}
      <header className="fixed top-0 left-0 w-full z-50 pointer-events-auto">
        <div className="max-w-7xl mx-auto px-6 sm:px-16 py-4">
          <div className="w-full rounded-2xl px-6 py-3 flex items-center justify-between bg-gradient-to-r from-black/60 via-yellow-800/10 to-black/60 backdrop-blur-xl border border-white/6 shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
  <div className="text-white font-bold text-4xl leading-none">
    SnapHire
  </div>

  <div className="text-white/60 text-sm leading-none mt-1">
    Creators · Gigs · Growth
  </div>
</div>



            <nav className="hidden lg:flex items-center gap-8">
              <button onClick={() => navigate('/')} className="relative text-white/90 hover:text-white transition font-medium">
                Home
                <span className="absolute left-0 -bottom-2 w-0 h-0.5 bg-yellow-400 transition-all group-hover:w-full" />
              </button>
              <button onClick={scrollToSignup} className="relative text-white/90 hover:text-white transition font-medium">
                Partner
                <span className="absolute left-0 -bottom-2 w-0 h-0.5 bg-yellow-400 transition-all group-hover:w-full" />
              </button>
              <button onClick={() => navigate('/contact')} className="relative text-white/90 hover:text-white transition font-medium">
                Contact Us
                <span className="absolute left-0 -bottom-2 w-0 h-0.5 bg-yellow-400 transition-all group-hover:w-full" />
              </button>
            </nav>

            <div className="hidden lg:flex items-center gap-3">
              <button onClick={() => navigate('/captain-login')} className="px-4 py-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition">Login</button>
              <button onClick={() => navigate('/captain-signup')} className="px-4 py-2 rounded-full bg-yellow-400 text-black font-semibold hover:scale-105 transform transition-shadow shadow-[0_8px_30px_rgba(255,196,0,0.18)]">Sign Up</button>
            </div>

            <div className="lg:hidden">
              <button onClick={scrollToSignup} className="px-3 py-2 rounded-full bg-yellow-400 text-black font-medium">Get Started</button>
            </div>
          </div>
        </div>
      </header>

      {/* hero (enhanced) */}
      <section className="relative h-screen w-full bg-black flex flex-col justify-center items-center px-6 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src={uploadedScreenshot} alt="hero-bg" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-yellow-600/6 to-black/70" />
          <div className="absolute inset-0 animate-hero-gradient mix-blend-overlay" />
        </div>

        {/* floating shapes */}
        <svg className="absolute left-8 top-20 opacity-30 animate-float" width="220" height="220" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="100" cy="100" r="80" fill="rgba(255,196,0,0.06)" /></svg>
        <svg className="absolute right-10 bottom-32 opacity-25 animate-float-reverse" width="280" height="280" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="10" width="180" height="180" rx="36" fill="rgba(255,196,0,0.04)" /></svg>

        <div className="flex flex-col items-center justify-center text-center space-y-6 max-w-4xl px-4">
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white leading-tight drop-shadow-xl">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-yellow-400 to-white">Turn Your iPhone Into a Content-Creating Income Machine</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/80 drop-shadow-md max-w-3xl">SnapHire connects talented creators with clients who need professional photography and reels — fast, easy, and reliable. Capture moments, create stories, and grow your business with every shoot.</p>

          <div className="flex gap-4 flex-wrap justify-center mt-6">
            <button onClick={scrollToSignup} className="relative overflow-hidden bg-yellow-500 text-black font-bold py-3 px-8 rounded-full text-lg hover:bg-yellow-600 transition shadow-lg transform-gpu will-change-transform hover:-translate-y-0.5 active:translate-y-0">
              <span className="absolute -left-10 top-0 h-full w-24 bg-yellow-400/30 blur-xl animate-pulse-slow" />Get Started
            </button>
            <button onClick={scrollToSignup} className="bg-transparent border-2 border-yellow-500 text-yellow-500 font-bold py-3 px-8 rounded-full hover:bg-yellow-500 hover:text-black transition shadow-lg">Become Our Partner</button>
          </div>

          <div className="mt-8 flex gap-3 flex-wrap justify-center">
            <div className="px-3 py-2 rounded-full bg-black/50 border border-yellow-400/20 text-white text-sm flex items-center gap-2 shadow-sm"><span className="text-xl">⚡</span><span>Fast Booking</span></div>
            <div className="px-3 py-2 rounded-full bg-black/50 border border-yellow-400/20 text-white text-sm flex items-center gap-2 shadow-sm"><span className="text-xl">🎨</span><span>Skilled Creators</span></div>
            <div className="px-3 py-2 rounded-full bg-black/50 border border-yellow-400/20 text-white text-sm flex items-center gap-2 shadow-sm"><span className="text-xl">🚀</span><span>Instant Delivery</span></div>
          </div>
        </div>

        <div className="hidden lg:flex absolute right-20 top-24 z-0">
          <div className="w-44 h-[270px] rounded-3xl bg-gradient-to-b from-black/70 to-black/40 border border-yellow-400/10 shadow-2xl transform rotate-6">
            <img src="/assets/pexels-photo-29180825-3-2.jpg" alt="phone-mock" className="w-full h-full object-cover rounded-3xl opacity-90" />
          </div>
        </div>
      </section>

      {/* Why Join */}
      <section className="py-16 px-6 sm:px-16 bg-black text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold mb-2 text-yellow-400">Why Join SnapHire?</h2>
            <p className="text-white/70 max-w-2xl mx-auto">Flexible, creative, and rewarding. Work with brands, events, and influencers while earning from your passion.</p>
          </div>

          {/* quick stats row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-10">
            <div className="flex flex-col items-center">
              <div className="text-2xl font-extrabold text-yellow-300">3.2k+</div>
              <div className="text-sm text-white/70">Active Creators</div>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div className="flex flex-col items-center">
              <div className="text-2xl font-extrabold text-yellow-300">1.1k+</div>
              <div className="text-sm text-white/70">Gigs / month</div>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div className="flex flex-col items-center">
              <div className="text-2xl font-extrabold text-yellow-300">99%</div>
              <div className="text-sm text-white/70">5★ Customer Rating</div>
            </div>
          </div>

          {/* benefit cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-gradient-to-b from-black/60 to-black/40 border border-yellow-400/20 shadow-lg hover:scale-105 transition-transform">
              <div className="flex items-center gap-4 mb-3">
                <div className="text-4xl">⚡</div>
                <h3 className="text-xl font-semibold text-yellow-400">Fast Booking</h3>
              </div>
              <p className="text-white/80">Instantly connect with clients and confirm gigs — our in-app booking flow is optimized for speed so you spend less time coordinating and more time shooting.</p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-b from-black/60 to-black/40 border border-yellow-400/20 shadow-lg hover:scale-105 transition-transform">
              <div className="flex items-center gap-4 mb-3">
                <div className="text-4xl">🎨</div>
                <h3 className="text-xl font-semibold text-yellow-400">Skilled Creators</h3>
              </div>
              <p className="text-white/80">Join a vetted community of photographers and reel makers — verified profiles, portfolio galleries, and client reviews help you stand out.</p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-b from-black/60 to-black/40 border border-yellow-400/20 shadow-lg hover:scale-105 transition-transform">
              <div className="flex items-center gap-4 mb-3">
                <div className="text-4xl">💸</div>
                <h3 className="text-xl font-semibold text-yellow-400">Instant Payment</h3>
              </div>
              <p className="text-white/80">Get paid quickly after each job with secure payouts and transparent fees — no waiting weeks for your earnings.</p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-b from-black/60 to-black/40 border border-yellow-400/20 shadow-lg hover:scale-105 transition-transform">
              <div className="flex items-center gap-4 mb-3">
                <div className="text-4xl">📈</div>
                <h3 className="text-xl font-semibold text-yellow-400">Growth & Features</h3>
              </div>
              <p className="text-white/80">Our promotional tools and featured listings help top creators land brand deals and long-term clients — build a sustainable creative career.</p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-b from-black/60 to-black/40 border border-yellow-400/20 shadow-lg hover:scale-105 transition-transform">
              <div className="flex items-center gap-4 mb-3">
                <div className="text-4xl">🛠️</div>
                <h3 className="text-xl font-semibold text-yellow-400">Easy Tools</h3>
              </div>
              <p className="text-white/80">In-app messaging, simple scheduling, and portfolio uploads — everything creators need to manage their work from one place.</p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-b from-black/60 to-black/40 border border-yellow-400/20 shadow-lg hover:scale-105 transition-transform">
              <div className="flex items-center gap-4 mb-3">
                <div className="text-4xl">🤝</div>
                <h3 className="text-xl font-semibold text-yellow-400">Trusted Community</h3>
              </div>
              <p className="text-white/80">Thousands of happy clients and verified reviews create a reliable marketplace for creators to grow their reputation.</p>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-10 flex justify-center">
            <button onClick={scrollToSignup} className="bg-yellow-500 text-black px-6 py-3 rounded-full font-bold hover:bg-yellow-600 transition shadow-lg">Join as Creator</button>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-16 px-6 sm:px-16 bg-black text-white">
        <h2 className="text-3xl font-bold text-center mb-12 text-yellow-400">Real Stories, Real Success</h2>
        <div ref={scrollRef} className="flex gap-6 overflow-x-auto scrollbar-hide py-4" onMouseEnter={()=>{pauseRef.current=true}} onMouseLeave={()=>{pauseRef.current=false}}>
          {reviews.concat(reviews).map((review,i)=>(
            <div key={i} className="min-w-[280px] bg-black/30 backdrop-blur-md p-6 rounded-xl shadow-lg flex flex-col justify-between">
              <p className="text-white/90 mb-4">"{review.text}"</p>
              <span className="font-bold text-yellow-400">{review.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Signup (aesthetic card) */}
      <section ref={signupRef} className="py-20 px-6 sm:px-16 bg-black flex justify-center">
        <div className="max-w-md w-full p-10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] bg-gradient-to-b from-black/80 to-black/40 backdrop-blur-xl border border-yellow-400/20">
          <h2 className="text-4xl font-extrabold text-yellow-400 text-center mb-8 drop-shadow-lg tracking-wide">Ready to Start?</h2>
          <form onSubmit={submithandler} className="flex flex-col gap-5">
            <div className="flex gap-3">
              <input required className="w-1/2 px-4 py-3 rounded-xl border border-yellow-400/40 bg-black/60 text-white placeholder-yellow-300 focus:ring-2 focus:ring-yellow-500 outline-none shadow-inner transition" type="text" placeholder="First name" value={firstname} onChange={(e)=>setFirstname(e.target.value)} />
              <input required className="w-1/2 px-4 py-3 rounded-xl border border-yellow-400/40 bg-black/60 text-white placeholder-yellow-300 focus:ring-2 focus:ring-yellow-500 outline-none shadow-inner transition" type="text" placeholder="Last name" value={lastname} onChange={(e)=>setLastname(e.target.value)} />
            </div>
            <input required className="px-4 py-3 rounded-xl border border-yellow-400/40 bg-black/60 text-white placeholder-yellow-300 focus:ring-2 focus:ring-yellow-500 outline-none shadow-inner transition" type="email" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
            <input required className="px-4 py-3 rounded-xl border border-yellow-400/40 bg-black/60 text-white placeholder-yellow-300 focus:ring-2 focus:ring-yellow-500 outline-none shadow-inner transition" type="tel" placeholder="Phone Number" value={phone} onChange={(e)=>setPhone(e.target.value)} pattern="[0-9]{10}" title="Enter a valid 10-digit phone number" />
            <input required className="px-4 py-3 rounded-xl border border-yellow-400/40 bg-black/60 text-white placeholder-yellow-300 focus:ring-2 focus:ring-yellow-500 outline-none shadow-inner transition" type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} />
            <MultiSelect label="Camera Types" options={cameraOptions} values={cameraType} setValues={setCameraType} />
            <MultiSelect label="Skills" options={skillsOptions} values={skills} setValues={setSkills} />
            <input required className="px-4 py-3 rounded-xl border border-yellow-400/40 bg-black/60 text-white placeholder-yellow-300 focus:ring-2 focus:ring-yellow-500 outline-none shadow-inner transition" type="text" placeholder="City, State, Country" value={location} onChange={(e)=>setLocation(e.target.value)} />
            <input required className="px-4 py-3 rounded-xl border border-yellow-400/40 bg-black/60 text-white placeholder-yellow-300 focus:ring-2 focus:ring-yellow-500 outline-none shadow-inner transition" type="url" placeholder="Instagram Profile URL" value={instagram} onChange={(e)=>setInstagram(e.target.value)} />
            <input className="px-4 py-3 rounded-xl border border-yellow-400/40 bg-black/60 text-white placeholder-yellow-300 focus:ring-2 focus:ring-yellow-500 outline-none shadow-inner transition" type="url" placeholder="VSCO Profile URL (Optional)" value={vsco} onChange={(e)=>setVsco(e.target.value)} />
            <input className="px-4 py-3 rounded-xl border border-yellow-400/40 bg-black/60 text-white placeholder-yellow-300 focus:ring-2 focus:ring-yellow-500 outline-none shadow-inner transition" type="url" placeholder="Portfolio Website (Optional)" value={portfolio} onChange={(e)=>setPortfolio(e.target.value)} />
            <button className="bg-yellow-500 text-black py-3 rounded-full font-extrabold text-lg hover:bg-yellow-600 transition shadow-[0_10px_25px_rgba(255,200,0,0.4)]">Register</button>
            <p className="text-yellow-300 text-center mt-2">Already have an account? <Link to="/captain-login" className="text-yellow-400 underline hover:text-yellow-200">Login Here</Link></p>
          </form>
        </div>
      </section>

      <footer className="bg-black text-yellow-400 py-6 text-center">&copy; 2025 SnapHire. All rights reserved.</footer>
      <div className="sr-only">Reference: {uploadedScreenshot}</div>

      {/* Extra styles for animations - add to your global CSS (index.css) or Tailwind config */}
      <style>{`
        @keyframes float { 0%{ transform: translateY(0px);}50%{transform: translateY(-12px);}100%{transform: translateY(0px);} }
        @keyframes float-reverse { 0%{ transform: translateY(0px);}50%{transform: translateY(10px);}100%{transform: translateY(0px);} }
        @keyframes hero-gradient { 0%{ background: linear-gradient(90deg, rgba(255,196,0,0.06), rgba(255,196,0,0.02)); }50%{ background: linear-gradient(90deg, rgba(255,196,0,0.02), rgba(255,196,0,0.06)); }100%{ background: linear-gradient(90deg, rgba(255,196,0,0.06), rgba(255,196,0,0.02)); } }
        .animate-float{ animation: float 6s ease-in-out infinite; }
        .animate-float-reverse{ animation: float-reverse 7s ease-in-out infinite; }
        .animate-hero-gradient{ animation: hero-gradient 8s linear infinite; opacity:0.6 }
        .animate-pulse-slow{ animation: pulse 2.5s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default CaptainSignup;
