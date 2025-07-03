import {http} from "@/utils/http";


type Result = {
  code: number;
  msg: string;
  data: Array<any>;
  total: number;
  username: string;
};

export const getProcessData = (data?: object) => {
  return http.request<Result>("get", "/other/process", {...data});
};

export const getLogData = (data?: object) => {
  return http.request<Result>("get", "/other/log", data);
};

export const getSupplierData = (data?: object) => {
  return http.request<Result>("get", "/other/supplier", data);
};

export const addSupplierAccount = (data?: object) => {
  return http.request<Result>("post", "/other/supplier", data);
};

export const editSupplierAccount = (data?: object) => {
  return http.request<Result>("put", "/other/supplier", data);
};

export const deleteSupplierAccount = (data?: object) => {
  return http.request<Result>("delete", "/other/supplier", data);
};

export const AccountHealthCheck = (data?: object) => {
  return http.request<Result>("get", "/other/supplier/option", data);
};
