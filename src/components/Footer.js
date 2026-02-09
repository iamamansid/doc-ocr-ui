import React from 'react';
import '../styles/Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p className="footer-text">
          © 2026 Doc OCR - A personal project. Not for commercial use.
          <br />
          Licensed under the MIT License.
        </p>
        
        <div className="footer-links">
          <a 
            href="https://github.com/iamamansid" 
            target="_blank" 
            rel="noopener noreferrer"
            className="footer-link"
            title="GitHub"
          >
            GitHub
          </a>
          <span className="link-separator">•</span>
          <a 
            href="https://www.linkedin.com/in/aman-siddiqui-b511871b6/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="footer-link"
            title="LinkedIn"
          >
            LinkedIn
          </a>
          <span className="link-separator">•</span>
          <a 
            href="https://leetcode.com/u/amansiddiqui/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="footer-link"
            title="LeetCode"
          >
            LeetCode
          </a>
          <span className="link-separator">•</span>
          <a 
            href="https://majestic-tarsier-5a5635.netlify.app/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="footer-link"
            title="Portfolio"
          >
            Portfolio
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
