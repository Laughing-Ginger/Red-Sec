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
  const { inputMethod, inputText, files, setFiles, customPatterns, selectedEntities, setRedactedText, setStats } = useContext(AppContext);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const sessionId = useSession();

  const handleRedact = async () => {
    if ((inputMethod === 'paste' && !inputText.trim()) || (inputMethod === 'upload' && files.length === 0)) {
      setError('Please provide content to redact.');
      return;
    }
    setIsProcessing(true);
    setError('');
    try {
      const content = inputMethod === 'upload' ? await readFileContent(files[0].file) : inputText;
      const payload = {
        text: content,
        customPatterns: customPatterns.split(',').map(p => p.trim()).filter(Boolean),
        entities: Object.keys(selectedEntities).filter(key => selectedEntities[key]),
        sessionId,
      };
      const response = await redactContent(payload);
      setRedactedText(response.data.redactedText);
      setStats(response.data.stats);
      if (inputMethod === 'upload') {
        setFiles(prev => prev.map((f, i) => i === 0 ? { ...f, status: 'completed', result: response.data.redactedText } : f));
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An unexpected error occurred.');
    } finally {
      setIsProcessing(false);
    }
  };
  return { isProcessing, error, handleRedact, setError };
};