import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { useSession } from '../hooks/useSession';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { InputSection } from '../components/input/InputSection';
import { OutputSection } from '../components/output/OutputSection';
import { AboutModal } from '../components/modals/AboutModal';
import { HistoryModal } from '../components/modals/HistoryModal';

export const RedactorPage = () => {
    const { showHistory, setShowHistory } = useContext(AppContext);
    const sessionId = useSession();
    return (
        <div className="App">
            <Header onShowHistory={() => setShowHistory(true)} />
            <main className="main-container">
                <InputSection />
                <OutputSection />
            </main>
            <Footer />
            <AboutModal />
            <HistoryModal show={showHistory} onClose={() => setShowHistory(false)} sessionId={sessionId} />
        </div>
    );
};