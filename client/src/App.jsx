// client/src/App.jsx
import { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [inputText, setInputText] = useState('');
  const [redactedText, setRedactedText] = useState('');

  const handleRedactClick = async () => {
    try {
      // Send the text to our backend
      const response = await axios.post('http://localhost:5000/api/redact', {
        text: inputText,
      });
      setRedactedText(response.data.redactedText);
    } catch (error) {
      console.error('Error redacting text:', error);
      setRedactedText('Error: Could not connect to the server.');
    }
  };

  return (
    <div className="App">
      <h1>Sensitive Data Redactor</h1>
      <textarea
        rows="10"
        cols="60"
        placeholder="Paste your text here..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      ></textarea>
      <br />
      <button onClick={handleRedactClick}>Redact Text</button>
      <h2>Result:</h2>
      <pre>{redactedText}</pre>
    </div>
  );
}

export default App;