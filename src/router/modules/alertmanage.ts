const Layout = () => import("@/layout/index.vue");

export default {
  path: "/alert_rule",
  name: "EhmonitorMonitorItemGroup",
  component: Layout,
  redirect: "/alert_rule/alert_rule",
  meta: {
    icon: "IF-icon-guizeguanli",
    title: "告警管理",
    rank: 3
  },
  children: [
    {
      path: "/alert_rule/alert_rule",
      name: "EhmonitorAlertRule",
      component: () => import("@/views/alert_rule.vue"),
      meta: {
        icon: "IF-icon-guizeguanli",
        title: "告警规则管理",
        keepAlive: true
      }
    },
    {
      path: "/alert_rule/silence",
      name: "EhmonitorSilence",
      component: () => import("@/views/silence_view.vue"),
      meta: {
        icon: "IF-icon-guizeguanli",
        title: "静默管理",
        keepAlive: true
      }
    }
  ]
} satisfies RouteConfigsTable;
