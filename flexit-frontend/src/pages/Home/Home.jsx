import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
          
          body {
            font-family: 'Inter', sans-serif;
            background-color: #f8fafc; /* slate-50 */
          }

          .glass-nav {
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border-bottom: 1px solid rgba(226, 232, 240, 0.8);
          }
          
          .glass-nav-scrolled {
            background: rgba(255, 255, 255, 0.95);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          }

          .mesh-bg {
            background-color: #ffffff;
            background-image: radial-gradient(at 40% 20%, hsla(228,100%,74%,0.15) 0px, transparent 50%),
                              radial-gradient(at 80% 0%, hsla(189,100%,56%,0.15) 0px, transparent 50%),
                              radial-gradient(at 0% 50%, hsla(355,100%,93%,0.1) 0px, transparent 50%);
          }

          .card-hover {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .card-hover:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px -10px rgba(0,0,0,0.08);
          }
        `}
      </style>

      <div className="min-h-screen text-slate-800 font-['Inter',sans-serif] selection:bg-blue-200 selection:text-blue-900 flex flex-col">
        
        {/* Navigation */}
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 glass-nav ${scrolled ? 'glass-nav-scrolled py-3' : 'py-5'}`}>
          <div className="max-w-7xl mx-auto px-6 md:px-8 xl:px-0 flex justify-between items-center">
            {/* Brand */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-slate-900">FlexIt</span>
            </div>

            {/* Links */}
            <div className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Home</Link>
              <a href="#about-us" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">About Us</a>
              <a href="#services" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Services</a>
            </div>

            {/* Action */}
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/login')} className="hidden md:block text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors px-2">
                Log in
              </button>
              <button onClick={() => navigate('/login')} className="bg-slate-900 hover:bg-blue-600 text-white text-sm font-semibold py-2.5 px-6 rounded-full transition-all duration-300 shadow-md hover:shadow-blue-500/25 transform hover:-translate-y-0.5">
                Book Now
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-grow pt-28">
          {/* Hero Section */}
          <section className="relative pt-16 pb-24 md:pt-28 md:pb-32 overflow-hidden mesh-bg">
            <div className="max-w-7xl mx-auto px-6 md:px-8 xl:px-0 relative z-10 text-center flex flex-col items-center">
              
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-semibold mb-8 animate-fade-in-up">
                <span className="flex h-2 w-2 rounded-full bg-blue-600"></span>
                Smart Campus Hub 2.0
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-8 max-w-4xl mx-auto">
                Manage Campus Resources <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 pb-1">Intelligently</span>
              </h1>
              
              <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto mb-10">
                A unified platform for students and staff to seamlessly book lecture halls, labs, and equipment. Quickly report and track maintenance issues with our real-time ticketing system.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <button onClick={() => navigate('/login')} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold py-3.5 px-8 rounded-full transition-all duration-300 shadow-lg shadow-blue-500/30 transform hover:-translate-y-0.5 flex items-center justify-center gap-2">
                  Get Started
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </button>
                <button onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })} className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-base font-semibold py-3.5 px-8 rounded-full transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center">
                  Explore Services
                </button>
              </div>

            </div>
          </section>

          {/* Stats Showcase */}
          <section className="bg-white border-y border-slate-100 py-10 relative z-20 -mt-8 shadow-[0_-10px_40px_rgba(0,0,0,0.02)] hidden md:block">
             <div className="max-w-7xl mx-auto px-6 md:px-8 xl:px-0 flex flex-wrap justify-center md:justify-between items-center gap-8 md:gap-12">
                <div className="flex flex-col text-center md:text-left">
                  <span className="text-3xl font-extrabold text-slate-900">100+</span>
                  <span className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-wider">Resources</span>
                </div>
                <div className="flex flex-col text-center md:text-left">
                  <span className="text-3xl font-extrabold text-slate-900">24/7</span>
                  <span className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-wider">Availability</span>
                </div>
                <div className="flex flex-col text-center md:text-left">
                  <span className="text-3xl font-extrabold text-slate-900">&lt;2h</span>
                  <span className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-wider">Avg Resolution</span>
                </div>
                <div className="flex flex-col text-center md:text-left">
                  <span className="text-3xl font-extrabold text-slate-900">10k+</span>
                  <span className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-wider">Active Users</span>
                </div>
             </div>
          </section>

          {/* About Section */}
          <section id="about-us" className="py-24 bg-slate-50">
            <div className="max-w-7xl mx-auto px-6 md:px-8 xl:px-0">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-blue-600 font-semibold tracking-wider text-sm uppercase mb-3">About Us</h2>
                <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6 tracking-tight">Streamlining Campus Operations</h3>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Flexit is purposefully engineered for universities where hundreds of resources are concurrently shared. We eliminate scheduling conflicts, automate approvals, and provide a transparent medium to report facility issues.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <article className="bg-white rounded-2xl p-8 border border-slate-100 card-hover relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <svg className="w-24 h-24 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-3">Our Mission</h4>
                  <p className="text-slate-600 leading-relaxed relative z-10">
                    To deliver a transparent, intuitive, and highly dependable resource management ecosystem for every faculty and student.
                  </p>
                </article>

                <article className="bg-white rounded-2xl p-8 border border-slate-100 card-hover relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                     <svg className="w-24 h-24 text-indigo-600" fill="currentColor" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  </div>
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-3">Our Vision</h4>
                  <p className="text-slate-600 leading-relaxed relative z-10">
                    To cultivate a smart campus environment where operations, approvals, and physical requests move with zero friction.
                  </p>
                </article>

                <article className="bg-white rounded-2xl p-8 border border-slate-100 card-hover relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                     <svg className="w-24 h-24 text-emerald-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  </div>
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-3">Core Values</h4>
                  <p className="text-slate-600 leading-relaxed relative z-10">
                    Absolute speed, uncompromised clarity, and total accountability embedded deeply into all facility protocols.
                  </p>
                </article>
              </div>
            </div>
          </section>

          {/* Services Section */}
          <section id="services" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-6 md:px-8 xl:px-0">
              
              <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                <div className="max-w-2xl">
                  <h2 className="text-blue-600 font-semibold tracking-wider text-sm uppercase mb-3">Capabilities</h2>
                  <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Everything you need in one hub.</h3>
                </div>
                <button onClick={() => navigate('/login')} className="hidden md:flex text-blue-600 font-semibold hover:text-blue-700 items-center gap-2 transition-colors">
                  Access Portal <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="group rounded-3xl bg-slate-50 border border-slate-100 p-8 md:p-12 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:bg-white">
                  <div className="h-14 w-14 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center mb-8">
                    <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                  <h4 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors">Resource Booking</h4>
                  <p className="text-slate-600 leading-relaxed text-lg mb-8">
                    Easily search, check availability, and reserve campus labs, lecture halls, and premium meeting spaces with an intuitive and organized booking workflow.
                  </p>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center text-slate-600"><svg className="w-5 h-5 text-emerald-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg> Real-time availability</li>
                    <li className="flex items-center text-slate-600"><svg className="w-5 h-5 text-emerald-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg> Automated conflict resolution</li>
                    <li className="flex items-center text-slate-600"><svg className="w-5 h-5 text-emerald-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg> Instant approvals</li>
                  </ul>
                  <button onClick={() => navigate('/login')} className="text-slate-900 font-semibold flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                    Book a space <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </button>
                </div>

                <div className="group rounded-3xl bg-slate-50 border border-slate-100 p-8 md:p-12 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:bg-white">
                  <div className="h-14 w-14 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center mb-8">
                     <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                  </div>
                  <h4 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors">Issue Reporting</h4>
                  <p className="text-slate-600 leading-relaxed text-lg mb-8">
                    Encountered damaged equipment or technical anomalies? Report instances quickly and track resolution progress natively from your dashboard.
                  </p>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center text-slate-600"><svg className="w-5 h-5 text-emerald-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg> Priority queuing</li>
                    <li className="flex items-center text-slate-600"><svg className="w-5 h-5 text-emerald-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg> Progress tracking</li>
                    <li className="flex items-center text-slate-600"><svg className="w-5 h-5 text-emerald-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg> Direct technician feedback</li>
                  </ul>
                  <button onClick={() => navigate('/login')} className="text-slate-900 font-semibold flex items-center gap-2 group-hover:text-indigo-600 transition-colors">
                    Raise a ticket <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Premium Footer */}
        <footer className="bg-slate-900 text-slate-300 py-16 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-6 md:px-8 xl:px-0 flex flex-col md:flex-row justify-between items-center gap-8">
            
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                <span className="text-2xl font-bold tracking-tight text-white">FlexIt</span>
              </div>
              <p className="max-w-sm text-slate-400 text-sm leading-relaxed">
                Empowering modern universities with intelligent resource allocation and seamless maintenance routing.
              </p>
            </div>

            <div className="flex flex-col items-center flex-grow text-center">
              <div className="flex gap-6 mb-6">
                <a href="#about-us" className="text-sm font-medium hover:text-white transition-colors">About Us</a>
                <a href="#services" className="text-sm font-medium hover:text-white transition-colors">Platform</a>
                <a href="#contact" className="text-sm font-medium hover:text-white transition-colors">Support</a>
              </div>
            </div>

            <div className="flex flex-col items-center md:items-end w-full md:w-auto mt-8 md:mt-0 pt-8 md:pt-0 border-t border-slate-800 md:border-none text-center md:text-right">
              <div className="mt-4 text-sm text-slate-500">
                &copy; {new Date().getFullYear()} FlexIt Solutions. All rights reserved.
              </div>
            </div>
            
          </div>
        </footer>
      </div>
    </>
  );
}

export default Home;