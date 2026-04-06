/**
 * Ehmonitor 路由（pure-admin：必须提供 path 为 "/" 的根路由，否则 formatTwoStageRoutes 无法挂载子路由，会导致 constantRoutes 为空并引发异常）
 */
const Layout = () => import("@/layout/index.vue");
const ParentLayout = () => import("@/layout/parent-layout.vue");

export default {
  path: "/",
  name: "Root",
  component: Layout,
  redirect: "/index",
  meta: {
    title: "Ehmonitor",
    icon: "ep:monitor",
    rank: 0
  },
  children: [
    {
      path: "index",
      name: "EhmonitorOverview",
      component: () => import("@/views/index.vue"),
      meta: {
        title: "告警概览",
        keepAlive: true
      }
    },
    {
      path: "alert",
      name: "EhmonitorAlertSummary",
      component: () => import("@/views/alert_summary.vue"),
      meta: {
        title: "告警汇总",
        keepAlive: true
      }
    },
    {
      path: "monitor_item",
      name: "EhmonitorMonitorItemParent",
      component: ParentLayout,
      redirect: "/monitor_item",
      meta: {
        title: "告警管理",
        icon: "ep:setting"
      },
      children: [
        {
          path: "",
          name: "EhmonitorAlertRule",
          component: () => import("@/views/alert_rule.vue"),
          meta: {
            title: "告警规则管理",
            keepAlive: true
          }
        },
        {
          path: "silence",
          name: "EhmonitorSilence",
          component: () => import("@/views/silence_view.vue"),
          meta: {
            title: "静默管理",
            keepAlive: true
          }
        }
      ]
    },
    {
      path: "labels",
      name: "EhmonitorLabels",
      component: () => import("@/views/labels_anno.vue"),
      meta: {
        title: "标签与注解管理",
        keepAlive: true
      }
    },
    {
      path: "ingrate",
      name: "EhmonitorIntegrate",
      component: () => import("@/views/integrate_center.vue"),
      meta: {
        title: "集成中心",
        keepAlive: true
      }
    },
    {
      path: "log",
      name: "EhmonitorLog",
      component: () => import("@/views/log.vue"),
      meta: {
        title: "操作日志",
        keepAlive: true
      }
    }
  ]
} satisfies RouteConfigsTable;
