import React, { createContext, useState, useMemo } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [inputMethod, setInputMethod] = useState('paste');
  const [inputText, setInputText] = useState('');
  const [files, setFiles] = useState([]);
  const [redactedText, setRedactedText] = useState('');
  const [stats, setStats] = useState(null);
  const [customPatterns, setCustomPatterns] = useState('');
  const [selectedEntities, setSelectedEntities] = useState({ PER: true, ORG: true, LOC: true, MISC: true });
  const [showAbout, setShowAbout] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const entityTypes = useMemo(() => [
    { id: 'PER', name: 'Persons', description: 'Names of people.' },
    { id: 'ORG', name: 'Organizations', description: 'Companies, agencies, institutions.' },
    { id: 'LOC', name: 'Locations', description: 'Countries, cities, states.' },
    { id: 'MISC', name: 'Miscellaneous', description: 'Named entities that do not fit other categories.' }
  ], []);

  const handleEntityToggle = (entityId) => setSelectedEntities(prev => ({ ...prev, [entityId]: !prev[entityId] }));
  
  const clearAll = () => {
    setInputText('');
    setFiles([]);
    setRedactedText('');
    setStats(null);
  };

  const value = useMemo(() => ({
    inputMethod, inputText, files, redactedText, stats, customPatterns, selectedEntities, showAbout, showHistory, entityTypes,
    setInputMethod, setInputText, setFiles, setRedactedText, setStats, setCustomPatterns, setSelectedEntities, setShowAbout, setShowHistory,
    handleEntityToggle, clearAll,
  }), [inputMethod, inputText, files, redactedText, stats, customPatterns, selectedEntities, showAbout, showHistory, entityTypes]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};