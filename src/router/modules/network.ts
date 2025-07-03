
import {$t} from "@/plugins/i18n";
const Layout = () => import("@/layout/index.vue");


export default {
  path: "/network",
  name: "network",
  component: Layout,
  redirect: "/vpc",
  meta: {
    icon: "IF-icon-network",
    title: $t("menus.pureNetwork"),
    rank: 2
  },
  children: [
    {
      path: "/vpc",
      name: "vpc",
      component: () => import("@/views/network/vpc_view.vue"),
      meta: {
        icon: 'IF-icon-VPC',
        title: $t("menus.pureVpc"),
      }
    },
    {
      path: "/route_table",
      name: "route_table",
      component: () => import("@/views/network/route_table_view.vue"),
      meta: {
        icon: 'IF-icon-luyoubiao',
        title: $t("menus.pureRouteTable"),
      }
    },
    {
      path: "/subnet",
      name: "subnet",
      component: () => import("@/views/network/subnet_view.vue"),
      meta: {
        icon: 'IF-icon-subnet',
        title: $t("menus.pureSubnet"),
      }
    },
    {
      path: "/endpoint",
      name: "endpoint",
      component: () => import("@/views/network/endpoint_view.vue"),
      meta: {
        icon: 'IF-icon-a-347_vpc-endpoint',
        title: $t("menus.pureEndpoint"),
      }
    }
  ]
} satisfies RouteConfigsTable;
