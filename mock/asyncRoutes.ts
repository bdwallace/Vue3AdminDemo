// 模拟后端动态生成路由
import { defineFakeRoute } from "vite-plugin-fake-server/client";

export default defineFakeRoute([
  {
    url: "/api/v1/get-async-routes",
    method: "get",
    response: () => {
      return {
        success: true,
        data: []
      };
    }
  }
]);
