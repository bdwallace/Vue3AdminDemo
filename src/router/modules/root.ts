const Layout = () => import("@/layout/index.vue");

/**
 * pure-admin 要求存在 path 为 "/" 的根路由，formatTwoStageRoutes 会将其作为外壳并把其余模块挂到 children；
 * 若不配置，constantRoutes 组装会异常甚至引发路由层递归问题。
 */
export default {
  path: "/",
  name: "Root",
  component: Layout,
  redirect: "/index/log",
  meta: {
    title: "Ehmonitor",
    icon: "ep:monitor",
    showLink: false,
    rank: 0
  }
} satisfies RouteConfigsTable;
