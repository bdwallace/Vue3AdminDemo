import {http} from "@/utils/http";


type Result = {
  code: number;
  msg: string;
  data: Array<any>;
  total: number;
  username: string;
};


export const getVpcData = (data?: object) => {
  return http.request<Result>("get", "/network/vpc", data);
};


