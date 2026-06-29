import logo from '../../logo.png';

const BrandLogo = ({ className = '', title = 'The WellMan Co' }) => {
  return (
    <img
      className={className}
      src={logo}
      alt={title}
      loading="lazy"
      decoding="async"
    />
  );
};

export default BrandLogo;
