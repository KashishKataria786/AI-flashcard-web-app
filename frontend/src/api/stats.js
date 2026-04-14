import API from './api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Fetch global analytics stats for the user.
 */
export const fetchGlobalStatsAPI = async () => {
  try {
    const response = await API.get('/stats/global', {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Error occurred');
  }
};

/**
 * Fetch stats for a specific deck.
 */
export const fetchDeckStatsAPI = async (deckId) => {
  try {
    const response = await API.get(`/stats/deck/${deckId}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Error occurred');
  }
};
/**
 * Fetch heatmap data (last 6 months).
 */
export const fetchHeatmapAPI = async () => {
  try {
    const response = await API.get('/stats/heatmap', {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Error occurred');
  }
};
