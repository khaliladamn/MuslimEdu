// Base URL for the Manhaje API.
// Confirmed working endpoint during Phase 1 testing:
// https://manhaje.com/apps/api/login
export const API_BASE_URL = 'https://manhaje.com/apps/api';

export const ENDPOINTS = {
  login: `${API_BASE_URL}/login`,
  me: `${API_BASE_URL}/me`,
  logout: `${API_BASE_URL}/logout`,
  logoutAll: `${API_BASE_URL}/logout-all`,
};
