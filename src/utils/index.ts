/**
 * Ehmonitor 业务 API 使用的 axios 实例（与 @/utils/http 的 PureHttp 分离）
 * baseURL：/api/v1/ehmonitor，由 vite proxy /api/v1 转发
 */
import axios from "axios";
import Cookie from "js-cookie";

const instance = axios.create({
  baseURL: "/api/v1/ehmonitor"
});

instance.interceptors.request.use(
  config => {
    const token = Cookie.get("token");
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  error => Promise.reject(error)
);

instance.interceptors.response.use(
  response => {
    const data = response.data;
    if (data && data.code === 401) {
      console.log("禁止访问", data);
      window.location.href = "https://ab-sso.bssrvc66.com";
      return data;
    }
    return response.status === 200
      ? Promise.resolve(data)
      : Promise.reject(response.status);
  },
  error => {
    if (error) console.log(error);
    return Promise.reject(error);
  }
);

export default instance;
