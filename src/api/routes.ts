import { http } from "@/utils/http";

type Result = {
  success: boolean;
  data: Array<any>;
};

export const getAsyncRoutes = () => {
  return http.request<Result>("get", "/get-async-routes");
};


export const getRouteData = (data?: object) => {
  return http.request<Result>("get", "/network/routes_table", data);
};
