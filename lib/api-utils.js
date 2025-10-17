import { NextResponse } from 'next/server';

/**
 * Safely parse JSON from request body
 * @param {Request} request - The incoming request
 * @returns {Promise<Object>} Parsed JSON or throws error
 */
export const safeParseJSON = async (request) => {
  try {
    const contentType = request.headers.get('content-type');
    
    // Check if content-type is JSON
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error(`Invalid content-type: ${contentType || 'missing'}. Expected application/json`);
    }

    const text = await request.text();
    
    // Check if body is empty
    if (!text || text.trim() === '') {
      throw new Error('Request body is empty');
    }

    // Try to parse JSON
    try {
      return JSON.parse(text);
    } catch (parseError) {
      throw new Error(`Invalid JSON format: ${parseError.message}. Body: ${text.substring(0, 100)}`);
    }
  } catch (error) {
    console.error('JSON Parse Error:', error.message);
    throw error;
  }
};

/**
 * Standard error response
 * @param {string} message - Error message
 * @param {number} status - HTTP status code
 * @returns {NextResponse}
 */
export const errorResponse = (message, status = 500) => {
  return NextResponse.json({ error: message }, { status });
};

/**
 * Standard success response
 * @param {any} data - Response data
 * @param {number} status - HTTP status code
 * @returns {NextResponse}
 */
export const successResponse = (data, status = 200) => {
  return NextResponse.json(data, { status });
};


