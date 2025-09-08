// import axios from 'axios';


// export const axiosInstance = axios.create({
//     headers: {
//         Authorization: `Bearer ${localStorage.getItem('token')}`
//     }
// });


import axios from "axios";

// Local backend URL (no trailing slash)
export const url = "http://localhost:5000";

// Create Axios instance
export const axiosInstance = axios.create({
  baseURL: url,
});

// Attach token dynamically for every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      // Always lowercase for compatibility with Express
      config.headers.authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
