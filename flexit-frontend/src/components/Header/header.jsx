import { useNavigate } from 'react-router-dom';
import './header.css';

function Header() {
	const navigate = useNavigate();

	return (
		<header className="home-header">
			<div className="home-header__brand">
				<img
					src="/images/flexit_logo_Darkbg1.png"
					alt="Flexit logo"
					className="home-header__logo"
				/>
				<div className="home-header__title">Flexit</div>
			</div>

			<nav className="home-header__nav" aria-label="Main navigation">
				<a href="#about-us">About Us</a>
				<a href="#services">Services</a>
				<a href="#contact-us">Contact Us</a>
			</nav>

			<button className="home-header__login" onClick={() => navigate('/login')}>
				Login
			</button>
		</header>
	);
}

export default Header;
