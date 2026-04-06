const Layout = () => import("@/layout/index.vue");

export default [
  {
    path: "/welcome",
    name: "Welcome",
    component: () => import("@/views/welcome/index.vue"),
    meta: {
      title: "欢迎页",
      /** 不在侧边栏展示；业务首页为告警概览 /index/log */
      showLink: false,
      rank: 101
    }
  },
  {
    path: "/error/404",
    name: "Page404",
    component: () => import("@/views/error/404.vue"),
    meta: {
      title: "404",
      showLink: false,
      rank: 103
    }
  },
  // {
  //   path: "/login",
  //   name: "Login",
  //   component: () => import("@/views/login/index_view.vue"),
  //   meta: {
  //     title: "menus.pureLogin",
  //     showLink: false,
  //     rank: 101
  //   }
  // },
  {
    path: "/redirect",
    component: Layout,
    meta: {
      title: "status.pureLoad",
      showLink: false,
      rank: 102
    },
    children: [
      {
        path: "/redirect/:path(.*)",
        name: "Redirect",
        component: () => import("@/layout/redirect.vue")
      }
    ]
  },
  // 下面是一个无layout菜单的例子（一个全屏空白页面），因为这种情况极少发生，所以只需要在前端配置即可（配置路径：src/router/modules/remaining.ts）
  // {
  //   path: "/empty",
  //   name: "Empty",
  //   component: () => import("@/views/empty/index_view.vue"),
  //   meta: {
  //     title: "menus.pureEmpty",
  //     showLink: false,
  //     rank: 103
  //   }
  // },
  // {
  //   path: "/account-settings",
  //   name: "AccountSettings",
  //   component: () => import("@/views/account-settings/index_view.vue"),
  //   meta: {
  //     title: "buttons.pureAccountSettings",
  //     showLink: false,
  //     rank: 104
  //   }
  // }
] satisfies Array<RouteConfigsTable>;
