import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3001/api'||import.meta.env.BACKEND_URL + '/api'
});

API.interceptors.request.use((req) => {

  const token = localStorage.getItem('token');

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

export default API;