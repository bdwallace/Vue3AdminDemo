
import {$t} from "@/plugins/i18n";
const Layout = () => import("@/layout/index.vue");


export default {
  path: "/process_manage",
  name: "processManage",
  component: Layout,
  redirect: "/process",
  meta: {
    icon: "IF-icon-schedule",
    title: $t("menus.pureProcess"),
    rank: 4
  },
  children: [
    {
      path: "/process",
      name: "process",
      component: () => import("@/views/process/process_view.vue"),
      meta: {
        icon: "IF-icon-schedule",
        title: $t("menus.pureProcess"),
      }
    },

  ]
} satisfies RouteConfigsTable;
