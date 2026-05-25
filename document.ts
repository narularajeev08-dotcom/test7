'use server';

/**
 * @fileOverview Strategic Document Proxy
 * Bypasses browser CORS restrictions by fetching architectural deliverables server-side.
 */

export async function fetchDocumentBinary(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/pdf'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch architectural stream: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    
    // Return as a Data URI for direct injection into PDF.js
    return `data:application/pdf;base64,${base64}`;
  } catch (error) {
    console.error('Server Proxy Error:', error);
    throw new Error('Technical delivery restricted by vault policy.');
  }
}
