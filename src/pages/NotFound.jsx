import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  useEffect(() => {
    // Initialize any scripts that were in the original 404 page
    // This would be the place to initialize constellation, cursor effects, etc.
    document.title = '404 - Page Not Found | Suleymanov Bobur';
  }, []);

  return (
    <div className="error-container flex flex-col items-center justify-center text-center min-h-[60vh] p-8">
      <h1 className="error-code font-mono text-[120px] text-primary m-0 animate-glitch">
        <span className="animate_letters">404</span>
      </h1>
      <h2 className="error-message font-mono text-[32px] text-primary my-4">
        <span className="animate_letters">Page Not Found</span>
      </h2>
      <p className="error-description font-mono text-[20px] text-[var(--text-color)] my-4 mb-8 max-w-[600px]">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link to="/" className="home-button inline-block py-3 px-6 bg-transparent border border-primary text-primary font-mono text-lg no-underline mt-4 transition-all duration-300 rounded hover:bg-primary hover:text-[var(--bg-color)] hover:translate-y-[-3px] hover:shadow-[0_5px_15px_rgba(255,215,0,0.3)]">
        <span className="animate_letters">Return to Homepage</span>
      </Link>
    </div>
  );
};

export default NotFound;