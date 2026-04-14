// src/api/decks.js
// API layer for ingestion and deck management

import API from './api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Upload a PDF and generate flashcards.
 * @param {File} file - The PDF file object
 * @param {number} targetCount - 10 | 20 | 50
 * @param {string} deckTitle - Optional custom title
 */
export const uploadPDFAPI = async (file, targetCount = 10, deckTitle = '') => {
  const formData = new FormData();
  formData.append('pdf', file);
  formData.append('targetCount', String(targetCount));
  formData.append('deckTitle', deckTitle || file.name.replace(/\.pdf$/i, ''));

  try {
    const response = await API.post('/ingestion/pdf', formData, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Error occurred');
  }
};

/**
 * Upload a PDF to strictly extract its text. Will NOT generate cards.
 * @param {File} file - The PDF file object
 */
export const parsePDFOnlyAPI = async (file) => {
  const formData = new FormData();
  formData.append('pdf', file);

  try {
    const response = await API.post('/ingestion/parse-pdf', formData, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Error occurred');
  }
};

/**
 * Upload text and generate flashcards.
 * @param {string} text - The raw text input
 * @param {number} targetCount - 10 | 20 | 50
 * @param {string} deckTitle - Optional custom title
 */
export const uploadTextAPI = async (text, targetCount = 10, deckTitle = '') => {
  try {
    const response = await API.post('/ingestion/text', {
      text,
      targetCount: String(targetCount),
      deckTitle
    }, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Error occurred');
  }
};

/**
 * Fetch all decks for the current user
 */
export const fetchDecksAPI = async () => {
  try {
    const response = await API.get('/decks', {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Error occurred');
  }
};

/**
 * Fetch cards due for review in a specific deck
 */
export const fetchDueCardsAPI = async (deckId) => {
  try {
    const response = await API.get(`/reviews/${deckId}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Error occurred');
  }
};

/**
 * Submit a review rating for a card
 */
export const submitReviewAPI = async (cardId, deckId, rating) => {
  try {
    const response = await API.post(`/reviews/${cardId}`, {
      deckId,
      rating
    }, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Error occurred');
  }
};

/**
 * Regenerate an entire deck.
 * @param {string} deckId - The deck ID
 */
export const regenerateDeckAPI = async (deckId) => {
  try {
    const response = await API.post(`/decks/${deckId}/regenerate`, {}, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Error occurred');
  }
};

/**
 * Delete a deck.
 * @param {string} deckId - The deck ID
 */
export const deleteDeckAPI = async (deckId) => {
  try {
    const response = await API.delete(`/decks/${deckId}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Error occurred');
  }
};
/**
 * Export a deck to PDF.
 * @param {string} deckId - The deck ID
 */
export const exportDeckAPI = async (deckId) => {
  try {
    const response = await API.get(`/decks/${deckId}/export`, {
      headers: getAuthHeaders(),
      responseType: 'blob' // Important for binary data
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Error occurred during export');
  }
};
