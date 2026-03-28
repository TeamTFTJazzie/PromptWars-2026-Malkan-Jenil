import { describe, it, expect } from 'vitest';
import { isValidEmergencyText, isValidImageFile } from '../utils/validation';

describe('isValidEmergencyText Validation Utility', () => {
  it('rejects short inputs under 5 characters', () => {
    expect(isValidEmergencyText('hi')).toBe(false);
  });
  
  it('accepts valid emergency strings within lengths', () => {
    expect(isValidEmergencyText('Severe car crash at Main St., three injured.')).toBe(true);
  });
  
  it('rejects script tag injection attempts', () => {
    expect(isValidEmergencyText('I am hurt <script>alert(1)</script> bad')).toBe(false);
  });

  it('rejects naive SQL injection attempts', () => {
    expect(isValidEmergencyText('SELECT * FROM users; DROP TABLE admin;')).toBe(false);
  });
});

describe('isValidImageFile Validation Utility', () => {
  it('rejects null objects gracefully', () => {
    expect(isValidImageFile(null)).toBe(false);
  });

  it('rejects non-whitelisted mime types', () => {
    const invalidFile = { type: 'application/pdf', size: 1024 };
    expect(isValidImageFile(invalidFile)).toBe(false);
  });

  it('accepts whitelisted mime types under size', () => {
    const validFile = { type: 'image/jpeg', size: 1024 };
    expect(isValidImageFile(validFile)).toBe(true);
  });
});
