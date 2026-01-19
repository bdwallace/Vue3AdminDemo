import { http } from "@/utils/http";

type Result = {
  code: number;
  msg?: string;
  data?: any;
  total?: number;
};

/** 获取供应商账号列表 */
export const getSupplierAccountList = (data?: object) => {
  return http.request<Result>("get", "/domain/supplier", data);
};

/** 新增供应商账号 */
export const addSupplierAccount = (data?: object) => {
  return http.request<Result>("post", "/domain/supplier", data);
};

/** 编辑供应商账号 */
export const updateSupplierAccount = (data?: object) => {
  return http.request<Result>("put", "/domain/supplier", data);
};

/** 删除供应商账号 */
export const deleteSupplierAccount = (data?: object) => {
  return http.request<Result>("delete", "/domain/supplier", data);
};

/** 同步供应商账号数据 */
export const syncSupplierAccount = (data?: object) => {
  return http.request<Result>("post", "/domain/supplier/option", data);
};

/** 检测供应商账号 */
export const checkSupplierAccount = (data?: object) => {
  return http.request<Result>("get", "/domain/supplier/option", data);
};

/** 获取托管商账号列表 */
export const getCustodianAccountList = (data?: object) => {
  return http.request<Result>("get", "/domain/custodian", data);
};

/** 新增托管商账号 */
export const addCustodianAccount = (data?: object) => {
  return http.request<Result>("post", "/domain/custodian", data);
};

/** 编辑托管商账号 */
export const updateCustodianAccount = (data?: object) => {
  return http.request<Result>("put", "/domain/custodian", data);
};

/** 删除托管商账号 */
export const deleteCustodianAccount = (data?: object) => {
  return http.request<Result>("delete", "/domain/custodian", data);
};

/** 同步托管商账号数据 */
export const syncCustodianAccount = (data?: object) => {
  return http.request<Result>("post", "/domain/custodian/option", data);
};

/** 检测托管商账号 */
export const checkCustodianAccount = (data?: object) => {
  return http.request<Result>("get", "/domain/custodian/option", data);
};

