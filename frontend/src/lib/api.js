import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rb_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const setToken = (token) => {
  if (token) localStorage.setItem('rb_token', token);
  else localStorage.removeItem('rb_token');
};

export const setUser = (user) => {
  if (user) localStorage.setItem('rb_user', JSON.stringify(user));
  else localStorage.removeItem('rb_user');
};

export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem('rb_user') || 'null');
  } catch {
    return null;
  }
};

export const formatToman = (num) => {
  const n = Number(num || 0);
  return n.toLocaleString('fa-IR') + ' تومان';
};
