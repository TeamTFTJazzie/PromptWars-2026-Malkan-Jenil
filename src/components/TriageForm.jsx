import React, { useState, useCallback, useRef } from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { isValidEmergencyText, isValidImageFile } from '../utils/validation';

/**
 * Form to capture chaotic inputs across text, voice, and multimodal images
 * @param {Object} props
 * @param {Function} props.onSubmit - Callback combining validated text and file
 * @param {boolean} props.isLoading - Current submission state
 */
const TriageForm = ({ onSubmit, isLoading }) => {
  const [textVal, setTextVal] = useState('');
  const [fileVal, setFileVal] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  
  const fileInputRef = useRef(null);
  
  // Custom hook for speech API
  const { text: speechText, isListening, startListening, stopListening, resetText, error: speechErr } = useSpeechRecognition();

  // Handle textual changes natively
  const handleTextChange = useCallback((e) => {
    setTextVal(e.target.value);
    setErrorMsg('');
  }, []);

  // Handle file uploads natively
  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file && !isValidImageFile(file)) {
      setErrorMsg('Invalid file type or size. Use max 5MB JPG/PNG/WEBP.');
      setFileVal(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } else {
      setFileVal(file);
      setErrorMsg('');
    }
  }, []);

  // Sync speech recognition text into main textVal state when it updates
  React.useEffect(() => {
    if (speechText) {
      setTextVal(prev => prev + ' ' + speechText);
      resetText(); // Clear the hook's text so it doesn't double-append
    }
  }, [speechText, resetText]);

  // Main Submit handler using useCallback performance pattern
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    // Fallback if the user submitted totally empty text/speech and no file
    const combinedInput = textVal.trim();
    if (!combinedInput && !fileVal) {
      setErrorMsg('Please describe the emergency or provide a photo context.');
      return;
    }

    if (combinedInput && !isValidEmergencyText(combinedInput)) {
      setErrorMsg('Invalid text payload or script tag detected. Keep it 5 to 1000 characters and free of script/sql elements.');
      return;
    }

    onSubmit({ text: combinedInput, file: fileVal });
  }, [textVal, fileVal, onSubmit]);

  return (
    <section className="card">
      <h2>Report Emergency</h2>
      <form onSubmit={handleSubmit} noValidate>
        
        {/* Text Area Input */}
        <label htmlFor="emergencyDesc" className="visually-hidden" style={{display: 'none'}}>Describe Emergency</label>
        <textarea
          id="emergencyDesc"
          rows="4"
          placeholder="Type or use Voice Dictation to report incident ('Car crash...', 'Burns leg...')"
          value={textVal}
          onChange={handleTextChange}
          disabled={isLoading}
          aria-required="true"
        />

        {/* Voice Dictation Controls */}
        <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            type="button"
            className="btn"
            style={{ backgroundColor: isListening ? 'var(--navy)' : 'var(--navy-light)', border: '1px solid var(--gray)' }}
            onClick={isListening ? stopListening : startListening}
            disabled={isLoading}
            aria-pressed={isListening}
          >
            {isListening ? (
              <>
                <svg className="icon" viewBox="0 0 24 24"><path d="M12 2C10.89 2 10 2.89 10 4V14C10 15.11 10.89 16 12 16C13.11 16 14 15.11 14 14V4C14 2.89 13.11 2 12 2ZM6 14C6 17.31 8.69 20 12 20C15.31 20 18 17.31 18 14H20C20 18.28 16.72 21.72 12.5 21.93V25H11.5V21.93C7.28 21.72 4 18.28 4 14H6Z"/></svg>
                Stop Recording
              </>
            ) : (
              <>
                <svg className="icon" viewBox="0 0 24 24"><path d="M12 14C13.66 14 15 12.66 15 11V5C15 3.34 13.66 2 12 2C10.34 2 9 3.34 9 5V11C9 12.66 10.34 14 12 14ZM17 11C17 13.76 14.76 16 12 16C9.24 16 7 13.76 7 11H5C5 14.53 7.61 17.43 11 17.92V21H13V17.92C16.39 17.43 19 14.53 19 11H17Z"/></svg>
                Use Voice Data
              </>
            )}
          </button>
          
          <span aria-live="polite" style={{ fontSize: '0.875rem', color: 'var(--red)' }}>
            {speechErr && speechErr}
          </span>
        </div>

        {/* Multimodal Photo Input */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="emergencyPhoto" className="visually-hidden" style={{display: 'none'}}>Upload Context Photo</label>
          <input 
            type="file"
            id="emergencyPhoto"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            ref={fileInputRef}
            disabled={isLoading}
            aria-label="Upload Context Photo"
          />
          <small style={{ color: 'var(--gray)', display: 'block' }}>Max 5MB (JPG, PNG, WEBP)</small>
        </div>

        {/* Local Form Error */}
        {errorMsg && <strong className="error-text" role="alert">{errorMsg}</strong>}

        {/* Action Trigger */}
        <button 
          type="submit" 
          className="btn" 
          disabled={isLoading}
          style={{ width: '100%', padding: '1rem', fontSize: '1.2rem' }}
          aria-live="polite"
        >
          {isLoading ? (
            <>
              <svg className="icon" style={{ animation: 'spin 1s linear infinite' }} viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM11 7H13V13H11V7ZM11 15H13V17H11V15Z"/></svg>
              Processing Neural Intel ⏳
            </>
          ) : (
            <>
               <svg className="icon" viewBox="0 0 24 24"><path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM11 17H13V13H17V11H13V7H11V11H7V13H11V17Z"/></svg>
              Dispatch Emergency Triage
            </>
          )}
        </button>
      </form>
    </section>
  );
};

export default React.memo(TriageForm);
