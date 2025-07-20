import { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { useSession } from './useSession';
import { redactContent } from '../api/redactorApi';

const readFileContent = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = e => resolve(e.target.result);
  reader.onerror = () => reject(new Error('File read error'));
  reader.readAsText(file);
});

export const useRedactor = () => {
  const { 
    inputMethod, inputText, files, setFiles, customPatterns, 
    selectedEntities, setRedactedText, setStats 
  } = useContext(AppContext);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const sessionId = useSession();

  const handleRedact = async () => {
    setIsProcessing(true);
    setError('');

    // --- Logic for Pasted Text ---
    if (inputMethod === 'paste') {
      if (!inputText.trim()) {
        setError('Please provide content to redact.');
        setIsProcessing(false);
        return;
      }
      try {
        const payload = {
          text: inputText,
          customPatterns: customPatterns.split(',').map(p => p.trim()).filter(Boolean),
          entities: Object.keys(selectedEntities).filter(key => selectedEntities[key]),
          sessionId,
        };
        const response = await redactContent(payload);
        setRedactedText(response.data.redactedText);
        setStats(response.data.stats);
      } catch (err) {
        setError(err.response?.data?.error || 'An unexpected error occurred.');
      } finally {
        setIsProcessing(false);
      }
    } 
    // --- Logic for File Queue ---
    else if (inputMethod === 'upload') {
      const filesToProcess = files.filter(f => f.status === 'queued');
      if (filesToProcess.length === 0) {
        setError('No new files to process in the queue.');
        setIsProcessing(false);
        return;
      }

      // Process files sequentially
      for (const file of files) {
        if (file.status !== 'queued') continue;

        try {
          // Update UI to show this file is processing
          setFiles(prev => prev.map(f => f.id === file.id ? { ...f, status: 'processing' } : f));
          
          const content = await readFileContent(file.file);
          const payload = {
            text: content,
            customPatterns: customPatterns.split(',').map(p => p.trim()).filter(Boolean),
            entities: Object.keys(selectedEntities).filter(key => selectedEntities[key]),
            sessionId,
          };
          const response = await redactContent(payload);

          // Update UI with completed status and result
          setFiles(prev => prev.map(f => 
            f.id === file.id ? { ...f, status: 'completed', result: response.data.redactedText } : f
          ));
        } catch (err) {
          setError(`Failed to process ${file.name}.`);
          // Update UI to show this file has an error
          setFiles(prev => prev.map(f => 
            f.id === file.id ? { ...f, status: 'error' } : f
          ));
        }
      }
      setIsProcessing(false);
    }
  };

  return { isProcessing, error, handleRedact, setError };
};
