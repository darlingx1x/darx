import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar flex flex-wrap justify-start gap-4 py-4">
      <Link to="/" className="nav-link">
        <span className="animate_letters font-mono text-primary hover:text-white transition-colors duration-300">[darlingx.com]</span>
      </Link>
      <Link to="/cv" className="nav-link">
        <span className="animate_letters font-mono text-primary hover:text-white transition-colors duration-300">[cv]</span>
      </Link>
      <Link to="/books" className="nav-link">
        <span className="animate_letters font-mono text-primary hover:text-white transition-colors duration-300">[books]</span>
      </Link>
      <Link to="/posts" className="nav-link">
        <span className="animate_letters font-mono text-primary hover:text-white transition-colors duration-300">[posts]</span>
      </Link>
      <Link to="/lists" className="nav-link">
        <span className="animate_letters font-mono text-primary hover:text-white transition-colors duration-300">[lists]</span>
      </Link>
      <Link to="/projects" className="nav-link">
        <span className="animate_letters font-mono text-primary hover:text-white transition-colors duration-300">[projects]</span>
      </Link>
    </nav>
  );
};

export default Navbar;