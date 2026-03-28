import React, { useState, useCallback, useMemo } from 'react';
import TriageForm from './components/TriageForm';
import ActionPlanDisplay from './components/ActionPlanDisplay';
import MapEmbed from './components/MapEmbed';
import { runTriageIntelligence } from './services/geminiService';

/**
 * Enterprise Main Application Component
 */
const App = () => {
  const [globalData, setGlobalData] = useState({
    actionPlan: null,
    dispatchData: null,
    error: null,
    isLoading: false,
  });

  // Derived state to heavily optimize render bounds
  const isLoaded = useMemo(() => !!globalData.actionPlan && !globalData.isLoading, [globalData.actionPlan, globalData.isLoading]);

  // Unified submit handler passed via Context/Props
  const handleEmergencySubmit = useCallback(async ({ text, file }) => {
    setGlobalData(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await runTriageIntelligence(text, file);
      
      setGlobalData({
        actionPlan: response.actionPlan,
        dispatchData: response.dispatchData,
        isLoading: false,
        error: null,
      });

    } catch (err) {
      setGlobalData(prev => ({ ...prev, isLoading: false, error: err.message || 'System Failure. Code Red.' }));
    }
  }, []);

  return (
    <main tabIndex="-1" aria-label="MediBridge AI Main Dashboard">
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1>MediBridge <span>AI</span></h1>
        <p style={{ color: 'var(--gray)', fontSize: '1.2rem' }}>Rapid Emergency Incident & Medical Triage System</p>
      </header>
      
      {globalData.error && (
        <div className="card" style={{ borderColor: 'var(--red)', borderWidth: '2px', borderStyle: 'solid' }}>
          <h2 style={{ color: 'var(--red)' }}>Critical Error Processing Request</h2>
          <p>{globalData.error}</p>
        </div>
      )}

      {/* Main input form */}
      <TriageForm onSubmit={handleEmergencySubmit} isLoading={globalData.isLoading} />

      {/* Loading state leveraging semantic polite aria-live */}
      <div aria-live="polite" aria-atomic="true" style={{ textAlign: 'center', margin: '2rem 0' }}>
        {globalData.isLoading && <p><strong>🚨 Connecting to Neural Field Dispatch... analyzing severity...</strong></p>}
      </div>

      {/* Structured Output Presentation Container */}
      {isLoaded && (
        <React.Fragment>
          <ActionPlanDisplay 
            actionPlan={globalData.actionPlan} 
            dispatchData={globalData.dispatchData} 
          />
          <MapEmbed location={globalData.dispatchData?.location || 'Unknown'} />
        </React.Fragment>
      )}

      <footer style={{ textAlign: 'center', marginTop: '3rem', paddingTop: '1rem', borderTop: '1px solid var(--navy-light)', color: 'var(--gray)' }} aria-label="Footer MediBridge Info">
        <p><small>&copy; {new Date().getFullYear()} MediBridge AI. For life-threatening emergencies, dial local authorities.</small></p>
      </footer>
    </main>
  );
};

export default App;
