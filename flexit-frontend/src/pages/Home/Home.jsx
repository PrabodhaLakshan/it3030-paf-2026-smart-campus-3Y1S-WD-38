import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

          *, *::before, *::after { box-sizing: border-box; }

          body {
            font-family: 'Inter', sans-serif;
            background-color: #f8fafc;
            margin: 0;
          }

          /* ── Navbar ── */
          .uni-nav {
            background: rgba(255, 255, 255, 0.96);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border-bottom: 1px solid #e8edf3;
            transition: box-shadow 0.3s ease, padding 0.3s ease;
          }
          .uni-nav.scrolled {
            box-shadow: 0 2px 24px rgba(15, 23, 42, 0.07);
          }

          /* ── Nav links ── */
          .nav-link {
            position: relative;
            font-size: 0.875rem;
            font-weight: 500;
            color: #475569;
            text-decoration: none;
            padding-bottom: 2px;
            transition: color 0.2s;
          }
          .nav-link::after {
            content: '';
            position: absolute;
            left: 0; bottom: -2px;
            width: 0; height: 2px;
            background: #1d4ed8;
            border-radius: 2px;
            transition: width 0.25s ease;
          }
          .nav-link:hover { color: #1d4ed8; }
          .nav-link:hover::after { width: 100%; }

          /* ── Hero ── */
          .hero-section {
            background-image: url('/images/Home_page_bg.jpeg');
            background-size: cover;
            background-position: center center;
            background-repeat: no-repeat;
            position: relative;
          }
          .hero-overlay {
            position: absolute;
            inset: 0;
            /* White-leaning transparent gradient — text stays dark & readable, image visible right */
            background: linear-gradient(
              100deg,
              rgba(255,255,255,0.92) 0%,
              rgba(255,255,255,0.82) 32%,
              rgba(255,255,255,0.50) 56%,
              rgba(255,255,255,0.10) 100%
            );
          }

          /* ── Stat pill ── */
          .stat-pill {
            display: flex;
            align-items: center;
            gap: 12px;
            background: rgba(255,255,255,0.85);
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 14px 22px;
            backdrop-filter: blur(6px);
          }

          /* ── Feature card ── */
          .feature-card {
            background: #fff;
            border: 1px solid #e8edf3;
            border-radius: 20px;
            padding: 36px 32px;
            transition: box-shadow 0.3s ease, transform 0.3s ease, border-color 0.3s ease;
          }
          .feature-card:hover {
            box-shadow: 0 16px 40px rgba(29, 78, 216, 0.08);
            transform: translateY(-4px);
            border-color: #bfdbfe;
          }

          .icon-wrap {
            width: 52px; height: 52px;
            border-radius: 14px;
            display: flex; align-items: center; justify-content: center;
            margin-bottom: 20px;
          }

          /* ── Buttons ── */
          .btn-primary {
            display: inline-flex; align-items: center; gap: 8px;
            background: #1d4ed8;
            color: #fff;
            font-weight: 600; font-size: 0.9rem;
            padding: 13px 28px;
            border-radius: 10px;
            border: none; cursor: pointer;
            transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
            box-shadow: 0 4px 16px rgba(29, 78, 216, 0.28);
            text-decoration: none;
          }
          .btn-primary:hover {
            background: #1e40af;
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(29, 78, 216, 0.32);
          }

          .btn-outline {
            display: inline-flex; align-items: center; gap: 8px;
            background: #fff;
            color: #1e293b;
            font-weight: 600; font-size: 0.9rem;
            padding: 12px 28px;
            border-radius: 10px;
            border: 1.5px solid #cbd5e1;
            cursor: pointer;
            transition: border-color 0.2s, color 0.2s, transform 0.2s;
            text-decoration: none;
          }
          .btn-outline:hover {
            border-color: #1d4ed8;
            color: #1d4ed8;
            transform: translateY(-2px);
          }

          .btn-nav-book {
            display: inline-flex; align-items: center; gap: 6px;
            background: #1d4ed8;
            color: #fff;
            font-weight: 600; font-size: 0.825rem;
            padding: 9px 22px;
            border-radius: 8px;
            border: none; cursor: pointer;
            transition: background 0.2s, transform 0.15s;
            letter-spacing: 0.01em;
          }
          .btn-nav-book:hover {
            background: #1e40af;
            transform: translateY(-1px);
          }

          /* ── Section label ── */
          .section-label {
            display: inline-block;
            font-size: 0.75rem;
            font-weight: 700;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: #1d4ed8;
            background: #ebf2ff;
            border-radius: 6px;
            padding: 4px 12px;
            margin-bottom: 14px;
          }

          /* ── divider ── */
          .section-divider {
            border: none;
            border-top: 1px solid #e8edf3;
            margin: 0;
          }

          /* ── ul check list ── */
          .check-list { list-style: none; padding: 0; margin: 0; }
          .check-list li {
            display: flex; align-items: center; gap: 10px;
            font-size: 0.875rem; color: #475569;
            padding: 5px 0;
          }
          .check-list li svg { flex-shrink: 0; }
        `}
      </style>

      <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>

        {/* ══════════════════════════════════ NAVBAR ══════════════════════════════════ */}
        <nav className={`uni-nav fixed top-0 left-0 right-0 z-50 ${scrolled ? 'scrolled' : ''}`}
             style={{ padding: scrolled ? '10px 0' : '14px 0' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

            {/* Logo */}
            <div style={{ cursor: 'pointer', flexShrink: 0 }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <img
                src="/images/flexit_logo_lightbg1.png"
                alt="FlexIt Logo"
                style={{ height: 36, width: 'auto', objectFit: 'contain', display: 'block' }}
              />
            </div>

            {/* Centre nav links */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="hidden md:flex">
              <Link to="/" className="nav-link">Home</Link>
              <a href="#about-us" className="nav-link">About Us</a>
              <a href="#services" className="nav-link">Services</a>
            </div>

            {/* Right actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <button
                onClick={() => navigate('/login')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, color: '#475569', transition: 'color 0.2s' }}
                className="hidden md:block nav-link"
              >
                Log in
              </button>
              <button onClick={() => navigate('/login')} className="btn-nav-book">
                Book Now
              </button>
            </div>

          </div>
        </nav>

        {/* ══════════════════════════════════ HERO ══════════════════════════════════ */}
        <main style={{ flexGrow: 1, paddingTop: 64 }}>
          <section className="hero-section" style={{ minHeight: '85vh', display: 'flex', alignItems: 'center' }}>
            <div className="hero-overlay" />

            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 32px', position: 'relative', zIndex: 10, width: '100%' }}>
              <div style={{ maxWidth: 620 }}>

                {/* Badge */}
                <span className="section-label">Campus Resource Platform</span>

                <h1 style={{
                  fontSize: 'clamp(2.6rem, 5vw, 4rem)',
                  fontWeight: 900,
                  lineHeight: 1.09,
                  color: '#0f172a',
                  letterSpacing: '-0.02em',
                  marginBottom: 22,
                  marginTop: 4,
                }}>
                  Manage Campus<br />
                  Resources{' '}
                  <span style={{ color: '#1d4ed8' }}>Intelligently</span>
                </h1>

                <p style={{
                  fontSize: '1.075rem',
                  lineHeight: 1.75,
                  color: '#475569',
                  maxWidth: 520,
                  marginBottom: 36,
                  fontWeight: 400,
                }}>
                  A unified platform for students and staff to seamlessly book lecture
                  halls, labs, and equipment — and report facility issues in real time.
                </p>

                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                  <button className="btn-primary" onClick={() => navigate('/login')}>
                    Get Started
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </button>
                  <button className="btn-outline" onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}>
                    Explore Services
                  </button>
                </div>

                {/* Quick stats under hero CTA */}
                <div style={{ display: 'flex', gap: 16, marginTop: 48, flexWrap: 'wrap' }}>
                  {[
                    { value: '100+', label: 'Resources' },
                    { value: '24/7', label: 'Availability' },
                    { value: '10k+', label: 'Active Users' },
                  ].map(s => (
                    <div key={s.label} className="stat-pill">
                      <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{s.value}</span>
                      <span style={{ fontSize: '0.78rem', fontWeight: 500, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{s.label}</span>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </section>

          <hr className="section-divider" />

          {/* ══════════════════════════════════ ABOUT ══════════════════════════════════ */}
          <section id="about-us" style={{ background: '#f8fafc', padding: '88px 32px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>

              <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 56px' }}>
                <span className="section-label">About Us</span>
                <h2 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: '0 0 16px' }}>
                  Streamlining Campus Operations
                </h2>
                <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.8 }}>
                  Flexit is engineered for universities where hundreds of shared resources require seamless coordination.
                  We eliminate scheduling conflicts, automate approvals, and provide a transparent platform for facility requests.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
                {[
                  {
                    color: '#1d4ed8', bg: '#eef4ff',
                    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />,
                    title: 'Our Mission',
                    desc: 'Deliver a transparent, intuitive, and dependable resource management ecosystem for every faculty and student.',
                  },
                  {
                    color: '#7c3aed', bg: '#f5f0ff',
                    icon: <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>,
                    title: 'Our Vision',
                    desc: 'Cultivate a smart campus where operations, approvals, and physical requests move with zero friction.',
                  },
                  {
                    color: '#059669', bg: '#ecfdf5',
                    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
                    title: 'Core Values',
                    desc: 'Absolute speed, uncompromised clarity, and total accountability embedded into all facility protocols.',
                  },
                ].map(card => (
                  <div key={card.title} className="feature-card">
                    <div className="icon-wrap" style={{ background: card.bg }}>
                      <svg width="24" height="24" fill="none" stroke={card.color} viewBox="0 0 24 24">{card.icon}</svg>
                    </div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>{card.title}</h3>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.75, margin: 0 }}>{card.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <hr className="section-divider" />

          {/* ══════════════════════════════════ SERVICES ══════════════════════════════════ */}
          <section id="services" style={{ background: '#fff', padding: '88px 32px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 52, flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <span className="section-label">Capabilities</span>
                  <h2 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: '0' }}>
                    Everything you need in one hub.
                  </h2>
                </div>
                <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, color: '#1d4ed8', display: 'flex', alignItems: 'center', gap: 6 }} className="hidden md:flex">
                  Access Portal
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>

                {/* Resource Booking */}
                <div className="feature-card" style={{ borderTop: '4px solid #1d4ed8' }}>
                  <div className="icon-wrap" style={{ background: '#eef4ff' }}>
                    <svg width="24" height="24" fill="none" stroke="#1d4ed8" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>Resource Booking</h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.75, marginBottom: 22 }}>
                    Search, check availability, and reserve campus labs, lecture halls, and meeting spaces with an intuitive booking workflow.
                  </p>
                  <ul className="check-list" style={{ marginBottom: 24 }}>
                    {['Real-time availability', 'Automated conflict resolution', 'Instant approvals'].map(item => (
                      <li key={item}>
                        <svg width="16" height="16" fill="none" stroke="#059669" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', color: '#1d4ed8', display: 'flex', alignItems: 'center', gap: 6, padding: 0 }}>
                    Book a space
                    <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </button>
                </div>

                {/* Issue Reporting */}
                <div className="feature-card" style={{ borderTop: '4px solid #7c3aed' }}>
                  <div className="icon-wrap" style={{ background: '#f5f0ff' }}>
                    <svg width="24" height="24" fill="none" stroke="#7c3aed" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>Issue Reporting</h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.75, marginBottom: 22 }}>
                    Encountered damaged equipment or technical issues? Report quickly and track resolution progress from your dashboard.
                  </p>
                  <ul className="check-list" style={{ marginBottom: 24 }}>
                    {['Priority queuing', 'Progress tracking', 'Direct technician feedback'].map(item => (
                      <li key={item}>
                        <svg width="16" height="16" fill="none" stroke="#059669" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', color: '#7c3aed', display: 'flex', alignItems: 'center', gap: 6, padding: 0 }}>
                    Raise a ticket
                    <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </button>
                </div>

              </div>
            </div>
          </section>

        </main>

        {/* ══════════════════════════════════ FOOTER ══════════════════════════════════ */}
        <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '56px 32px 32px', borderTop: '1px solid #1e293b' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 32, marginBottom: 40 }}>

              <div>
                <img src="/images/flexit_logo_Darkbg1.png" alt="FlexIt" style={{ height: 34, width: 'auto', objectFit: 'contain', marginBottom: 14, display: 'block' }} />
                <p style={{ maxWidth: 300, fontSize: '0.85rem', lineHeight: 1.75, color: '#64748b', margin: 0 }}>
                  Empowering modern universities with intelligent resource allocation and seamless maintenance routing.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
                <div>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#475569', marginBottom: 14 }}>Platform</p>
                  {['About Us', 'Services', 'Book a Resource'].map(link => (
                    <a key={link} href="#" style={{ display: 'block', fontSize: '0.875rem', color: '#64748b', textDecoration: 'none', marginBottom: 8, transition: 'color 0.2s' }}
                       onMouseEnter={e => e.target.style.color='#e2e8f0'}
                       onMouseLeave={e => e.target.style.color='#64748b'}>
                      {link}
                    </a>
                  ))}
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#475569', marginBottom: 14 }}>Support</p>
                  {['Help Center', 'Report an Issue', 'Contact Us'].map(link => (
                    <a key={link} href="#" style={{ display: 'block', fontSize: '0.875rem', color: '#64748b', textDecoration: 'none', marginBottom: 8, transition: 'color 0.2s' }}
                       onMouseEnter={e => e.target.style.color='#e2e8f0'}
                       onMouseLeave={e => e.target.style.color='#64748b'}>
                      {link}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #1e293b', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <p style={{ fontSize: '0.8rem', color: '#475569', margin: 0 }}>
                © {new Date().getFullYear()} FlexIt Solutions. All rights reserved.
              </p>
              <div style={{ display: 'flex', gap: 20 }}>
                {['Privacy Policy', 'Terms of Service'].map(t => (
                  <a key={t} href="#" style={{ fontSize: '0.8rem', color: '#475569', textDecoration: 'none' }}>{t}</a>
                ))}
              </div>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}

export default Home;