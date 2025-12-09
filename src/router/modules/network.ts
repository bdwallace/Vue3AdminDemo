
const Layout = () => import("@/layout/index.vue");


export default {
  path: "/network",
  name: "network",
  component: Layout,
  redirect: "/vpc",
  meta: {
    icon: "IF-icon-network",
    title: "网络",
    rank: 2
  },
  children: [
    {
      path: "/vpc",
      name: "vpc",
      component: () => import("@/views/network/vpc_view.vue"),
      meta: {
        icon: 'IF-icon-VPC',
        title: "VPC",
      }
    },
    {
      path: "/route_table",
      name: "route_table",
      component: () => import("@/views/network/route_table_view.vue"),
      meta: {
        icon: 'IF-icon-luyoubiao',
        title: "路由表",
      }
    },
    {
      path: "/subnet",
      name: "subnet",
      component: () => import("@/views/network/subnet_view.vue"),
      meta: {
        icon: 'IF-icon-subnet',
        title: '子网',
      }
    },
    {
      path: "/endpoint",
      name: "endpoint",
      component: () => import("@/views/network/endpoint_view.vue"),
      meta: {
        icon: 'IF-icon-a-347_vpc-endpoint',
        title: "Endpoint",
      }
    }
  ]
} satisfies RouteConfigsTable;
