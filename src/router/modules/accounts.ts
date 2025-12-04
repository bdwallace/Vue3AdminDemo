

const Layout = () => import("@/layout/index.vue");


export default {
  path: "/account_manage",
  name: "accountManage",
  component: Layout,
  redirect: "/account",
  meta: {
    icon: "IF-icon-zhanghao",
    title: "menus.pureAccount",
    rank: 5
  },
  children: [
    {
      path: "/account",
      name: "account",
      component: () => import("@/views/accounts/index_view.vue"),
      meta: {
        icon: "IF-icon-zhanghao",
        title: "menus.pureAccount",
      }
    },

  ]
} satisfies RouteConfigsTable;
