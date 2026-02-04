const Layout = () => import("@/layout/index.vue");

export default {
  path: "/auditlog",
  name: "AuditLogNew",
  component: Layout,
  redirect: "/auditlog/list",
  meta: {
    icon: "IF-icon-log",
    title: "操作日志",
    rank: 5
  },
  children: [
    {
      path: "/auditlog/list",
      name: "AuditLogList",
      component: () => import("@/views/log/index.vue"),
      meta: {
        icon: "IF-icon-log",
        title: "操作日志"
      }
    }
  ]
} satisfies RouteConfigsTable;

