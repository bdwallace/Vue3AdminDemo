import { http } from "@/utils/http";

type Result = {
  code: number;
  msg?: string;
  data?: any;
  total?: number;
};

/** 获取供应商账号列表 */
export const getSupplierAccountList = (data?: object) => {
  return http.request<Result>("get", "/account/supplier/list", data);
};

/** 新增供应商账号 */
export const addSupplierAccount = (data?: object) => {
  return http.request<Result>("post", "/account/supplier/add", data);
};

/** 编辑供应商账号 */
export const updateSupplierAccount = (data?: object) => {
  return http.request<Result>("put", "/account/supplier/update", data);
};

/** 删除供应商账号 */
export const deleteSupplierAccount = (data?: object) => {
  return http.request<Result>("delete", "/account/supplier/delete", data);
};

/** 同步供应商账号数据 */
export const syncSupplierAccount = (data?: object) => {
  return http.request<Result>("post", "/account/supplier/sync", data);
};

/** 检测供应商账号 */
export const checkSupplierAccount = (data?: object) => {
  return http.request<Result>("post", "/account/supplier/check", data);
};

/** 获取托管商账号列表 */
export const getHostingAccountList = (data?: object) => {
  return http.request<Result>("get", "/account/hosting/list", data);
};

/** 新增托管商账号 */
export const addHostingAccount = (data?: object) => {
  return http.request<Result>("post", "/account/hosting/add", data);
};

/** 编辑托管商账号 */
export const updateHostingAccount = (data?: object) => {
  return http.request<Result>("put", "/account/hosting/update", data);
};

/** 删除托管商账号 */
export const deleteHostingAccount = (data?: object) => {
  return http.request<Result>("delete", "/account/hosting/delete", data);
};

/** 同步托管商账号数据 */
export const syncHostingAccount = (data?: object) => {
  return http.request<Result>("post", "/account/hosting/sync", data);
};

/** 检测托管商账号 */
export const checkHostingAccount = (data?: object) => {
  return http.request<Result>("post", "/account/hosting/check", data);
};

