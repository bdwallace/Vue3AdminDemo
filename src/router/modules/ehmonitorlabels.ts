const Layout = () => import("@/layout/index.vue");

export default {
  path: "/labels",
  name: "EhmonitorLabelsGroup",
  component: Layout,
  redirect: "/labels/labels",
  meta: {
    icon: "IF-icon-tag-plus",
    title: "标签与注解管理",
    rank: 4
  },
  children: [
    {
      path: "/labels/labels",
      name: "EhmonitorLabels",
      component: () => import("@/views/labels_anno.vue"),
      meta: {
        icon: "IF-icon-tag-plus",
        title: "标签与注解管理",
        keepAlive: true
      }
    }
  ]
} satisfies RouteConfigsTable;
