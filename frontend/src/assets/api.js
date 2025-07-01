import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // ajuste a porta se necessário
});

export default api;
