import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { getHistory, getRedactionById } from '../../api/redactorApi';

export const HistoryModal = ({ show, onClose, sessionId }) => {
    const { setRedactedText, setStats } = useContext(AppContext);
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
    useEffect(() => {
        if (!show) return;
        const fetchHistory = async () => {
            setIsLoading(true);
            try {
                const response = await getHistory(sessionId);
                setHistory(response.data);
            } catch (error) { console.error("Failed to fetch history:", error); }
            finally { setIsLoading(false); }
        };
        fetchHistory();
    }, [show, sessionId]);

    const loadRedaction = async (redactionId) => {
        try {
            const response = await getRedactionById(redactionId);
            setRedactedText(response.data.redactedText);
            setStats(response.data.stats);
            onClose();
        } catch (error) { console.error('Error loading redaction:', error); }
    };

    return (
        <Modal show={show} onClose={onClose} title="Redaction History">
            {isLoading ? <p>Loading history...</p> : history.length === 0 ? <p>No history found for this session.</p> :
                <ul className="history-list">
                    {history.map((item) => <li key={item.redactionId || item._id} onClick={() => loadRedaction(item.redactionId)}><span>{new Date(item.createdAt).toLocaleString()}</span><span>{item.stats.totalRedactions} redactions</span></li>)}
                </ul>
            }
        </Modal>
    );
};