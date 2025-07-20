import React, { useContext, useRef } from 'react';
import { AppContext } from '../../context/AppContext';
import { useRedactor } from '../../hooks/useRedactor';
import { ToggleSwitch } from '../common/ToggleSwitch';

// Helper function to download a single text file
const downloadTextFile = (content, filename) => {
  const element = document.createElement('a');
  const blob = new Blob([content], { type: 'text/plain' });
  element.href = URL.createObjectURL(blob);
  element.download = filename;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

const FileList = () => {
  const { files, setFiles } = useContext(AppContext);

  const removeFile = id => setFiles(prev => prev.filter(file => file.id !== id));
  
  const downloadAll = () => {
    const completedFiles = files.filter(f => f.status === 'completed');
    if (completedFiles.length === 0) return;
    
    completedFiles.forEach((file, index) => {
      // A small delay between downloads can help prevent browser blocking
      setTimeout(() => {
        downloadTextFile(file.result, `redacted_${file.name}`);
      }, index * 300);
    });
  };

  const clearQueue = () => {
    setFiles([]);
  };

  if (files.length === 0) return null;

  const completedCount = files.filter(f => f.status === 'completed').length;

  return (
    <div className="file-list">
      <div className="file-list-header">
        <h3>Processing Queue</h3>
        <div className="file-list-actions">
          {completedCount > 0 && <button className="download-all-btn" onClick={downloadAll}>Download All</button>}
          <button className="clear-queue-btn" onClick={clearQueue}>Clear Queue</button>
        </div>
      </div>
      <div className="file-items">
        {files.map(file => (
          <div key={file.id} className="file-item">
            <div className="file-info">
              <span className="file-name">{file.name}</span>
              <span className={`file-status ${file.status}`}>{file.status}</span>
            </div>
            <div className="file-actions">
              {file.status === 'completed' && <button className="download-btn" onClick={() => downloadTextFile(file.result, `redacted_${file.name}`)}>Download</button>}
              <button className="remove-btn" onClick={() => removeFile(file.id)}>Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const FileUpload = () => {
  const { setFiles } = useContext(AppContext);
  const fileInputRef = useRef(null);
  
  const addFilesToQueue = newFiles => {
    const acceptedFiles = Array.from(newFiles).filter(f => f.type === 'text/plain' || f.name.endsWith('.txt'));
    if (acceptedFiles.length === 0) return;
    
    const newQueueItems = acceptedFiles.map((file, i) => ({ id: `${Date.now()}-${i}`, file, name: file.name, status: 'queued', result: null }));
    
    // Append new files to the existing queue
    setFiles(prev => [...prev, ...newQueueItems]);
  };

  const handleFileDrop = e => { e.preventDefault(); addFilesToQueue(e.dataTransfer.files); };
  const handleFileInput = e => { addFilesToQueue(e.target.files); e.target.value = null; };
  
  return (
    <div className="upload-section">
      <div className="drop-zone" onDragOver={e => e.preventDefault()} onDrop={handleFileDrop} onClick={() => fileInputRef.current?.click()}>
        <div className="drop-content">
          <div className="upload-icon"><svg viewBox="0 0 24 24"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/></svg></div>
          <p>Drag & drop text files here</p>
          <p className="small">or click to browse (.txt only)</p>
        </div>
        <input type="file" ref={fileInputRef} onChange={handleFileInput} multiple accept=".txt,text/plain" style={{ display: 'none' }} />
      </div>
      <FileList />
    </div>
  );
};

const InputTabs = () => {
    const { inputMethod, setInputMethod } = useContext(AppContext);
    return (
        <div className="input-method-tabs">
            <button className={inputMethod === 'paste' ? 'active' : ''} onClick={() => setInputMethod('paste')}>Paste Text</button>
            <button className={inputMethod === 'upload' ? 'active' : ''} onClick={() => setInputMethod('upload')}>Upload Files</button>
        </div>
    );
};

const PasteInput = () => {
    const { inputText, setInputText } = useContext(AppContext);
    return <div className="paste-section"><textarea placeholder="Paste sensitive text here..." value={inputText} onChange={e => setInputText(e.target.value)} /></div>;
};

const RedactionControls = () => {
    const { clearAll, files, inputMethod } = useContext(AppContext);
    const { isProcessing, handleRedact } = useRedactor();
    
    const hasQueuedFiles = files.some(f => f.status === 'queued');
    const isRedactDisabled = isProcessing || (inputMethod === 'upload' && !hasQueuedFiles);
    
    const buttonText = () => {
        if (isProcessing) return 'Processing...';
        if (inputMethod === 'upload') return 'Process Queue';
        return 'Redact Content';
    };

    return (
        <div className="controls">
            <button onClick={handleRedact} disabled={isRedactDisabled} className="primary">{buttonText()}</button>
            <button onClick={clearAll} className="secondary">Clear All</button>
        </div>
    );
};

const Configuration = () => {
    const { customPatterns, setCustomPatterns, entityTypes, selectedEntities, handleEntityToggle } = useContext(AppContext);
    return (
        <>
            <div className="custom-patterns">
                <label htmlFor="custom-patterns">Custom Patterns (comma separated):</label>
                <input id="custom-patterns" type="text" placeholder="e.g., \d{3}-\d{2}-\d{4}" value={customPatterns} onChange={e => setCustomPatterns(e.target.value)} />
            </div>
            <div className="entity-selection">
                <h3>Redaction Targets:</h3>
                <div className="entity-toggles">
                    {entityTypes.map(entity => <ToggleSwitch key={entity.id} id={`toggle-${entity.id}`} label={entity.name} checked={selectedEntities[entity.id]} onChange={() => handleEntityToggle(entity.id)} />)}
                </div>
            </div>
        </>
    );
};

export const InputSection = () => {
    const { inputMethod } = useContext(AppContext);
    return (
        <div className="input-section">
            <InputTabs />
            {inputMethod === 'paste' ? <PasteInput /> : <FileUpload />}
            <Configuration />
            <RedactionControls />
        </div>
    );
};
