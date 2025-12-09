
const Layout = () => import("@/layout/index.vue");


export default {
  path: "/process_manage",
  name: "processManage",
  component: Layout,
  redirect: "/process",
  meta: {
    icon: "IF-icon-schedule",
    title: "审批管理",
    rank: 4
  },
  children: [
    {
      path: "/process",
      name: "process",
      component: () => import("@/views/process/process_view.vue"),
      meta: {
        icon: "IF-icon-schedule",
        title: "审批进度",

      }
    },
    {
      path: "/detail/:id",
      name: "detail",
      component: () => import("@/views/process/process_detail_view.vue"),
      meta: {
        icon: "IF-icon-schedule",
        title: "详情",
        showLink: false,
      }
    },

    {
      path: "/setting",
      name: "setting",
      component: () => import("@/views/process/approval_setting_view.vue"),
      meta: {
        icon: "IF-icon-setting",
        title: "审批设置",

      }
    },

  ]
} satisfies RouteConfigsTable;
