import axios from "axios";


const instance = axios.create({
  baseURL: "", 
});

instance.interceptors.response.use((response) => {
  return response.data;
});


instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
export default instance;