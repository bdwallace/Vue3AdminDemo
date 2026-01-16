import { http } from "@/utils/http";

type Result = {
  code: number;
  msg?: string;
  data?: any;
  total?: number;
};

/** 获取操作日志列表 */
export const getAuditLogList = (data?: object) => {
  return http.request<Result>("get", "/auditlog/list", data);
};

