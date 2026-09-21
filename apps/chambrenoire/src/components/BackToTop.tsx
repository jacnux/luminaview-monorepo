import React, { useState, useEffect } from 'react';

interface BackToTopProps {
  threshold?: number;
}

const BackToTop: React.FC<BackToTopProps> = ({ threshold = 300 }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > threshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-amber-500/90 hover:bg-amber-400 text-gray-950 shadow-xl shadow-amber-500/25 border border-amber-400/40 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-amber-400/50 backdrop-blur-sm group"
      title="Retour en haut de page"
      aria-label="Retour en haut de page"
    >
      <svg
        className="w-5 h-5 transform group-hover:-translate-y-0.5 transition-transform duration-200"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </button>
  );
};

export default BackToTop;
