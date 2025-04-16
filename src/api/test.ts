import { http } from "@/utils/http";



export const getSupplier = (data?: object) => {
  return http.request("get", "/cloud/supplier", { data });
};

export const addSupplier = (data?: object) => {
  return http.request("post", "/login", { data });
};
