import {http} from "@/utils/http";


type Result = {
  code: number;
  msg: string;
  data: Array<any>;
  total: number;
  username: string;
};


export const getRedisData = (data?: object) => {
  return http.request<Result>("get", "/middle/elasticache", data);
};

