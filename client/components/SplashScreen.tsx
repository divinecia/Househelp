import { useEffect, useState } from "react";

interface SplashScreenProps {
  onComplete?: () => void;
  duration?: number;
}

export default function SplashScreen({ onComplete, duration = 3000 }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        clearInterval(interval);
        setIsVisible(false);
        onComplete?.();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center z-50 overflow-hidden">
      {/* Background animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* Logo Container */}
        <div className="mb-8 animate-bounce">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl">
            {/* HouseHelp Logo */}
            <svg
              viewBox="0 0 200 200"
              className="w-20 h-20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* House icon */}
              <path
                d="M100 30L160 80V170H40V80Z"
                fill="url(#gradient)"
                stroke="#2563eb"
                strokeWidth="3"
              />
              {/* Door */}
              <rect x="85" y="110" width="30" height="60" fill="#2563eb" opacity="0.3" />
              {/* Window */}
              <rect x="120" y="95" width="25" height="25" fill="#2563eb" opacity="0.3" />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#1e40af" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* App Title */}
        <h1 className="text-4xl font-bold text-white mb-2 text-center drop-shadow-lg">
          HouseHelp
        </h1>
        <p className="text-blue-100 text-center text-lg mb-8 drop-shadow">
          Professional Household Services
        </p>

        {/* Loading Progress Bar */}
        <div className="w-64 h-1 bg-white bg-opacity-30 rounded-full overflow-hidden shadow-lg">
          <div
            className="h-full bg-gradient-to-r from-white to-blue-200 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Loading Text */}
        <p className="text-white text-sm mt-6 opacity-80 drop-shadow">
          {Math.round(progress)}% Loading...
        </p>

        {/* Feature Indicators */}
        <div className="mt-12 flex gap-8">
          <div className="flex flex-col items-center gap-2 opacity-80">
            <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs">
              ✓
            </div>
            <span className="text-white text-xs">Fast</span>
          </div>
          <div className="flex flex-col items-center gap-2 opacity-80">
            <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs">
              ✓
            </div>
            <span className="text-white text-xs">Secure</span>
          </div>
          <div className="flex flex-col items-center gap-2 opacity-80">
            <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs">
              ✓
            </div>
            <span className="text-white text-xs">Reliable</span>
          </div>
        </div>
      </div>

      {/* Floating animation styles */}
      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animate-bounce {
          animation: bounce 1s ease-in-out infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
