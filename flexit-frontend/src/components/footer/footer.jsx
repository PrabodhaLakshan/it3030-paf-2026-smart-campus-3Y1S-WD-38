import { Link } from 'react-router-dom';
import './footer.css';

function Footer() {
	const year = new Date().getFullYear();

	return (
		<footer className="site-footer">
			<div className="footer-orb footer-orb-left" aria-hidden="true"></div>
			<div className="footer-orb footer-orb-right" aria-hidden="true"></div>

			<div className="footer-inner">
				<div className="footer-brand">
					<img
						src="/images/flexit_logo_Darkbg1.png"
						alt="Flexit Logo"
						className="footer-logo"
					/>
					<h3>Flexit Nexus</h3>
					<p className="brand-tag">Manage. Book. Track.</p>
					<p className="brand-copy">
						Flexit helps teams manage resources, bookings, and updates in one clean and
						connected digital experience.
					</p>
				</div>

				<div className="footer-links">
					<h4>Quick Links</h4>
					<Link to="/">Home</Link>
					<a href="#">About Us</a>
					<a href="#">Services</a>
					<a href="#">Contact Us</a>
				</div>

				<div className="footer-links">
					<h4>Platform</h4>
					<Link to="/resources">Resources</Link>
					<a href="#">Bookings</a>
					<a href="#">Tickets</a>
					<a href="#">Updates</a>
				</div>

				<div className="footer-contact">
					<h4>Contact</h4>
					<a href="mailto:support@flexit.com">info@flexit.com</a>
					<a href="tel:+94112345678">+94 77 87 26 607</a>
					<span>SLIIT, New Kandy Road, Malabe, Sri Lanka</span>
					<span>Mon - Fri: 8.30 AM - 6.00 PM</span>

					<div className="footer-social" aria-label="Social links">
						<a href="#" className="social-btn" aria-label="LinkedIn">
							<svg viewBox="0 0 24 24" className="social-icon" aria-hidden="true">
								<path d="M6.94 8.5H3.56V20h3.38V8.5Zm-1.69-5A1.97 1.97 0 0 0 3.28 5.5c0 1.08.86 1.94 1.95 1.94h.02a1.95 1.95 0 1 0 0-3.9ZM20.72 13.4c0-3.06-1.63-4.48-3.8-4.48a3.3 3.3 0 0 0-3 1.65V8.5h-3.24c.04.69 0 11.5 0 11.5h3.24v-6.42c0-.34.02-.68.13-.92.27-.68.9-1.38 1.96-1.38 1.39 0 1.95 1.04 1.95 2.57V20H21V13.4h-.28Z" />
							</svg>
						</a>
						<a href="#" className="social-btn" aria-label="Facebook">
							<svg viewBox="0 0 24 24" className="social-icon" aria-hidden="true">
								<path d="M13.5 21v-7.3h2.5l.38-3H13.5V8.77c0-.87.28-1.47 1.54-1.47h1.65V4.63A20.7 20.7 0 0 0 14.27 4c-2.4 0-4.04 1.42-4.04 4.05v2.65H7.5v3h2.73V21h3.27Z" />
							</svg>
						</a>
						<a href="#" className="social-btn" aria-label="GitHub">
							<svg viewBox="0 0 24 24" className="social-icon" aria-hidden="true">
								<path d="M12 .5A12 12 0 0 0 8.2 23.9c.6.11.82-.25.82-.57v-2.02c-3.35.71-4.06-1.41-4.06-1.41-.55-1.36-1.35-1.73-1.35-1.73-1.1-.73.08-.72.08-.72 1.22.08 1.85 1.23 1.85 1.23 1.08 1.83 2.84 1.3 3.53.99.11-.77.42-1.3.76-1.6-2.67-.3-5.47-1.31-5.47-5.85 0-1.29.47-2.35 1.23-3.18-.12-.3-.53-1.53.12-3.19 0 0 1-.31 3.3 1.21a11.6 11.6 0 0 1 6 0c2.28-1.52 3.28-1.21 3.28-1.21.66 1.66.25 2.89.13 3.19.77.83 1.23 1.89 1.23 3.18 0 4.55-2.81 5.54-5.49 5.84.43.36.82 1.08.82 2.19v3.24c0 .32.21.69.83.57A12 12 0 0 0 12 .5Z" />
							</svg>
						</a>
					</div>
				</div>
			</div>

			<div className="footer-bottom">
				<p>© {year} Flexit. All rights reserved.</p>
				<div className="footer-bottom-links">
					<a href="#">Privacy</a>
					<a href="#">Terms</a>
					<a href="#">Security</a>
				</div>
			</div>
		</footer>
	);
}

export default Footer;
