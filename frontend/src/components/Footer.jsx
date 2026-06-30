import { Link } from 'react-router-dom';
import BrandLogo from './BrandLogo';

const footerGroups = [
  {
    title: 'Company',
    links: [
      { label: 'About Us', to: '/about' },
      { label: 'Contact', to: '/contact' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Shipping and Returns', to: '/return-policy' },
      { label: 'FAQ', to: '/contact#faqs' },
      { label: 'Support Request', to: '/support-request' },
      { label: 'Track Order', to: '/dashboard' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', to: '/privacy' },
      { label: 'Terms of Service', to: '/terms' },
    ],
  },
];

const Footer = () => (
  <footer className="stitch-footer">
    <div className="container">
      <div className="stitch-footer-grid">
        <div>
          <Link to="/" className="stitch-footer-logo-link" aria-label="The WellMan Co home">
            <BrandLogo className="stitch-footer-logo" />
          </Link>
          <p>Clinical authority meets lifestyle aspiration. Premium formulations engineered for the modern man.</p>
        </div>

        {footerGroups.map(group => (
          <div className="stitch-footer-group" key={group.title}>
            <h5>{group.title}</h5>
            {group.links.map(link => (
              <Link key={link.label} to={link.to}>{link.label}</Link>
            ))}
          </div>
        ))}
      </div>

      <div className="stitch-footer-bottom">
        <p>© {new Date().getFullYear()} The WellMan Co. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
