const Layout = () => import("@/layout/index.vue");

export default {
  path: "/account",
  name: "Account",
  component: Layout,
  redirect: "/account/supplier",
  meta: {
    icon: "IF-icon-account",
    title: "账号管理",
    rank: 2
  },
  children: [
    {
      path: "/account/supplier",
      name: "SupplierAccount",
      component: () => import("@/views/account/supplier.vue"),
      meta: {
        icon: "IF-icon-supplier",
        title: "供应商账号"
      }
    },
    {
      path: "/account/custodian",
      name: "CustodianAccount",
      component: () => import("@/views/account/custodian.vue"),
      meta: {
        icon: "IF-icon-custodian",
        title: "托管商账号"
      }
    }
  ]
} satisfies RouteConfigsTable;

