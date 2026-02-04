import { http } from "@/utils/http";

type Result = {
  code: number;
  msg?: string;
  data?: any;
  total?: number;
};

export const getBusinessLineList = (data?: object) => {
  return http.request<Result>("get", "/domain/appcenter", data);
};

export const syncBusinessLine = (data?: object) => {
  return http.request<Result>("post", "/domain/appcenter", data);
};