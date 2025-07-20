// client/src/App.jsx
import { useState, useRef } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [inputMethod, setInputMethod] = useState('paste'); // 'paste' or 'upload'
  const [inputText, setInputText] = useState('');
  const [files, setFiles] = useState([]);
  const [redactedText, setRedactedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [customPatterns, setCustomPatterns] = useState('');
  const [selectedEntities, setSelectedEntities] = useState({
    PER: true, ORG: true, LOC: true, MISC: true
  });
  const fileInputRef = useRef(null);

  const handleFileDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files)
      .filter(file => file.type === 'text/plain' || file.name.endsWith('.txt'));
    
    if (droppedFiles.length > 0) {
      addFilesToQueue(droppedFiles);
    }
  };

  const handleFileInput = (e) => {
    const selectedFiles = Array.from(e.target.files)
      .filter(file => file.type === 'text/plain' || file.name.endsWith('.txt'));
    
    if (selectedFiles.length > 0) {
      addFilesToQueue(selectedFiles);
    }
    e.target.value = null; // Reset input
  };

  const addFilesToQueue = (newFiles) => {
    const timestamp = Date.now();
    const newQueueFiles = newFiles.map((file, index) => ({
      id: `${timestamp}-${index}`,
      file,
      name: file.name,
      status: 'queued',
      result: null
    }));
    
    setFiles(prev => [...prev, ...newQueueFiles]);
  };

  const handleRedactClick = async () => {
    if (inputMethod === 'paste' && !inputText.trim()) {
      setError('Please enter text to redact');
      return;
    }
    
    if (inputMethod === 'upload' && files.length === 0) {
      setError('Please upload at least one file');
      return;
    }
    
    setIsProcessing(true);
    setError('');
    setRedactedText('');
    setStats(null);
    
    try {
      if (inputMethod === 'paste') {
        // Process pasted text
        const response = await axios.post('http://localhost:5000/api/redact', {
          text: inputText,
          customPatterns: customPatterns.split(',').map(p => p.trim()).filter(p => p),
          entities: Object.keys(selectedEntities).filter(key => selectedEntities[key])
        });
        
        setRedactedText(response.data.redactedText);
        setStats(response.data.stats);
      } else {
        // Process first file in queue
        const file = files[0];
        const reader = new FileReader();
        
        reader.onload = async (e) => {
          const content = e.target.result;
          const response = await axios.post('http://localhost:5000/api/redact', {
            text: content,
            customPatterns: customPatterns.split(',').map(p => p.trim()).filter(p => p),
            entities: Object.keys(selectedEntities).filter(key => selectedEntities[key])
          });
          
          setRedactedText(response.data.redactedText);
          setStats(response.data.stats);
          
          // Update file status
          const updatedFiles = files.map(f => 
            f.id === file.id ? {...f, status: 'completed', result: response.data.redactedText} : f
          );
          setFiles(updatedFiles);
        };
        
        reader.readAsText(file.file);
      }
    } catch (err) {
      console.error('Error redacting:', err);
      setError('Failed to process. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEntityToggle = (entity) => {
    setSelectedEntities(prev => ({
      ...prev,
      [entity]: !prev[entity]
    }));
  };

  const downloadRedactedText = () => {
    const element = document.createElement('a');
    const blob = new Blob([redactedText], {type: 'text/plain'});
    element.href = URL.createObjectURL(blob);
    element.download = 'redacted-text.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const downloadFile = (id) => {
    const file = files.find(f => f.id === id);
    if (!file || !file.result) return;
    
    const element = document.createElement('a');
    const blob = new Blob([file.result], { type: 'text/plain' });
    element.href = URL.createObjectURL(blob);
    element.download = `redacted_${file.name}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  };

  const clearAll = () => {
    setInputText('');
    setFiles([]);
    setRedactedText('');
    setStats(null);
    setError('');
  };

  const renderRedactedText = (text) => {
    if (!text) return null;
    
    // Split text while preserving entity markers
    const parts = text.split(/(\[[A-Z]+\])/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        return (
          <span key={index} className="redacted-entity">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="App">
      <header>
        <h1>Secure Data Redactor</h1>
        <p className="subtitle">Protect sensitive information with AI-powered redaction</p>
      </header>

      <div className="main-container">
        <div className="input-section">
          <div className="input-method-tabs">
            <button 
              className={inputMethod === 'paste' ? 'active' : ''}
              onClick={() => setInputMethod('paste')}
            >
              Paste Text
            </button>
            <button 
              className={inputMethod === 'upload' ? 'active' : ''}
              onClick={() => setInputMethod('upload')}
            >
              Upload Files
            </button>
          </div>

          {inputMethod === 'paste' ? (
            <div className="paste-section">
              <textarea
                placeholder="Paste sensitive text here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              ></textarea>
            </div>
          ) : (
            <div className="upload-section">
              <div 
                className="drop-zone"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current.click()}
              >
                <div className="drop-content">
                  <div className="upload-icon">
                    <svg viewBox="0 0 24 24">
                      <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
                    </svg>
                  </div>
                  <p>Drag & drop text files here</p>
                  <p className="small">or click to browse</p>
                  <p className="small">(.txt files only)</p>
                </div>
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInput}
                  multiple
                  accept=".txt,text/plain"
                  style={{ display: 'none' }}
                />
              </div>
              
              {files.length > 0 && (
                <div className="file-list">
                  <h3>Files to Process</h3>
                  <div className="file-items">
                    {files.map(file => (
                      <div key={file.id} className="file-item">
                        <div className="file-info">
                          <div className="file-name">{file.name}</div>
                          <div className="file-status">
                            {file.status === 'queued' && <span>Queued</span>}
                            {file.status === 'completed' && <span className="completed">Completed</span>}
                          </div>
                        </div>
                        <div className="file-actions">
                          {file.status === 'completed' && (
                            <button 
                              className="download-btn"
                              onClick={() => downloadFile(file.id)}
                            >
                              Download
                            </button>
                          )}
                          <button 
                            className="remove-btn"
                            onClick={() => removeFile(file.id)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="custom-patterns">
            <label>Custom Patterns (comma separated):</label>
            <input 
              type="text" 
              placeholder="e.g., credit card, social security, \d{3}-\d{2}-\d{4}"
              value={customPatterns}
              onChange={(e) => setCustomPatterns(e.target.value)}
            />
          </div>
          
          <div className="entity-selection">
            <h3>Redaction Targets:</h3>
            <div className="entity-toggles">
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={selectedEntities.PER}
                  onChange={() => handleEntityToggle('PER')}
                />
                <span className="toggle-slider"></span>
                Persons
              </label>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={selectedEntities.ORG}
                  onChange={() => handleEntityToggle('ORG')}
                />
                <span className="toggle-slider"></span>
                Organizations
              </label>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={selectedEntities.LOC}
                  onChange={() => handleEntityToggle('LOC')}
                />
                <span className="toggle-slider"></span>
                Locations
              </label>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={selectedEntities.MISC}
                  onChange={() => handleEntityToggle('MISC')}
                />
                <span className="toggle-slider"></span>
                Miscellaneous
              </label>
            </div>
          </div>

          <div className="controls">
            <button 
              onClick={handleRedactClick} 
              disabled={isProcessing || (inputMethod === 'upload' && files.length === 0)}
              className="primary"
            >
              {isProcessing ? 'Processing...' : 'Redact Content'}
            </button>
            <button onClick={clearAll} className="secondary">
              Clear All
            </button>
          </div>
        </div>
        
        <div className="output-section">
          <div className="section-header">
            <h2>Redaction Result</h2>
            {redactedText && (
              <button 
                onClick={downloadRedactedText}
                className="download-btn"
              >
                Download
              </button>
            )}
          </div>
          
          {error && <div className="error">{error}</div>}
          
          <div className="result-container">
            {redactedText ? (
              <div className="redacted-output">
                {renderRedactedText(redactedText)}
              </div>
            ) : (
              <div className="placeholder">
                {isProcessing ? (
                  <div className="loader">Processing...</div>
                ) : (
                  <p>Your redacted content will appear here</p>
                )}
              </div>
            )}
          </div>
          
          {stats && (
            <div className="stats">
              <h3>Redaction Statistics</h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">{stats.totalRedactions}</div>
                  <div className="stat-label">Total Redactions</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.timeTaken}ms</div>
                  <div className="stat-label">Processing Time</div>
                </div>
              </div>
              
              <div className="entity-stats">
                <h4>By Entity Type:</h4>
                <ul>
                  {Object.entries(stats.entityCounts).map(([entity, count]) => (
                    <li key={entity}>
                      <span className="entity-name">{entity}:</span>
                      <span className="entity-count">{count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <footer>
        <p>Secure Data Redaction System | Built with React & Node.js</p>
      </footer>
    </div>
  );
}

export default App;