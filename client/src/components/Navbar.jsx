import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Navbar.module.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>BiasCheck</Link>
        <div className={`${styles.menu} ${isOpen ? styles.open : ''}`}>
          <Link to="/" className={styles.navLink}>Home</Link>
          <Link to="/analyze" className={styles.navLink}>Analyze</Link>
          {currentUser && (
            <>
              <Link to="/dashboard" className={styles.navLink}>Dashboard</Link>
              <Link to="/history" className={styles.navLink}>History</Link>
            </>
          )}
          <Link to="/about" className={styles.navLink}>About</Link>
          {currentUser ? (
            <div className={styles.userSection}>
              {currentUser.photoURL && (
                <img 
                  src={currentUser.photoURL} 
                  alt={currentUser.displayName || currentUser.email} 
                  className={styles.userAvatar}
                />
              )}
              <span className={styles.userEmail}>
                {currentUser.displayName || currentUser.email}
              </span>
              <button onClick={handleLogout} className={styles.logoutButton}>
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className={styles.loginButton}>Sign In</Link>
          )}
        </div>
        <button className={styles.hamburger} onClick={() => setIsOpen(!isOpen)} aria-label="Toggle Menu">
          <div className={styles.bar}></div>
          <div className={styles.bar}></div>
          <div className={styles.bar}></div>
        </button>
      </div>
    </nav>
  );
};

export default Navbar; 