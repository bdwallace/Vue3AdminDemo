import { http } from "@/utils/http";

type Result = {
  code: number;
  msg?: string;
  data?: any;
  total?: number;
};

/** 获取域名列表 */
export const getDomainList = (data?: object) => {
  return http.request<Result>("get", "/domain/domains/list", data);
};

/** 同步域名信息 */
export const syncDomain = (data?: object) => {
  return http.request<Result>("post", "/domain/sync", data);
};

/** 编辑域名信息 */
export const updateDomain = (data?: object) => {
  return http.request<Result>("put", "/domain/domains/list", data);
};

/** 新增域名 */
export const addDomain = (data?: object) => {
  return http.request<Result>("post", "/domain/domains/list", data);
};

export const deleteDomain = (data?: object) => {
  return http.request<Result>("delete", "/domain/domains/list", data);
};

/** 同步域名解析记录 */
export const syncDomainRecord = (data?: object) => {
  return http.request<Result>("get", "/domain/records/sync", data);
};

/** 获取域名解析记录列表 */
export const getDomainRecords = (data?: object) => {
  return http.request<Result>("get", "/domain/records", data);
};

/** 添加域名解析记录 */
export const addDomainRecord = (data?: object) => {
  return http.request<Result>("post", "/domain/records", data);
};

/** 修改域名解析记录 */
export const updateDomainRecord = (data?: object) => {
  return http.request<Result>("put", "/domain/records", data);
};

/** 删除域名解析记录 */
export const deleteDomainRecord = (data?: object) => {
  return http.request<Result>("delete", "/domain/records", data);
};

