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
