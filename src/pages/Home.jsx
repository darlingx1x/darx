import React, { useEffect } from 'react';

const Home = () => {
  useEffect(() => {
    // Set document title
    document.title = 'Suleymanov Bobur | Home';
    
    // Here we would initialize any scripts that were in the original index page
    // such as constellation, cursor effects, etc.
  }, []);

  return (
    <div className="home-container">
      <div className="hero-section flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <h1 className="text-6xl md:text-8xl font-mono text-primary mb-6 animate-pulse">
          <span className="animate_letters">Suleymanov Bobur</span>
        </h1>
        <p className="text-xl md:text-2xl font-mono text-[var(--text-color)] max-w-2xl mb-8">
          AI, SE, Assistive Tech
        </p>
        <div className="social-links flex gap-4 mt-4">
          {/* Social links would go here */}
        </div>
      </div>
      
      <div className="featured-content grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 my-12">
        {/* Featured content sections would go here */}
        {/* This could include recent posts, projects, etc. */}
      </div>
    </div>
  );
};

export default Home;