import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const appName = 'The WellMan Co';
const defaultDescription = 'Premium men’s wellness, hair restoration, skincare, and specialty therapeutics delivered with discreet, insured shipping.';
const defaultKeywords = 'mens wellness, hair loss treatment, skincare, sexual health, gym performance, specialty medicine';
const defaultImage = '/favicon.svg';

const pageMeta = (pathname) => {
  const normalized = pathname || '/';

  switch (normalized) {
    case '/':
      return {
        title: `${appName} | Premium Men's Wellness & Optimization`,
        description: 'Discover science-backed wellness products for hair restoration, skincare, sexual health, and performance support.',
        keywords: 'mens wellness, premium supplements, hair loss treatment, skincare, sexual health',
        type: 'website',
      };
    case '/shop':
      return {
        title: `${appName} | Shop Specialty Treatments`,
        description: 'Browse verified specialty treatments and wellness solutions with secure checkout and discreet shipping.',
        keywords: 'shop wellness products, specialty medications, premium supplements',
        type: 'website',
      };
    case '/checkout':
      return {
        title: `${appName} | Secure Checkout`,
        description: 'Complete your secure checkout with private shipping, verified payments, and fast delivery.',
        keywords: 'secure checkout, discreet delivery, wellness checkout',
        type: 'website',
      };
    case '/login':
      return {
        title: `${appName} | Sign In`,
        description: 'Access your patient dashboard, order history, and secure account management.',
        keywords: 'sign in, account access, dashboard login',
        type: 'website',
      };
    case '/dashboard':
      return {
        title: `${appName} | Patient Dashboard`,
        description: 'Manage your orders, prescriptions, and account details in a secure patient dashboard.',
        keywords: 'patient dashboard, order tracking, account management',
        type: 'website',
      };
    case '/admin':
      return {
        title: `${appName} | Admin Dashboard`,
        description: 'Administrative overview for inventory, orders, content, and customer management.',
        keywords: 'admin dashboard, inventory management',
        type: 'website',
      };
    case '/blog':
      return {
        title: `${appName} | Wellness Education`,
        description: 'Read expert insights on wellness, beauty, recovery, and modern men’s health.',
        keywords: 'wellness blog, men health education, skincare tips',
        type: 'website',
      };
    case '/about':
      return {
        title: `${appName} | About Us`,
        description: 'Learn about The WellMan Co’s approach to premium wellness, sourcing, and discreet care.',
        keywords: 'about the wellman co, wellness brand, premium care',
        type: 'website',
      };
    case '/contact':
      return {
        title: `${appName} | Contact`,
        description: 'Contact The WellMan Co support team for product questions, order support, billing, and discreet delivery help.',
        keywords: 'contact the wellman co, customer support, wellness product support',
        type: 'website',
      };
    case '/support-request':
      return {
        title: `${appName} | Support Request`,
        description: 'Submit a support request for shipping, product questions, payment issues, or order assistance.',
        keywords: 'support request, shipping help, product complaint, payment support',
        type: 'website',
      };
    case '/privacy':
      return {
        title: `${appName} | Privacy Policy`,
        description: 'Review The WellMan Co privacy practices, data handling, and customer protections.',
        keywords: 'privacy policy, data protection, customer privacy',
        type: 'article',
      };
    case '/terms':
      return {
        title: `${appName} | Terms & Conditions`,
        description: 'Read the terms and conditions for using The WellMan Co services and products.',
        keywords: 'terms and conditions, service agreement',
        type: 'article',
      };
    case '/return-policy':
      return {
        title: `${appName} | Return Policy`,
        description: 'Understand our return and replacement policy for orders and shipping issues.',
        keywords: 'return policy, replacement policy, shipping support',
        type: 'article',
      };
    case '/disclaimer':
      return {
        title: `${appName} | Health Safety Disclaimer`,
        description: 'Review our health and safety disclaimer and product-use guidance.',
        keywords: 'health disclaimer, safety disclaimer, wellness guidance',
        type: 'article',
      };
    default:
      if (normalized.startsWith('/product/')) {
        return {
          title: `${appName} | Product Details`,
          description: 'Explore product details, sourcing, dosage guidance, and secure purchasing options.',
          keywords: 'product details, premium treatment, wellness product',
          type: 'product',
        };
      }
      if (normalized.startsWith('/blog/')) {
        return {
          title: `${appName} | Blog Post`,
          description: 'Read expert wellness, recovery, and men’s health guidance from The WellMan Co.',
          keywords: 'wellness article, men health article',
          type: 'article',
        };
      }
      return {
        title: `${appName} | Premium Wellness`,
        description: defaultDescription,
        keywords: defaultKeywords,
        type: 'website',
      };
  }
};

const buildCanonicalUrl = (pathname) => {
  if (typeof window === 'undefined') return 'https://thewellmanco.com';
  return `${window.location.origin}${pathname === '/' ? '' : pathname}`;
};

const SEO = ({ title, description, keywords, path, type = 'website' }) => {
  const location = useLocation();
  const pathname = path || location.pathname;
  const meta = pageMeta(pathname);
  const resolvedTitle = title || meta.title;
  const resolvedDescription = description || meta.description;
  const resolvedKeywords = keywords || meta.keywords;
  const resolvedType = type || meta.type;

  useEffect(() => {
    document.title = resolvedTitle;

    const setMetaTag = (name, content, attr = 'name') => {
      let tag = document.querySelector(`meta[${attr}="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attr, name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    setMetaTag('description', resolvedDescription);
    setMetaTag('keywords', resolvedKeywords);
    setMetaTag('robots', 'index, follow, max-image-preview:large');
    setMetaTag('theme-color', '#0d2218');
    setMetaTag('og:title', resolvedTitle, 'property');
    setMetaTag('og:description', resolvedDescription, 'property');
    setMetaTag('og:type', resolvedType, 'property');
    setMetaTag('og:image', defaultImage, 'property');
    setMetaTag('og:site_name', appName, 'property');
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', resolvedTitle, 'name');
    setMetaTag('twitter:description', resolvedDescription, 'name');
    setMetaTag('twitter:image', defaultImage, 'name');

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', buildCanonicalUrl(pathname));

    let ldJson = document.getElementById('app-structured-data');
    if (!ldJson) {
      ldJson = document.createElement('script');
      ldJson.id = 'app-structured-data';
      ldJson.type = 'application/ld+json';
      document.head.appendChild(ldJson);
    }

    ldJson.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: appName,
      url: 'https://thewellmanco.com',
      logo: 'https://thewellmanco.com/favicon.svg',
      sameAs: [
        'https://www.instagram.com',
        'https://www.linkedin.com',
      ],
    });
  }, [pathname, resolvedTitle, resolvedDescription, resolvedKeywords, resolvedType]);

  return null;
};

export default SEO;
