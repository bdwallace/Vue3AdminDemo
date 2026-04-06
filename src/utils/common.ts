// common/pagination.ts
import type { Ref } from "vue";
import {message} from "@/utils/message";
import {ElMessage} from "element-plus";

interface PaginationParams {
  page: number;
  pagesize: number;
  total: number;
  search?: string;
}

export const imageMap = {
  Aliyun: new URL('@/assets/aliyun.png', import.meta.url).href,
  OpenStack: new URL('@/assets/openstack.png', import.meta.url).href,
  HuaWei: new URL('@/assets/huawei.png', import.meta.url).href,
  AWS: new URL('@/assets/aws.png', import.meta.url).href,
  Tencent: new URL('@/assets/Tencent_Cloud_logo.png', import.meta.url).href,
  ucloud: new URL('@/assets/ucloud.png', import.meta.url).href,
  lark: new URL('@/assets/lark.svg', import.meta.url).href
}

export function createPaginationHandlers(
  params: PaginationParams,
  fetchData: () => void,
  multipleSelection?: Ref<any[]>
) {
  function currentChange(page: number) {
    params.page = page;
    fetchData();
  }

  function handleSizeChange(pagesize: number) {
    params.pagesize = pagesize;
    fetchData();
  }

  function handleSelectionChange(val: any[]) {
    if (multipleSelection) {
      multipleSelection.value = val;
    }
  }

  return {
    currentChange,
    handleSizeChange,
    handleSelectionChange
  };
}

/** 以下供 Ehmonitor 等 Options API 页面在 methods 中直接混入，依赖 this.params / this.fetchData / this.multipleSelection */

export function currentChange(this: any, page: number) {
  this.params.page = page;
  this.fetchData();
}

export function handleSizeChange(this: any, pagesize: number) {
  this.params.pagesize = pagesize;
  this.fetchData();
}

export function handleSelectionChange(this: any, val: any[]) {
  console.log(val);
  this.multipleSelection = val;
}

export function saveYamlFile(yamlStr: string, filename = "alert_rules.yaml") {
  const blob = new Blob([yamlStr], { type: "text/yaml;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function formatDateToLocalString(date: Date) {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const Y = date.getFullYear();
  const M = pad(date.getMonth() + 1);
  const D = pad(date.getDate());
  const h = pad(date.getHours());
  const m = pad(date.getMinutes());
  const s = pad(date.getSeconds());
  return `${Y}-${M}-${D} ${h}:${m}:${s}`;
}

export function copyText(text) {
    let oInput = document.createElement('input');
    oInput.value = text;
    document.body.appendChild(oInput);
    oInput.select(); // 选择对象;
    console.log(oInput.value)
    document.execCommand("Copy"); // 执行浏览器复制命令
    ElMessage({type: 'success', message: "复制成功"})
    oInput.remove()
}
