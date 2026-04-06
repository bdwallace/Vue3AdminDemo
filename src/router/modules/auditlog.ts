const Layout = () => import("@/layout/index.vue");

export default {
  path: "/auditlog",
  name: "AuditLogNew",
  component: Layout,
  redirect: "/auditlog/list",
  meta: {
    icon: "IF-icon-rizhi",
    title: "操作日志",
    rank: 6
  },
  children: [
    {
      path: "/auditlog/list",
      name: "EhmonitorLog",
      component: () => import("@/views/log.vue"),
      meta: {
        icon: "IF-icon-rizhi",
        title: "操作日志",
        keepAlive: true
      }
    }
  ]
} satisfies RouteConfigsTable;
