import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import NotFound from './pages/NotFound';

// Import CSS for global styles
import './App.css';

function App() {
  return (
    <Router>
      <div className="constellation-container"></div>
      <div className="custom-cursor"></div>
      <div className="cursor-dot"></div>
      
      <main>
        <div className="container">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </main>
    </Router>
  );
}

export default App;