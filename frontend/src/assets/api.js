import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000", // ajuste a porta se necessário
});

export default api;
