import { jwtDecode } from "jwt-decode";

const setToken = (token) => {
    localStorage.setItem("token", token);
};

const getToken = () => {
    const token = localStorage.getItem("token");
    return token;
};

const removeToken = () => {
  localStorage.removeItem("token");
};


const deleteToken = () => {
    localStorage.Item("token");
};

const checkToken = () => {
    const token = getToken();
    if (token) {
        const decode = jwtDecode(token);
        const cureentTime = Date.now() / 1000;
        if (decode.exp < cureentTime) {
            deleteToken();
            return false;
        }
        return true;
    }
    return false;
};

const storeToken = (token) => {
    if (token) {
      localStorage.setItem("token", token);
    }
  };

export { storeToken, removeToken, deleteToken, getToken, setToken, checkToken };