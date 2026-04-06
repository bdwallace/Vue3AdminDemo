const Layout = () => import("@/layout/index.vue");

/** 与 DomainSystemFront 一致：redirect 与子路由 path（绝对路径）对应 */
export default {
  path: "/index",
  name: "EhmonitorIndexGroup",
  component: Layout,
  redirect: "/index/log",
  meta: {
    icon: "IF-icon-gailan",
    title: "告警概览",
    rank: 1
  },
  children: [
    {
      path: "/index/log",
      name: "EhmonitorOverview",
      component: () => import("@/views/index.vue"),
      meta: {
        icon: "IF-icon-gailan",
        title: "告警概览",
        keepAlive: true
      }
    }
  ]
} satisfies RouteConfigsTable;
