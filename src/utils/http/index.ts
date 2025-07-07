import Axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type CustomParamsSerializer
} from "axios";
import type {
  PureHttpError,
  RequestMethods,
  PureHttpResponse,
  PureHttpRequestConfig
} from "./types.d";
import { stringify } from "qs";
import NProgress from "../progress";
import { getToken, formatToken } from "@/utils/auth";
import { useUserStoreHook } from "@/store/modules/user";
import Cookie from "js-cookie";
import { isReactive, toRaw } from 'vue'

type RequestData = Record<string, any>;
// 相关配置请参考：www.axios-js.com/zh-cn/docs/#axios-request-config-1
const defaultConfig: AxiosRequestConfig = {
  // 请求超时时间
  timeout: 10000,
  baseURL: "/api/v1",
  headers: {
    Accept: "application/json, text/plain, */*",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest"
  },
  // 数组格式参数序列化（https://github.com/axios/axios/issues/5142）
  paramsSerializer: {
    serialize: stringify as unknown as CustomParamsSerializer
  }
};

export class PureHttp {
  constructor() {
    this.httpInterceptorsRequest();
    this.httpInterceptorsResponse();
  }

  /** `token`过期后，暂存待执行的请求 */
  private static requests = [];

  /** 防止重复刷新`token` */
  private static isRefreshing = false;

  /** 初始化配置对象 */
  private static initConfig: PureHttpRequestConfig = {};

  /** 保存当前`Axios`实例对象 */
  private static axiosInstance: AxiosInstance = Axios.create(defaultConfig);

  /** 重连原始请求 */
  private static retryOriginalRequest(config: PureHttpRequestConfig) {
    return new Promise(resolve => {
      PureHttp.requests.push((token: string) => {
        config.headers["Authorization"] = formatToken(token);
        resolve(config);
      });
    });
  }

  /** 请求拦截 */
  private httpInterceptorsRequest(): void {
    PureHttp.axiosInstance.interceptors.request.use(
      async (config: PureHttpRequestConfig): Promise<any> => {
        // 开启进度条动画
        NProgress.start();
        if (Cookie.get("token")) {
          config.headers.Authorization = Cookie.get("token");
        }
        // 优先判断post/get等方法是否传入回调，否则执行初始化设置等回调
        if (typeof config.beforeRequestCallback === "function") {
          config.beforeRequestCallback(config);
          return config;
        }
        if (PureHttp.initConfig.beforeRequestCallback) {
          PureHttp.initConfig.beforeRequestCallback(config);
          return config;
        }
        /** 请求白名单，放置一些不需要`token`的接口（通过设置请求白名单，防止`token`过期后再请求造成的死循环问题） */
        const whiteList = ["/refresh-token", "/login"];
        return whiteList.some(url => config.url.endsWith(url))
          ? config
          : new Promise(resolve => {
              const data = getToken();
              if (data) {
                const now = new Date().getTime();
                const expired = parseInt(data.expires) - now <= 0;
                if (expired) {
                  if (!PureHttp.isRefreshing) {
                    PureHttp.isRefreshing = true;
                    // token过期刷新
                    useUserStoreHook()
                      .handRefreshToken({ refreshToken: data.refreshToken })
                      .then(res => {
                        const token = res.data.accessToken;
                        config.headers["Authorization"] = formatToken(token);
                        PureHttp.requests.forEach(cb => cb(token));
                        PureHttp.requests = [];
                      })
                      .finally(() => {
                        PureHttp.isRefreshing = false;
                      });
                  }
                  resolve(PureHttp.retryOriginalRequest(config));
                } else {
                  config.headers["Authorization"] = formatToken(
                    data.accessToken
                  );
                  resolve(config);
                }
              } else {
                resolve(config);
              }
            });
      },
      error => {
        return Promise.reject(error);
      }
    );
  }

  /** 响应拦截 */
  private httpInterceptorsResponse(): void {
    const instance = PureHttp.axiosInstance;
    instance.interceptors.response.use(
      (response: PureHttpResponse) => {
        const $config = response.config;
        // 关闭进度条动画
        NProgress.done();
        // 优先判断post/get等方法是否传入回调，否则执行初始化设置等回调
        if (response.data.code === 401) {
          console.log("禁止访问", response.data);
          window.location.href = "https://ab-sso.bssrvc66.com";
          return response.data;
        }
        if (typeof $config.beforeResponseCallback === "function") {
          $config.beforeResponseCallback(response);
          return response.data;
        }
        if (PureHttp.initConfig.beforeResponseCallback) {
          PureHttp.initConfig.beforeResponseCallback(response);
          return response.data;
        }
        return response.data;
      },
      (error: PureHttpError) => {
        const $error = error;
        $error.isCancelRequest = Axios.isCancel($error);
        // 关闭进度条动画
        NProgress.done();
        // 所有的响应异常 区分来源为取消请求/非取消请求
        return Promise.reject($error);
      }
    );
  }

  /** 通用请求函数（自动处理 reactive / 区分 method） */
  public request<T>(
    method: RequestMethods,
    url: string,
    payload?: RequestData,                      // 业务参数
    config?: AxiosRequestConfig               // Axios 其他配置项
  ): Promise<T> {
    const safeData = toPlainObject(payload);

    const finalConfig: AxiosRequestConfig  = {
      url,
      method,
      ...config
    };

    if (method === 'get') {
      finalConfig.params = safeData;
    } else {
      finalConfig.data = safeData;
    }

    return PureHttp.axiosInstance.request<T>(finalConfig).then(res => res);
  }

  /** GET 封装 */
  public get<T, P = any>(
    url: string,
    params?: P,
    config?: PureHttpRequestConfig
  ): Promise<T> {
    return this.request<T>('get', url, params, config);
  }

  /** POST 封装 */
  public post<T, P = any>(
    url: string,
    data?: P,
    config?: PureHttpRequestConfig
  ): Promise<T> {
    return this.request<T>('post', url, data, config);
  }

  /** PUT 封装 */
  public put<T, P = any>(
    url: string,
    data?: P,
    config?: PureHttpRequestConfig
  ): Promise<T> {
    return this.request<T>('put', url, data, config);
  }

  /** DELETE 封装 */
  public delete<T, P = any>(
    url: string,
    params?: P,
    config?: PureHttpRequestConfig
  ): Promise<T> {
    return this.request<T>('delete', url, params, config);
  }
}

// 强制转为普通对象（完全断掉响应式）
function toPlainObject(obj: any) {
  try {
    return JSON.parse(JSON.stringify(toRaw(obj)));
  } catch {
    console.log('转换报错')
    return obj;
  }
}
export const http = new PureHttp();
