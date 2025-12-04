
const Layout = () => import("@/layout/index.vue");

export default {
  path: "/auditLog",
  name: "auditLog",
  component: Layout,
  redirect: "/log",
  meta: {
    icon: "IF-icon-log",
    title: "menus.pureLog",
    rank: 5
  },
  children: [
    {
      path: "/log",
      name: "Log",
      component: () => import("@/views/log/index_view.vue"),
      meta: {
        icon: "IF-icon-log",
        title: "menus.pureLog"
      }
    }
  ]
} satisfies RouteConfigsTable;
