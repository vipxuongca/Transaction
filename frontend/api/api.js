import api from "./base";
import axios from 'axios';

const BASE = import.meta.env.VITE_API_USER;
const BASE_TRANSACTION = import.meta.env.VITE_API_TRANSACTION;
const BASE_REPORT = import.meta.env.VITE_API_REPORT;
const apiPublic = axios.create({
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

export const userApi = {
  // public APIs, no authentication
  login(email, password) {
    return apiPublic.post(`${BASE}/login`, { email, password });
  },

  register(email, password) {
    return apiPublic.post(`${BASE}/register`, { email, password });
  },

  // Authenticated API
  logout() {
    return api.post(`${BASE}/logout`, {});
  },

  single() {
    return api.get(`${BASE}/single`);
  }
};

export const transactionApi = {
  createTransaction(data) {
    return api.post(`${BASE_TRANSACTION}`, data);
  },

  getAllTransactions() {
    return api.get(`${BASE_TRANSACTION}`);
  },

  deleteTransaction(id) {
    return api.delete(`${BASE_TRANSACTION}/${id}`);
  },

  getReport() {
    return api.get(`${BASE_REPORT} `);
  }
};


