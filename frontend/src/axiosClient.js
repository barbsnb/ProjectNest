import axios from "axios";

const defaultApiUrl = `${window.location.protocol}//${window.location.hostname}:8000`;

const client = axios.create({
  baseURL: process.env.REACT_APP_API_URL || defaultApiUrl,
  withCredentials: true,
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
});

client.interceptors.request.use((config) => {
  const token = window.localStorage.getItem("praetorAuthToken");
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export default client;
