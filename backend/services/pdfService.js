import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

/**
 * Extracts raw text from a PDF buffer (from multer memory storage).
 * @param {Buffer} buffer - The PDF file buffer
 * @returns {Promise<string>} Raw extracted text
 */
export const extractTextFromPDF = async (buffer) => {
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to parse PDF document.');
  }
};

/**
 * Smart Chunker — Splits large text into overlapping segments to stay within LLM context windows.
 * Uses natural sentence/paragraph boundaries for clean splits.
 * 
 * @param {string} text - Raw extracted text
 * @param {number} maxChars - Max characters per chunk (default 4000 ≈ ~1000 tokens)
 * @param {number} overlap - Overlap in chars to preserve context continuity
 * @returns {string[]} Array of text chunks
 */
export const chunkText = (text, maxChars = 4000, overlap = 300) => {
  if (!text || text.length === 0) return [];

  const chunks = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    let endIndex = startIndex + maxChars;

    if (endIndex < text.length) {
      // Prefer to break at paragraph or sentence boundary
      const lastNewline = text.lastIndexOf('\n', endIndex);
      const lastPeriod = text.lastIndexOf('.', endIndex);
      const naturalBreak = Math.max(lastPeriod, lastNewline);

      if (naturalBreak > startIndex + maxChars / 2) {
        endIndex = naturalBreak + 1;
      }
    } else {
      endIndex = text.length;
    }

    const chunk = text.slice(startIndex, endIndex).trim();
    if (chunk.length > 50) { // Skip tiny useless chunks
      chunks.push(chunk);
    }

    startIndex = endIndex - overlap;
    if (startIndex >= endIndex) startIndex = endIndex; // safety guard
  }

  return chunks;
};
