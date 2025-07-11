import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Analyze.module.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const API_URL = 'http://localhost:8000/analyze';

const Analyze = () => {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState('');
  const { token } = useAuth();
  const navigate = useNavigate();

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        setText(e.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // For demo mode, allow analysis without token
    if (!token && !text.trim()) {
      setError('Please enter some text to analyze.');
      return;
    }
    
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const headers = { 
        'Content-Type': 'application/json'
      };
      
      // Add authorization header only if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({ text }),
      });
      if (!response.ok) {
        if (response.status === 401) {
          setError('Authentication failed. Please log in again.');
          navigate('/login');
          return;
        }
        throw new Error('API error');
      }
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError('Failed to analyze. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return '#ff6b6b';
      case 'medium': return '#ffa726';
      case 'low': return '#66bb6a';
      default: return '#666';
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <Navbar />
      <main className={styles.analyzePage}>
        <div className={styles.container}>
          <div className={styles.contentPanel}>
            <h1 className={styles.title}>Analyze Job Description</h1>
            <p className={styles.subtitle}>Paste your job description or upload a file to detect bias and toxic signals.</p>
            
            <div className={styles.uploadSection}>
              <div className={styles.fileUpload}>
                <input
                  type="file"
                  accept=".txt,.pdf"
                  onChange={handleFileUpload}
                  id="file-upload"
                  className={styles.fileInput}
                />
                <label htmlFor="file-upload" className={styles.fileLabel}>
                  📁 Upload File (PDF/TXT)
                </label>
                {fileName && <span className={styles.fileName}>{fileName}</span>}
              </div>
            </div>

            <textarea
              className={styles.textarea}
              rows="12"
              placeholder="Or paste your job description here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            
            <button className={styles.analyzeButton} onClick={handleSubmit} disabled={loading}>
              {loading ? 'Analyzing...' : 'Analyze Now'}
            </button>
          </div>

          {loading && (
            <div className={styles.loadingSection}>
              <div className={styles.loader}></div>
              <p>Analyzing your text for bias and toxic signals...</p>
            </div>
          )}

          {error && (
            <div className={styles.errorSection}>
              <p>{error}</p>
            </div>
          )}

          {result && (
            <div className={styles.resultsSection}>
              <h2 className={styles.resultsTitle}>Analysis Complete!</h2>
              <div className={styles.resultsGrid}>
                <div className={styles.resultCard}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>Predicted Label</h3>
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.phraseSection}>
                      <strong>Label:</strong>
                      <mark className={styles.highlightedPhrase}>{result.label}</mark>
                    </div>
                  </div>
                </div>
                <div className={styles.resultCard}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>Class Probabilities</h3>
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.explanationSection}>
                      <strong>Probabilities:</strong>
                      <div>
                        {Object.entries(result.probabilities).map(([label, prob]) => (
                          <div key={label} className={styles.probability}>
                            <span className={styles.label}>{label}</span>
                            <span className={styles.bar}>
                              <span style={{ width: `${prob * 100}%` }}></span>
                            </span>
                            <span className={styles.percentage}>{(prob * 100).toFixed(1)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles.resultCard}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>Bias-coded Words</h3>
                  </div>
                  <div className={styles.cardBody}>
                    <BiasList biasWords={result.bias_words} />
                  </div>
                </div>
                <div className={styles.resultCard}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>Sentiment Analysis</h3>
                  </div>
                  <div className={styles.cardBody}>
                    <SentimentSummary sentiment={result.sentiment} />
                  </div>
                </div>
                <div className={styles.resultCard}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>Summary</h3>
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.summarySection}>
                      {result.summary}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

function BiasList({ biasWords }) {
  // Group by bias_type
  const grouped = biasWords.reduce((acc, bw) => {
    acc[bw.bias_type] = acc[bw.bias_type] || [];
    acc[bw.bias_type].push(bw);
    return acc;
  }, {});

  const biasTypeStyles = {
    "pronoun": { color: "#b197fc", icon: "🛈" },
    "coded": { color: "#ffa94d", icon: "⚠️" },
    "competition": { color: "#ff6b6b", icon: "⚠️" },
    "age bias": { color: "#fab005", icon: "⚠️" },
    "appearance bias": { color: "#868e96", icon: "⚠️" },
    "cultural bias": { color: "#63e6be", icon: "⚠️" },
    "job_title": { color: "#4dabf7", icon: "🛈" },
    "noun": { color: "#dee2e6", icon: "🛈" },
    "default": { color: "#ced4da", icon: "🛈" }
  };

  return (
    <div>
      {Object.entries(grouped).map(([type, words]) => {
        const { color } = biasTypeStyles[type] || biasTypeStyles["default"];
        return (
          <div key={type} style={{ marginBottom: 18 }}>
            <div style={{
              fontWeight: 600,
              marginBottom: 8,
              color,
              fontSize: 16,
              letterSpacing: 1
            }}>
              {type.replace("_", " ").toUpperCase()}
            </div>
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px"
            }}>
              {words.map((bw, idx) => {
                const style = biasTypeStyles[bw.bias_type] || biasTypeStyles["default"];
                return (
                  <div key={idx} style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    background: style.color + "22",
                    border: `1.5px solid ${style.color}`,
                    borderRadius: 16,
                    padding: "0.7em 1.2em",
                    minWidth: 120,
                    maxWidth: 220,
                    marginBottom: 4,
                    boxShadow: "0 1px 4px #0001"
                  }}>
                    <span style={{ fontSize: 18, marginBottom: 2 }}>
                      {style.icon} <b>{bw.word}</b>
                    </span>
                    <span style={{
                      fontSize: 12,
                      color: "#555",
                      marginBottom: 2,
                      fontWeight: 500
                    }}>
                      {bw.label}
                    </span>
                    <span style={{
                      fontSize: 12,
                      color: "#888",
                      fontStyle: "italic"
                    }}>
                      {bw.context_notes}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SentimentSummary({ sentiment }) {
  const { polarity, subjectivity } = sentiment;
  const emoji = polarity > 0.2 ? "🙂" : polarity < -0.2 ? "🙁" : "😐";
  const color = polarity > 0.2 ? "#51cf66" : polarity < -0.2 ? "#ff6b6b" : "#ffe066";
  return (
    <div style={{ display: "flex", alignItems: "center", fontSize: 24 }}>
      <span style={{ fontSize: 32, marginRight: 12 }}>{emoji}</span>
      <span style={{
        background: color,
        borderRadius: 8,
        padding: "0.3em 1em",
        fontWeight: 600,
        marginRight: 16
      }}>
        Polarity: {polarity.toFixed(2)}
      </span>
      <span style={{
        background: "#e7eaf6",
        borderRadius: 8,
        padding: "0.3em 1em",
        fontWeight: 600
      }}>
        Subjectivity: {subjectivity.toFixed(2)}
      </span>
    </div>
  );
}

export default Analyze; 