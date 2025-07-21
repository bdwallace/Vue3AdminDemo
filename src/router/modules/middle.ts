
import {$t} from "@/plugins/i18n";
const Layout = () => import("@/layout/index.vue");


export default {
  path: "/middleware",
  name: "middleware",
  component: Layout,
  redirect: "/cache",
  meta: {
    icon: "IF-icon-Middleware",
    title: $t("menus.pureMiddle"),
    rank: 1
  },
  children: [
    {
      path: "/cache",
      name: "cache",
      component: () => import("@/views/middle/cache_view.vue"),
      meta: {
        icon: "IF-icon-redis",
        title: $t("menus.pureCache"),
      }
    },
    {
      path: "/msk",
      name: "msk",
      component: () => import("@/views/middle/msk_view.vue"),
      meta: {
        icon: "IF-icon-Kafka",
        title: $t("menus.pureMsk"),
      }
    },
    {
      path: "/opensearch",
      name: "opensearch",
      component: () => import("@/views/middle/opensearch.vue"),
      meta: {
        icon: "IF-icon-opensearch",
        title: $t("menus.pureOsh"),
      }
    },
    {
      path: "/s3",
      name: "s3",
      component: () => import("@/views/middle/s3_view.vue"),
      meta: {
        icon: 'IF-icon-cunchutong',
        title: $t("menus.pureS3"),
        keepAlive: true
      }
    }
  ]
} satisfies RouteConfigsTable;
