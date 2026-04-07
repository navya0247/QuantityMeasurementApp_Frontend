import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import MeasureView from '../components/MeasureView';
import HistoryView from '../components/HistoryView';
import ProfileView from '../components/ProfileView';
import './DashboardPage.css';

export default function DashboardPage() {
  const [activeView, setActiveView] = useState('measure');
  const [selectedType, setSelectedType] = useState(null);
  const [history, setHistory] = useState([]);

  const addHistory = (item) => {
    setHistory(prev => [item, ...prev].slice(0, 50));
  };

  const clearHistory = () => setHistory([]);

  const handleQuickType = (type) => {
    setSelectedType(type);
    setActiveView('measure');
  };

  return (
    <div className="dashboard-layout">
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        histCount={history.length}
        onQuickType={handleQuickType}
        selectedType={selectedType}
      />
      <main className="dashboard-content">
        {activeView === 'measure' && (
          <MeasureView
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            onAddHistory={addHistory}
            history={history}
          />
        )}
        {activeView === 'history' && (
          <HistoryView history={history} onClear={clearHistory} />
        )}
        {activeView === 'profile' && (
          <ProfileView history={history} />
        )}
      </main>
    </div>
  );
}
