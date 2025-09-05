import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * Allows basic markdown and safe HTML tags
 */
export function sanitizeHTML(dirty: string): string {
  // Configure DOMPurify to allow only safe tags
  const config = {
    ALLOWED_TAGS: [
      'b', 'i', 'em', 'strong', 'a', 'p', 'br',
      'ul', 'ol', 'li', 'blockquote', 'code', 'pre',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'img', 'hr', 'span', 'div'
    ],
    ALLOWED_ATTR: [
      'href', 'title', 'target', 'rel', 'src', 'alt',
      'class', 'id', 'style'
    ],
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    SAFE_FOR_TEMPLATES: true,
    // Only allow http(s) and relative URLs
    ALLOWED_URI_REGEXP: /^(?:(?:https?:)?\/\/|[^:/?#]*(?:[/?#]|$))/i,
    // Sanitize style attributes
    SANITIZE_DOM: true,
    // Remove dangerous attributes
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
    // Remove script tags completely
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'textarea'],
  };

  return DOMPurify.sanitize(dirty, config);
}

/**
 * Sanitize plain text input (for comments, etc)
 */
export function sanitizeText(text: string): string {
  // Remove any HTML tags and dangerous characters
  return DOMPurify.sanitize(text, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true 
  });
}

/**
 * Validate and sanitize URLs
 */
export function sanitizeURL(url: string): string | null {
  try {
    const parsed = new URL(url);
    // Only allow http(s) protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }
    return parsed.toString();
  } catch {
    // If not a valid URL, check if it's a relative path
    if (url.startsWith('/') && !url.includes('//')) {
      return sanitizeText(url);
    }
    return null;
  }
}

/**
 * Validate content length
 */
export function validateContentLength(content: string, maxLength: number = 5000): boolean {
  return content.length <= maxLength && content.trim().length > 0;
}