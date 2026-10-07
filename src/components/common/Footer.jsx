import { Link } from 'react-router-dom'
import FitKartLogo from './FitKartLogo.jsx'
import './Footer.css'

const Footer = () => {
  return (
    <footer className="storefront-footer">
      <div className="storefront-footer__inner">
        <div className="storefront-footer__brand">
          <Link
            to="/"
            className="storefront-footer__logo"
            aria-label="FITKART home"
          >
            <FitKartLogo />
          </Link>

          <p>
            Shop fitness equipment for your training needs.
          </p>
        </div>

        <div className="storefront-footer__column">
          <h3>Quick Links</h3>

          <Link to="/">Home</Link>
          <Link to="/products">Products</Link>
          <Link to="/cart">Cart</Link>
        </div>

        <div className="storefront-footer__column">
          <h3>Account</h3>

          <Link to="/profile">Profile</Link>
          <Link to="/orders">My Orders</Link>
          <Link to="/login">Login</Link>
        </div>

        <div className="storefront-footer__column">
          <h3>About Our Website</h3>

          <p>
            FITKART is an online fitness equipment store
            designed to make browsing and purchasing
            training equipment simple.
          </p>
        </div>
      </div>

      <div className="storefront-footer__bottom">
        <div className="storefront-footer__bottom-inner">
          <span>
            © {new Date().getFullYear()} FITKART. All rights reserved.
          </span>

          <span>
            Built for better training.
          </span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
