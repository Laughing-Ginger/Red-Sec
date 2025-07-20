import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const redactContent = (data) => apiClient.post('/redact', data);
export const getHistory = (sessionId) => apiClient.get(`/history/${sessionId}`);
export const getRedactionById = (redactionId) => apiClient.get(`/redaction/${redactionId}`);