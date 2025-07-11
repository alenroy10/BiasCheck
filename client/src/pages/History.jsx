import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './History.module.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const API_URL = 'http://localhost:8000/history';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // For demo mode, allow access without token
    if (!token && !currentUser) {
      // Show demo data instead of redirecting
      loadDemoData();
      return;
    }

    fetchHistory();
  }, [token, currentUser, navigate]);

  const loadDemoData = () => {
    // Demo data for testing
    const demoHistory = [
      {
        id: 'demo-1',
        text: 'We are seeking a strong craftsman to join our team. The ideal candidate should be a recent graduate with 5+ years of experience...',
        label: 'biased',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        bias_count: 3
      },
      {
        id: 'demo-2',
        text: 'Looking for a dynamic team player who can work long hours and handle pressure. Must be young and energetic...',
        label: 'toxic',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        bias_count: 2
      },
      {
        id: 'demo-3',
        text: 'Seeking qualified candidates with excellent communication skills and strong analytical abilities...',
        label: 'neutral',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        bias_count: 0
      }
    ];
    
    setTimeout(() => {
      setHistory(demoHistory);
      setLoading(false);
    }, 1000); // Simulate loading
  };

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(API_URL, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Authentication failed. Please log in again.');
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch history');
      }

      const data = await response.json();
      setHistory(data);
    } catch (err) {
      setError('Failed to load history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getLabelColor = (label) => {
    switch (label.toLowerCase()) {
      case 'toxic':
        return '#ff6b6b';
      case 'biased':
        return '#ffa726';
      case 'neutral':
        return '#66bb6a';
      case 'positive':
        return '#51cf66';
      case 'negative':
        return '#ff6b6b';
      default:
        return '#666';
    }
  };

  if (loading) {
    return (
      <div className={styles.pageWrapper}>
        <Navbar />
        <main className={styles.historyPage}>
          <div className={styles.container}>
            <div className={styles.loadingSection}>
              <div className={styles.loader}></div>
              <p>Loading your analysis history...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <Navbar />
      <main className={styles.historyPage}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>Analysis History</h1>
            <p className={styles.subtitle}>
              {!token && !currentUser 
                ? 'Demo mode - showing sample data' 
                : 'Your past job description analyses'
              }
            </p>
          </div>

          {error && (
            <div className={styles.errorSection}>
              <p>{error}</p>
            </div>
          )}

          {history.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📊</div>
              <h2>No analyses yet</h2>
              <p>Start by analyzing your first job description!</p>
              <button 
                onClick={() => navigate('/analyze')}
                className={styles.analyzeButton}
              >
                Analyze Job Description
              </button>
            </div>
          ) : (
            <div className={styles.historyGrid}>
              {history.map((item) => (
                <div key={item.id} className={styles.historyCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.labelBadge} style={{ backgroundColor: getLabelColor(item.label) }}>
                      {item.label}
                    </div>
                    <div className={styles.timestamp}>
                      {formatDate(item.timestamp)}
                    </div>
                  </div>
                  
                  <div className={styles.cardBody}>
                    <p className={styles.textPreview}>
                      {item.text}
                    </p>
                    
                    <div className={styles.stats}>
                      <div className={styles.stat}>
                        <span className={styles.statLabel}>Bias Words:</span>
                        <span className={styles.statValue}>{item.bias_count}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default History; 