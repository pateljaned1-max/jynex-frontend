export default function JynexLogo({ size = 24 }: { size?: number }) {
  return (
    <div 
      className="relative flex items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 p-[1px] shadow-lg shadow-blue-500/25"
      style={{ width: size + 16, height: size + 16 }}
    >
      <div className="h-full w-full bg-[#080C16] rounded-2xl flex items-center justify-center">
        {/* Custom Double 'J' Monogram SVG */}
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]"
        >
          {/* First 'J' (Outer/Left) */}
          <path
            d="M9 4V15C9 17.2091 7.20914 19 5 19C4.44772 19 4 18.5523 4 18C4 17.4477 4.44772 17 5 17C6.10457 17 7 16.1046 7 15V4C7 3.44772 7.44772 3 8 3C8.55228 3 9 3.44772 9 4Z"
            fill="url(#jynex-gradient-1)"
          />
          {/* Second 'J' (Inner/Right Overlapping) */}
          <path
            d="M17 4V16C17 19.3137 14.3137 22 11 22C10.4477 22 10 21.5523 10 21C10 20.4477 10.4477 20 11 20C13.2091 20 15 18.2091 15 16V4C15 3.44772 15.4477 3 16 3C16.5523 3 17 3.44772 17 4Z"
            fill="url(#jynex-gradient-2)"
          />
          {/* Gradients */}
          <defs>
            <linearGradient id="jynex-gradient-1" x1="4" y1="3" x2="9" y2="19" gradientUnits="userSpaceOnUse">
              <stop stopColor="#60A5FA" />
              <stop offset="1" stopColor="#3B82F6" />
            </linearGradient>
            <linearGradient id="jynex-gradient-2" x1="10" y1="3" x2="17" y2="22" gradientUnits="userSpaceOnUse">
              <stop stopColor="#A855F7" />
              <stop offset="1" stopColor="#6366F1" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}