const BrandLogo = ({ className = '', title = 'The WellMan Co' }) => {
  return (
    <img
      className={className}
      src="/logo.png"
      alt={title}
      loading="lazy"
      decoding="async"
    />
  );
};

export default BrandLogo;
