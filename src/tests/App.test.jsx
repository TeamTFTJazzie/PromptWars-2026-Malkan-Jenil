import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../App';
import * as geminiService from '../services/geminiService';

// Mock Web Speech hook
vi.mock('../hooks/useSpeechRecognition', () => ({
  useSpeechRecognition: () => ({
    text: '',
    isListening: false,
    startListening: vi.fn(),
    stopListening: vi.fn(),
    resetText: vi.fn(),
    error: null,
  })
}));

describe('MediBridge AI Integration Tests', () => {
  
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders strictly complete semantic tree and ARIA labels', () => {
    render(<App />);
    
    // Core Layout Semantics mapping
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo', { name: /Footer MediBridge Info/i })).toBeInTheDocument(); // The footer

    // Button Aria labels & text
    expect(screen.getByRole('button', { name: /Dispatch Emergency Triage/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Use Voice Data/i })).toBeInTheDocument();
  });

  it('handles Input Validation edge cases restricting invalid formats natively', async () => {
    render(<App />);
    
    const textArea = screen.getByPlaceholderText(/Type or use Voice Dictation/i);
    const submitBtn = screen.getByRole('button', { name: /Dispatch Emergency Triage/i });
    
    // Submit empty bounds
    fireEvent.click(submitBtn);
    expect(screen.getByText('Please describe the emergency or provide a photo context.')).toBeInTheDocument();

    // Submit script injection bounds
    fireEvent.change(textArea, { target: { value: 'Bad script <script>alert(1)</script>' } });
    fireEvent.click(submitBtn);
    expect(screen.getByText(/Invalid text payload or script tag detected/i)).toBeInTheDocument();
  });

  it('handles AI output format validation properly intercepting nested Action Plans', async () => {
    // Mock the external AI service
    const mockTriageResponse = {
      actionPlan: '<h3>Mock Plan</h3><ul><li>Stay Secure</li></ul>',
      dispatchData: { urgency: 'High', suggestedUnit: 'Ambulance', location: '123 Safe St' }
    };
    
    vi.spyOn(geminiService, 'runTriageIntelligence').mockResolvedValue(mockTriageResponse);
    
    render(<App />);
    const textArea = screen.getByPlaceholderText(/Type or use Voice Dictation/i);
    const submitBtn = screen.getByRole('button', { name: /Dispatch Emergency Triage/i });
    
    // Valid text trigger
    fireEvent.change(textArea, { target: { value: 'Valid emergency happened here.' } });
    fireEvent.click(submitBtn);
    
    expect(screen.getByText(/Processing Neural Intel/i)).toBeInTheDocument();
    
    // Wait for async response mapping the derived ARIA/Semantics into the UI
    await waitFor(() => {
      expect(screen.getByText('Mock Plan')).toBeInTheDocument();
      expect(screen.getByTitle('Google Maps embed for 123 Safe St')).toBeInTheDocument(); // Map embed fallback parameter mapping
    });
  });

  it('handles robust Error Handling paths gracefully on system crash', async () => {
    // Force a mock failure
    vi.spyOn(geminiService, 'runTriageIntelligence').mockRejectedValue(new Error('AI Core Integrity Failure'));
    
    render(<App />);
    const textArea = screen.getByPlaceholderText(/Type or use Voice Dictation/i);
    const submitBtn = screen.getByRole('button', { name: /Dispatch Emergency Triage/i });
    
    fireEvent.change(textArea, { target: { value: 'Something bad happened.' } });
    fireEvent.click(submitBtn);
    
    await waitFor(() => {
      expect(screen.getByText('AI Core Integrity Failure')).toBeInTheDocument();
      expect(screen.getByText('Critical Error Processing Request')).toBeInTheDocument();
    });
  });
});
