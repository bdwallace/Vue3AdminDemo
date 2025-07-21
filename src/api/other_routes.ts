import {http} from "@/utils/http";


type Result = {
  code: number;
  msg: string;
  data: Array<any>;
  total: number;
  username: string;
};

export const getUserData = (data?: object) => {
  return http.request<Result>("get", "/other/users", data);
};


export const getProcessData = (data?: object) => {
  return http.request<Result>("get", "/other/process", {...data});
};

export const cancelApproval = (data?: object) => {
  return http.request<Result>("delete", "/other/process", data);
};


export const getLogData = (data?: object) => {
  return http.request<Result>("get", "/other/log", data);
};

export const getSupplierData = (data?: object) => {
  return http.request<Result>("get", "/other/supplier", data);
};

export const getAppData = (data?: object) => {
  return http.request<Result>("get", "/other/app", data);
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

export const getApprovalEvent = (data?: object) => {
  return http.request<Result>("get", "/other/approval/setting", data);
};

export const updateApprovalEvent = (data?: object) => {
  return http.request<Result>("put", "/other/approval/setting", data);
};

export const addApprovalEvent = (data?: object) => {
  return http.request<Result>("post", "/other/approval/setting", data);
};

export const deleteApprovalEvent = (data?: object) => {
  return http.request<Result>("delete", "/other/approval/setting", data);
};

export const approvalProcess = (data?: object) => {
  return http.request<Result>("post", "/other/approval", data);
};


export const getIndexData = (data?: object) => {
  return http.request<Result>("get", "/other/index", data);
};

