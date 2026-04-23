interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 32, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Eye outer shape — almond/leaf form */}
      <path
        d="M2 16C2 16 8 6 16 6C24 6 30 16 30 16C30 16 24 26 16 26C8 26 2 16 2 16Z"
        fill="#142B21"
        stroke="#34D399"
        strokeWidth="1.2"
      />

      {/* Earth — iris circle */}
      <circle cx="16" cy="16" r="7" fill="#059669" />

      {/* Simplified continent / landmass shapes */}
      <path
        d="M13.5 12C14.2 11.5 15.5 11.2 16.5 12C17.2 12.6 17 13.8 16 14.2C15.2 14.5 14 14 13.5 13C13.2 12.5 13.2 12.2 13.5 12Z"
        fill="#34D399"
        opacity="0.7"
      />
      <path
        d="M17.5 15.5C18.3 15.2 19.5 15.5 19.8 16.5C20 17.2 19.5 18.2 18.5 18.5C17.8 18.7 17 18.3 16.8 17.5C16.6 16.8 17 15.7 17.5 15.5Z"
        fill="#34D399"
        opacity="0.7"
      />
      <path
        d="M12.5 16C13 15.6 13.8 16 14 16.8C14.2 17.4 13.8 18 13.2 18.2C12.6 18.3 12 17.8 12 17.2C12 16.7 12.2 16.2 12.5 16Z"
        fill="#34D399"
        opacity="0.6"
      />

      {/* Meridian lines on the globe */}
      <path
        d="M16 9C16 9 13 12 13 16C13 20 16 23 16 23"
        stroke="#34D399"
        strokeWidth="0.5"
        opacity="0.3"
        fill="none"
      />
      <path
        d="M16 9C16 9 19 12 19 16C19 20 16 23 16 23"
        stroke="#34D399"
        strokeWidth="0.5"
        opacity="0.3"
        fill="none"
      />
      {/* Equator line */}
      <ellipse
        cx="16"
        cy="16"
        rx="7"
        ry="2.5"
        stroke="#34D399"
        strokeWidth="0.5"
        opacity="0.25"
        fill="none"
      />

      {/* Pupil — dark center */}
      <circle cx="16" cy="16" r="2.5" fill="#142B21" />
      {/* Pupil highlight — gives life to the eye */}
      <circle cx="17.2" cy="14.8" r="0.9" fill="white" opacity="0.7" />

      {/* Satellite orbit arc — sweeping around the upper-right */}
      <path
        d="M22 7C25.5 9.5 27.5 13 27.5 16"
        stroke="#34D399"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.8"
        fill="none"
      />
      {/* Satellite dot */}
      <circle cx="22" cy="7" r="1.3" fill="#34D399" />
      {/* Satellite body hint — tiny cross */}
      <line x1="20.5" y1="7" x2="23.5" y2="7" stroke="white" strokeWidth="0.5" opacity="0.6" />
      <line x1="22" y1="5.8" x2="22" y2="8.2" stroke="white" strokeWidth="0.5" opacity="0.6" />
    </svg>
  );
}
