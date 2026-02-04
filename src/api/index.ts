import { http } from "@/utils/http";

type Result = {
  code: number;
  msg?: string;
  data?: any;
  total?: number;
};

/** 获取首页数据 */
export const getIndexData = (data?: object) => {
  return http.request<Result>("get", "/domain/index", data);
};


