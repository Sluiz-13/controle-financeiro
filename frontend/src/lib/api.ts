import axios from 'axios'
import { appendFileSync } from 'fs'

const api = axios.create({
  baseURL:import.meta.env.VITE_API_URL,
  withCredentials: true
})

export default api 