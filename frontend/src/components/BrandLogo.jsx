const BrandLogo = ({ className = '', title = 'The WellMan Co' }) => {
  return (
    <img
      className={className}
      src="/logo.png"
      alt={title}
      loading="lazy"
      decoding="async"
      width="96"
      height="96"
      style={{ objectFit: 'contain', background: 'transparent' }}
    />
  );
};

export default BrandLogo;
