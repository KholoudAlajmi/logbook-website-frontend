import instance from ".";
import { storeToken } from "./storage";

const login = async (formData) => {
  const data = await instance.post("/auth/login", formData);
  localStorage.setItem("token", data.token);
  console.log("login data", data)
  return data;
};

const me = async () => {
  const { data } = await instance.get("/auth/me");
  return data;
};

const getAllAdmins = async () => {
  const { data } = await instance.get("/auth/admins");
  return data;
};

export { login, me, getAllAdmins };
