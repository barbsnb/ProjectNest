// axiosClient.js
import axios from 'axios';

const client = axios.create({
  baseURL: "http://127.0.0.1:8000",
  withCredentials: true,
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
});

export default client;
