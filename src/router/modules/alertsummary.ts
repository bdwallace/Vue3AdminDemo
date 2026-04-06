const Layout = () => import("@/layout/index.vue");

/**
 * 与 DomainSystemFront 一致：子路由使用绝对 path，redirect 指向该 path。
 * path: "" 作为唯一子路由时，在双层 Layout 下内层 router-view 可能匹配不到页面，出现空白。
 */
export default {
  path: "/alert",
  name: "EhmonitorAlertGroup",
  component: Layout,
  redirect: "/alert/summary",
  meta: {
    icon: "IF-icon-huizong",
    title: "告警汇总",
    rank: 2
  },
  children: [
    {
      path: "/alert/summary",
      name: "EhmonitorAlertSummary",
      component: () => import("@/views/alert_summary.vue"),
      meta: {
        icon: "IF-icon-huizong",
        title: "告警汇总",
        keepAlive: true
      }
    }
  ]
} satisfies RouteConfigsTable;
