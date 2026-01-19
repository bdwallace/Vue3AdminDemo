const Layout = () => import("@/layout/index.vue");

export default {
  path: "/domain",
  name: "Domain",
  component: Layout,
  redirect: "/domain/list",
  meta: {
    icon: "IF-icon-domain",
    title: "域名管理",
    rank: 1
  },
  children: [
    {
      path: "/domain/list",
      name: "DomainList",
      component: () => import("@/views/domain/index.vue"),
      meta: {
        icon: "IF-icon-domain",
        title: "域名管理"
      }
    },
    {
      path: "/domain/records",
      name: "DomainRecords",
      component: () => import("@/views/domain/records.vue"),
      meta: {
        icon: "IF-icon-setting",
        title: "解析记录",
        showLink: false,
        hiddenTag: false
      }
    }
  ]
} satisfies RouteConfigsTable;

