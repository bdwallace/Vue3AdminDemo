import { chatai } from "@/router/enums";

export default {
  path: "/test",
  redirect: "/test/index",
  meta: {
    icon: "ri/chat-search-line",
    title: "chat-ai",
    rank: chatai
  },
  children: [
    {
      path: "/test/index",
      name: "ChatAi",
      component: () => import("@/views/chatai/index.vue"),
      meta: {
        title: "菜单1",
        extraIcon: "IF-pure-iconfont-new svg"
      }
    }
  ]
} satisfies RouteConfigsTable;
