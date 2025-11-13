import axios from "axios";
import Swal from "sweetalert2";

const api = axios.create({
  withCredentials: false
});

// Attach token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401: clear token and redirect
api.interceptors.response.use(
  res => res,
  async err => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      await Swal.fire({
        text: "Session expired or unauthorized. Please log in again.",
        icon: "warning",
        showCancelButton: false,
        confirmButtonText: "OK",
        width: "300px",
      });
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
