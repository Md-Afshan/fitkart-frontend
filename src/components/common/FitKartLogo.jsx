const FitKartLogo = ({ className = '' }) => {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 220 54"
      fill="none"
      role="img"
      aria-label="FITKART PRO"
    >
      <g transform="translate(4, 7)">
        <path
          d="M0 8L16 0L32 8L20 38L10 38L0 8Z"
          fill="#CCFF00"
        />
        <path
          d="M12 12L24 6L28 15L17 21Z"
          fill="#0A0E16"
        />
        <path
          d="M10 24L22 18L18 32L12 32Z"
          fill="#00F0FF"
        />
        <circle
          cx="28"
          cy="34"
          r="5"
          fill="#CCFF00"
        />
        <path
          d="M4 14L14 36"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </g>

      <text
        x="50"
        y="36"
        fontFamily="'Syne', 'Inter', sans-serif"
        fontWeight="900"
        fontSize="28"
        letterSpacing="-0.5px"
        fill="#FFFFFF"
      >
        FIT<tspan fill="#CCFF00">KART</tspan>
      </text>

      <rect
        x="180"
        y="16"
        width="30"
        height="15"
        rx="3"
        fill="#1E293B"
        stroke="#334155"
        strokeWidth="1"
      />

      <text
        x="185"
        y="27"
        fontFamily="'Inter', sans-serif"
        fontWeight="700"
        fontSize="8.5"
        fill="#CCFF00"
        letterSpacing="1px"
      >
        PRO
      </text>
    </svg>
  )
}

export default FitKartLogo
