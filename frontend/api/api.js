import api from "./base";
import axios from 'axios';

const BASE = import.meta.env.VITE_API;
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
  createAddress(newAddress) {
    return api.post(`${BASE_DETAIL}/add`, newAddress)
  },
  getAllAddress() {
    return api.get(`${BASE_DETAIL}/`);
  },

  getDefaultAddress() {
    return api.get(`${BASE_DETAIL}/default`);
  },

  updateAddress(id, data) {
    return api.post(`${BASE_DETAIL}/edit/${id}`, data);
  },

  deleteAddress(id) {
    return api.delete(`${BASE_DETAIL}/delete/${id}`);
  },

  setDefaultAddress(id) {
    return api.patch(`${BASE_DETAIL}/default/${id}`);
  }
};

