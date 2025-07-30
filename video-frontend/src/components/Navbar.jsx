import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getVideos } from '../api/video';

const Navbar = () => {
  const [hasVideo, setHasVideo] = useState(false);
  const [hasAIFeedback, setHasAIFeedback] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check if user has videos and AI feedback
    getVideos()
      .then((videos) => {
        const hasVideos = Array.isArray(videos) && videos.length > 0;
        const hasAIRequested = videos.some(video => video.aiFeedbackRequested);
        setHasVideo(hasVideos);
        setHasAIFeedback(hasAIRequested);
      })
      .catch(() => {
        setHasVideo(false);
        setHasAIFeedback(false);
      });
  }, []);

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <div className="navbar-logo">VS</div>
          <span>Video Studio</span>
        </Link>
        
        <ul className="navbar-nav">
          <li>
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
            >
              🏠 Accueil
            </Link>
          </li>
          <li>
            <Link 
              to="/record" 
              className={`nav-link ${isActive('/record') ? 'active' : ''}`}
            >
              🎬 Enregistrer
            </Link>
          </li>
          <li>
            <Link 
              to="/my-videos" 
              className={`nav-link ${isActive('/my-videos') ? 'active' : ''}`}
            >
              📹 Mes Vidéos
            </Link>
          </li>
          <li>
            <Link 
              to="/upload" 
              className={`nav-link ${isActive('/upload') ? 'active' : ''}`}
            >
              📤 Upload
            </Link>
          </li>
          {hasAIFeedback && (
            <li>
              <Link 
                to="/feedback" 
                className={`nav-link ${isActive('/feedback') ? 'active' : ''}`}
              >
                🤖 Feedback IA
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar; 