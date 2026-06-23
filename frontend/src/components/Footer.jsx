import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ArrowUpRight } from 'lucide-react';

const LogoMark = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
    <div style={{
      width: '30px', height: '30px', background: 'rgba(255,255,255,0.15)',
      borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
      border: '1px solid rgba(255,255,255,0.2)',
    }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M12 2C8.5 2 5 5 5 9C5 13 8 15.5 12 22C16 15.5 19 13 19 9C19 5 15.5 2 12 2Z" fill="white" opacity="0.9"/>
      </svg>
    </div>
    <span style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', fontWeight: 600, color: 'white' }}>
      Tatvalife
    </span>
  </div>
);

const ColTitle = ({ children }) => (
  <h4 style={{
    color: 'rgba(255,255,255,0.45)',
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: '16px',
  }}>
    {children}
  </h4>
);

const FootLink = ({ to, href, children }) => {
  const style = {
    color: 'rgba(255,255,255,0.65)', textDecoration: 'none',
    fontSize: '13.5px', display: 'inline-flex', alignItems: 'center', gap: '4px',
    transition: 'color 0.18s', padding: '2px 0',
  };
  const hover = { color: 'white' };
  if (href) return (
    <a href={href} style={style}
      onMouseEnter={e => e.currentTarget.style.color = 'white'}
      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.65)'}
    >{children}</a>
  );
  return (
    <Link to={to} style={style}
      onMouseEnter={e => e.currentTarget.style.color = 'white'}
      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.65)'}
    >{children}</Link>
  );
};

const Footer = () => (
  <footer style={{
    background: 'var(--green-950)',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    padding: '72px 0 36px',
  }}>
    <div className="container">
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.6fr 1fr 1fr 1fr',
        gap: '48px',
        marginBottom: '56px',
      }}
      className="footer-grid"
      >
        {/* Brand */}
        <div>
          <LogoMark />
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13.5px', lineHeight: 1.7, marginBottom: '24px', maxWidth: '280px' }}>
            Specialty care platform sourcing WHO-GMP certified lifestyle and wellness medications directly to patients under rigorous clinical supervision.
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            {['WHO-GMP', 'GDP Certified', 'ISO 9001'].map(tag => (
              <span key={tag} style={{
                fontSize: '10.5px', fontWeight: 600, letterSpacing: '0.04em',
                background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.65)',
                padding: '4px 10px', borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.12)',
              }}>{tag}</span>
            ))}
          </div>
        </div>

        {/* Treatments */}
        <div>
          <ColTitle>Treatments</ColTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <FootLink to="/shop?category=sexual-health">Sexual Health</FootLink>
            <FootLink to="/shop?category=hair-loss">Hair Loss</FootLink>
            <FootLink to="/shop?category=skin-care">Skin Care</FootLink>
            <FootLink to="/shop?category=muscle-growth">Muscle Growth</FootLink>
          </div>
        </div>

        {/* Resources */}
        <div>
          <ColTitle>Resources</ColTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <FootLink to="/dashboard">Patient Dashboard</FootLink>
            <FootLink href="#faqs">Frequently Asked</FootLink>
            <FootLink href="#">Crypto Payment Guide</FootLink>
            <FootLink href="#">Delivery Insurance</FootLink>
            <FootLink href="#">Supply Traceability</FootLink>
          </div>
        </div>

        {/* Contact */}
        <div>
          <ColTitle>Patient Support</ColTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <a href="mailto:care@tatvalife.com" style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              color: 'rgba(255,255,255,0.65)', textDecoration: 'none', fontSize: '13.5px',
            }}>
              <Mail size={14} color="rgba(255,255,255,0.4)" />
              care@tatvalife.com
            </a>
            <a href="tel:+18005556626" style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              color: 'rgba(255,255,255,0.65)', textDecoration: 'none', fontSize: '13.5px',
            }}>
              <Phone size={14} color="rgba(255,255,255,0.4)" />
              +1 (800) 555-LIFE
            </a>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: 'rgba(255,255,255,0.65)', fontSize: '13.5px' }}>
              <MapPin size={14} color="rgba(255,255,255,0.4)" style={{ marginTop: '2px', flexShrink: 0 }} />
              <span>Global Specialty Logistics Network</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.07)',
        paddingTop: '28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12.5px' }}>
          © {new Date().getFullYear()} Tatvalife Inc. All rights reserved.
        </p>
        <div style={{ display: 'flex', gap: '24px' }}>
          {['Terms of Service', 'Privacy Policy', 'Traceability Ledger'].map(t => (
            <a key={t} href="#" style={{
              color: 'rgba(255,255,255,0.3)', textDecoration: 'none', fontSize: '12.5px',
              transition: 'color 0.18s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.65)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
            >{t}</a>
          ))}
        </div>
      </div>
    </div>

    <style>{`
      @media (max-width: 992px) {
        .footer-grid { grid-template-columns: 1fr 1fr !important; }
      }
      @media (max-width: 600px) {
        .footer-grid { grid-template-columns: 1fr !important; }
      }
    `}</style>
  </footer>
);

export default Footer;
