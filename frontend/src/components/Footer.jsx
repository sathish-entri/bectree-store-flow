// Exact Figma MegaMart Storefront Footer matching Image 3

function IconWhatsApp() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      {/* Decorative semi-circular ripple lines in background */}
      <div className="footer-circle-rings" aria-hidden="true" />

      <div className="footer__main">
        {/* Column 1: MegaMart Branding, Contact & Download App */}
        <div className="footer__col-brand">
          <h2 className="footer__brand-title">MegaMart</h2>

          <h3 className="footer__subheading">Contact Us</h3>
          <div className="footer__contact-item">
            <IconWhatsApp />
            <div>
              <span className="footer__contact-label">Whats App</span>
              <span className="footer__contact-val">+1 202-918-2132</span>
            </div>
          </div>
          <div className="footer__contact-item">
            <IconPhone />
            <div>
              <span className="footer__contact-label">Call Us</span>
              <span className="footer__contact-val">+1 202-918-2132</span>
            </div>
          </div>

          <h3 className="footer__subheading" style={{ marginTop: '20px' }}>Download App</h3>
          <div className="footer__app-badges">
            {/* App Store badge */}
            <div className="app-badge">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#FFFFFF">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.62-.75 1.04-1.8 0.92-2.84-.9.04-2 .6-2.65 1.34-.56.63-1.05 1.69-.92 2.7.99.08 2.02-.45 2.65-1.2z"/>
              </svg>
              <div>
                <span className="app-badge__sub">Download on the</span>
                <span className="app-badge__main">App Store</span>
              </div>
            </div>

            {/* Google Play badge */}
            <div className="app-badge">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#FFFFFF">
                <path d="M3.6 2.26L13.8 12.46L3.6 22.66C3.24 22.25 3 21.68 3 21V3.92C3 3.24 3.24 2.67 3.6 2.26M15.21 13.88L17.75 16.42L5.27 23.59C4.66 23.94 4.05 23.86 3.64 23.63L15.21 13.88M19.78 14.39L15.92 12.16L15.21 11.45L19.78 6.88C20.19 7.12 20.47 7.55 20.47 8.16V13.11C20.47 13.72 20.19 14.15 19.78 14.39M3.64 1.29C4.05 1.06 4.66 0.98 5.27 1.33L17.75 8.5L15.21 11.04L3.64 1.29Z"/>
              </svg>
              <div>
                <span className="app-badge__sub">GET IT ON</span>
                <span className="app-badge__main">Google Play</span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Most Popular Categories */}
        <div className="footer__col">
          <h3 className="footer__col-heading">Most Popular Categories</h3>
          <ul className="footer__link-list">
            <li><span className="footer__link">Staples</span></li>
            <li><span className="footer__link">Beverages</span></li>
            <li><span className="footer__link">Personal Care</span></li>
            <li><span className="footer__link">Home Care</span></li>
            <li><span className="footer__link">Baby Care</span></li>
            <li><span className="footer__link">Vegetables & Fruits</span></li>
            <li><span className="footer__link">Snacks & Foods</span></li>
            <li><span className="footer__link">Dairy & Bakery</span></li>
          </ul>
        </div>

        {/* Column 3: Customer Services */}
        <div className="footer__col">
          <h3 className="footer__col-heading">Customer Services</h3>
          <ul className="footer__link-list">
            <li><span className="footer__link">About Us</span></li>
            <li><span className="footer__link">Terms & Conditions</span></li>
            <li><span className="footer__link">FAQ</span></li>
            <li><span className="footer__link">Privacy Policy</span></li>
            <li><span className="footer__link">E-waste Policy</span></li>
            <li><span className="footer__link">Cancellation & Return Policy</span></li>
          </ul>
        </div>
      </div>

      {/* Bottom Copyright Bar matching Image 3 */}
      <div className="footer__bottom">
        <p>© 2022 All rights reserved. Reliance Retail Ltd.</p>
      </div>
    </footer>
  );
}
