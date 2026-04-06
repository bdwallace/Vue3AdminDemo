const Layout = () => import("@/layout/index.vue");

export default {
  path: "/ingrate",
  name: "EhmonitorIntegrateGroup",
  component: Layout,
  redirect: "/ingrate/integrate",
  meta: {
    icon: "IF-icon-jichengzhongxin",
    title: "集成中心",
    rank: 5
  },
  children: [
    {
      path: "/ingrate/integrate",
      name: "EhmonitorIntegrate",
      component: () => import("@/views/integrate_center.vue"),
      meta: {
        icon: "IF-icon-jichengzhongxin",
        title: "集成中心",
        keepAlive: true
      }
    }
  ]
} satisfies RouteConfigsTable;
