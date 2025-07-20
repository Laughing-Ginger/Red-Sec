import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { Modal } from '../common/Modal';

export const AboutModal = () => {
    const { showAbout, setShowAbout } = useContext(AppContext);
    return (
        <Modal show={showAbout} onClose={() => setShowAbout(false)} title="About Secure Data Redactor">
            <div className="about-text">
                <p>This tool uses AI to find and remove sensitive information from your text, helping you protect private data before sharing documents.</p>
                <h3>How It Works</h3>
                <ol>
                    <li>Choose an input method: paste text directly or upload a .txt file.</li>
                    <li>Select the types of sensitive data (entities) you want to find.</li>
                    <li>Add any custom patterns using regular expressions for specific needs.</li>
                    <li>Click "Redact Content" to process the text.</li>
                    <li>Review, download, and use your newly secured text.</li>
                </ol>
            </div>
        </Modal>
    );
};