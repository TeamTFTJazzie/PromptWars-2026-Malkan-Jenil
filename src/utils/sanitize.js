import DOMPurify from 'dompurify';

/**
 * Sanitizes potentially malicious HTML content for safe rendering
 * @param {string} dirtyHtml - The untrusted HTML content string
 * @returns {string} Sanitized string safe to inject in dangerouslySetInnerHTML
 */
export const sanitizeHtml = (dirtyHtml) => {
  if (typeof dirtyHtml !== 'string') return '';
  
  return DOMPurify.sanitize(dirtyHtml, {
    // Only allow safe, basic tags for Action Plans
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'ul', 'ol', 'li', 'p', 'br', 'h2', 'h3'],
    ALLOWED_ATTR: []
  });
};
