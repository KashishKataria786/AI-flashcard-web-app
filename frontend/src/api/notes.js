// src/api/notes.js
import API from './api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Fetch all study notes for the current user
 */
export const fetchNotesAPI = async () => {
  try {
    const response = await API.get('/notes', {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Error occurred');
  }
};

/**
 * Fetch a single note by ID
 */
export const fetchNoteByIdAPI = async (noteId) => {
  try {
    const response = await API.get(`/notes/${noteId}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Error occurred');
  }
};

/**
 * Generate notes from a PDF (Restored for convenience)
 */
export const generateNoteFromPDFAPI = async (file, noteTitle = '') => {
  const formData = new FormData();
  formData.append('pdf', file);
  formData.append('noteTitle', noteTitle || file.name.replace(/\.pdf$/i, ''));

  try {
    const response = await API.post('/notes/pdf', formData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Error occurred');
  }
};

/**
 * Generate notes from raw text
 */
export const generateNoteFromTextAPI = async (text, noteTitle = 'Untitled Note') => {
  try {
    const response = await API.post('/notes/text', {
      text,
      noteTitle
    }, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Error occurred');
  }
};

/**
 * Delete a note
 */
export const deleteNoteAPI = async (noteId) => {
  try {
    const response = await API.delete(`/notes/${noteId}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Error occurred');
  }
};
