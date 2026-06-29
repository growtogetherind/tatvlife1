import { useId } from 'react';

const BrandLogo = ({ className = '', title = 'The WellMan Co' }) => {
  const titleId = useId();

  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 620 200"
      role="img"
      aria-labelledby={titleId}
    >
      <title id={titleId}>{title}</title>
      <rect width="100%" height="100%" fill="none" />
      <g fill="#0b2848" fontFamily="'Century Gothic', 'Montserrat', 'Helvetica', sans-serif">
        <text x="120" y="120" fontSize="50" fontWeight="400" letterSpacing="0">
          The
        </text>
        <text x="210" y="120" fontSize="60" fontWeight="700" letterSpacing="-1.5">
          We
        </text>
        <g stroke="#0b2848" strokeWidth="4" fill="none" transform="translate(330, 70)">
          <rect x="0" y="0" width="16" height="50" rx="8" />
          <line x1="0" y1="25" x2="16" y2="25" />
          <rect x="23" y="0" width="16" height="50" rx="8" />
          <line x1="23" y1="25" x2="39" y2="25" />
        </g>
        <text x="385" y="120" fontSize="60" fontWeight="700" letterSpacing="-1.5">
          Man
        </text>
        <text x="500" y="120" fontSize="50" fontWeight="400" letterSpacing="0">
          Co
        </text>
      </g>
    </svg>
  );
};

export default BrandLogo;
