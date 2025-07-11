import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import styles from './Dashboard.module.css';

const API_URL = 'http://localhost:8000/dashboard';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalAnalyses: 0,
    biasDetected: 0,
    accuracy: 0,
    recentAnalyses: [],
    biasBreakdown: {
      gender: 0,
      age: 0,
      cultural: 0,
      toxic: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, currentUser } = useAuth();

  useEffect(() => {
    if (currentUser && token) {
      fetchDashboardData();
    } else {
      // Show demo data for non-authenticated users
      loadDemoData();
    }
  }, [currentUser, token]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to load dashboard data');
      // Fallback to demo data
      loadDemoData();
    } finally {
      setLoading(false);
    }
  };

  const loadDemoData = () => {
    // Demo data for testing
    setTimeout(() => {
      setStats({
        totalAnalyses: 0,
        biasDetected: 0,
        accuracy: 0,
        biasBreakdown: {
          gender: 0,
          age: 0,
          cultural: 0,
          toxic: 0
        },
        recentAnalyses: []
      });
      setLoading(false);
    }, 1000);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#28a745';
    if (score >= 60) return '#ffa726';
    return '#ff6b6b';
  };

  if (loading) {
    return (
      <div className={styles.pageWrapper}>
        <Navbar />
        <main className={styles.dashboardPage}>
          <div className={styles.container}>
            <div className={styles.loadingSection}>
              <div className={styles.loader}></div>
              <p>Loading your dashboard...</p>
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
      <main className={styles.dashboardPage}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>Dashboard</h1>
            <p className={styles.subtitle}>
              {!currentUser 
                ? 'Demo mode - showing sample data' 
                : 'Monitor your bias analysis activities and insights'
              }
            </p>
          </div>

          {error && (
            <div className={styles.errorSection}>
              <p>{error}</p>
            </div>
          )}

          {/* Quick Actions */}
          <div className={styles.quickActions}>
            <Link to="/analyze" className={styles.actionCard}>
              <div className={styles.actionIcon}>📝</div>
              <h3>New Analysis</h3>
              <p>Analyze a new job description</p>
            </Link>
            <Link to="/history" className={styles.actionCard}>
              <div className={styles.actionIcon}>📊</div>
              <h3>View History</h3>
              <p>See all your previous analyses</p>
            </Link>
            <Link to="/compare" className={styles.actionCard}>
              <div className={styles.actionIcon}>⚖️</div>
              <h3>Compare JDs</h3>
              <p>Side-by-side comparison</p>
            </Link>
          </div>

          {/* Statistics Cards */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📈</div>
              <div className={styles.statContent}>
                <h3 className={styles.statNumber}>{stats.totalAnalyses}</h3>
                <p className={styles.statLabel}>Total Analyses</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>⚠️</div>
              <div className={styles.statContent}>
                <h3 className={styles.statNumber}>{stats.biasDetected}</h3>
                <p className={styles.statLabel}>Bias Instances Found</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>🎯</div>
              <div className={styles.statContent}>
                <h3 className={styles.statNumber}>{stats.accuracy}%</h3>
                <p className={styles.statLabel}>Accuracy Rate</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📅</div>
              <div className={styles.statContent}>
                <h3 className={styles.statNumber}>7</h3>
                <p className={styles.statLabel}>This Week</p>
              </div>
            </div>
          </div>

          {/* Bias Score Breakdown */}
          <div className={styles.biasScoreSection}>
            <h2 className={styles.sectionTitle}>Bias Score Breakdown</h2>
            <div className={styles.scoreBreakdown}>
              <div className={styles.scoreCard}>
                <div className={styles.scoreCircle}>
                  <span className={styles.scoreNumber}>65%</span>
                  <span className={styles.scoreLabel}>Neutral</span>
                </div>
                <div className={styles.biasChart}>
                  <div className={styles.chartItem}>
                    <span className={styles.chartLabel}>Gender Bias</span>
                    <div className={styles.chartBar}>
                      <div 
                        className={styles.chartFill} 
                        style={{width: `${stats.biasBreakdown.gender}%`, backgroundColor: '#ff6b6b'}}
                      ></div>
                    </div>
                    <span className={styles.chartValue}>{stats.biasBreakdown.gender}%</span>
                  </div>
                  <div className={styles.chartItem}>
                    <span className={styles.chartLabel}>Age Bias</span>
                    <div className={styles.chartBar}>
                      <div 
                        className={styles.chartFill} 
                        style={{width: `${stats.biasBreakdown.age}%`, backgroundColor: '#ffa726'}}
                      ></div>
                    </div>
                    <span className={styles.chartValue}>{stats.biasBreakdown.age}%</span>
                  </div>
                  <div className={styles.chartItem}>
                    <span className={styles.chartLabel}>Cultural Bias</span>
                    <div className={styles.chartBar}>
                      <div 
                        className={styles.chartFill} 
                        style={{width: `${stats.biasBreakdown.cultural}%`, backgroundColor: '#66bb6a'}}
                      ></div>
                    </div>
                    <span className={styles.chartValue}>{stats.biasBreakdown.cultural}%</span>
                  </div>
                  <div className={styles.chartItem}>
                    <span className={styles.chartLabel}>Toxic Signals</span>
                    <div className={styles.chartBar}>
                      <div 
                        className={styles.chartFill} 
                        style={{width: `${stats.biasBreakdown.toxic}%`, backgroundColor: '#9c27b0'}}
                      ></div>
                    </div>
                    <span className={styles.chartValue}>{stats.biasBreakdown.toxic}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Analyses */}
          <div className={styles.recentSection}>
            <h2 className={styles.sectionTitle}>Recent Analyses</h2>
            {stats.recentAnalyses.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📊</div>
                <h2>No analyses yet</h2>
                <p>Start by analyzing your first job description!</p>
                <Link to="/analyze" className={styles.analyzeButton}>
                  Analyze Job Description
                </Link>
              </div>
            ) : (
              <div className={styles.analysesList}>
                {stats.recentAnalyses.map((analysis) => (
                  <div key={analysis.id} className={styles.analysisCard}>
                    <div className={styles.analysisInfo}>
                      <h3 className={styles.analysisTitle}>{analysis.title}</h3>
                      <p className={styles.analysisDate}>{analysis.date}</p>
                      <div className={styles.analysisTags}>
                        <span className={styles.biasCount}>{analysis.biasCount} bias detected</span>
                        <span className={styles.status}>{analysis.status}</span>
                      </div>
                    </div>
                    
                    <div className={styles.analysisScore}>
                      <div 
                        className={styles.scoreCircle}
                        style={{borderColor: getScoreColor(analysis.score)}}
                      >
                        <span 
                          className={styles.scoreNumber}
                          style={{color: getScoreColor(analysis.score)}}
                        >
                          {analysis.score}
                        </span>
                      </div>
                      <span className={styles.scoreLabel}>Score</span>
                    </div>
                    
                    <Link to={`/results/${analysis.id}`} className={styles.viewButton}>
                      View Details
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tips Section */}
          <div className={styles.tipsSection}>
            <h2 className={styles.sectionTitle}>Tips for Better Results</h2>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <h3>Be Specific</h3>
                <p>Include detailed job requirements and responsibilities for more accurate analysis.</p>
              </div>
              <div className={styles.tipCard}>
                <h3>Review Suggestions</h3>
                <p>Always review our suggestions and adapt them to your specific context.</p>
              </div>
              <div className={styles.tipCard}>
                <h3>Regular Updates</h3>
                <p>Keep your job descriptions updated to reflect current inclusive practices.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard; 