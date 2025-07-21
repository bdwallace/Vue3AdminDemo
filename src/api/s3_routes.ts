import {http} from "@/utils/http";


type Result = {
  code: number;
  msg: string;
  data: Array<any>;
  total: number;
  username: string;
};


export const getS3Data = (data?: object) => {
  return http.request<Result>("get", "/middle/s3", data);
};

export const create_s3_bucket = (data?: object) => {
  return http.request<Result>("post", "/middle/s3", data);
};

export const delete_s3_bucket = (data?: object) => {
  return http.request<Result>("delete", "/middle/s3", data);
};


export const get_bucket_policy = (data?: object) => {
  return http.request<Result>("get", "/middle/s3/config", data);
};

export const edit_bucket_policy = (data?: object) => {
  return http.request<Result>("put", "/middle/s3", data);
};

export const get_bucket_cors = (data?: object) => {
  return http.request<Result>("get", "/middle/s3/cors", data);
};

export const edit_bucket_cors = (data?: object) => {
  return http.request<Result>("put", "/middle/s3/cors", data);
};

