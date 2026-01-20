<template>
  <el-container>
    <div class="main">
      <div>
        <el-input placeholder="请输入搜索内容, 支持所有内容模糊搜索, 回车或点击按钮搜索" v-model="params.search"
                  style="width: 70%" class="input-with-select" size="large" @keyup.enter="fetchData" clearable>
          <template #append>
            <el-button :icon="Search" @click="fetchData" />
          </template>
<!--          <template #prepend>-->
<!--            <el-select v-model="select" placeholder="Select" style="width: 80px" >-->
<!--              <el-option label="Restaurant" value="1" />-->
<!--              <el-option label="Order No." value="2" />-->
<!--              <el-option label="Tel" value="3" />-->
<!--            </el-select>-->
<!--          </template>-->
        </el-input>

      </div>


      <div class="logTable">
        <el-table ref="multipleTable" :data="tableData" tooltip-effect="dark" stripe
                  border :header-cell-style="{background:'#eef1f6',color:'#606266'}"
                  @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="60"></el-table-column>
          <el-table-column prop="user_name" label="请求用户" fit align="center" sortable></el-table-column>
          <el-table-column prop="request_type" label="请求类型" fit align="center" sortable></el-table-column>
          <el-table-column prop="user_ip" label="用户IP" fit align="center" sortable></el-table-column>
          <el-table-column prop="create_time" label="请求时间" fit align="center" sortable></el-table-column>
          <el-table-column prop="request_path" label="路由地址" fit align="center" sortable></el-table-column>
          <el-table-column prop="request_param" label="请求参数" fit align="center" sortable>
            <template #default="{ row }">
              <el-popover trigger="click" placement="left" :width="400">
                <pre style="font-family: monospace;font-size: 13px;padding: 10px;background: #f5f5f5;
                      max-height: 400px; overflow: auto; white-space: pre-wrap; word-wrap: break-word; border-radius: 4px;
                  " v-html="formattedJSON(row.request_param)"></pre>
                <template #reference>
                  <el-button type="primary" text>查看详情</el-button>
                </template>
              </el-popover>
              </template>
          </el-table-column>
        </el-table>
      </div>

      <div style="padding: 10px 16px;text-align: right;">
        <el-pagination background layout="total, sizes, prev, pager, next, jumper"
                       :page-size="params.pagesize" :page-sizes="[20,30,50,100]"
                       :total="params.total"
                       @current-change="currentChange"
                       @size-change="handleSizeChange">
        </el-pagination>
      </div>
    </div>
  </el-container>
</template>

<script setup lang='ts'>

import {ref, reactive, h, onMounted} from "vue";
import {
  Plus,
  Search,
} from '@element-plus/icons-vue'
import {getAuditLogList} from "@/api/auditlog";
import { ElMessage } from "element-plus";
import { createPaginationHandlers } from "@/utils/common";

const params = reactive({ page: 1, pagesize: 20, total: 0, search: "" });
const multipleSelection = ref([]);
const tableData = ref([]);
const {
  currentChange,
  handleSizeChange,
  handleSelectionChange
} = createPaginationHandlers(params, fetchData, multipleSelection);

fetchData()
function fetchData() {
  getAuditLogList(params).then(resp => {
    if (resp.code === 200) {
      tableData.value = resp.data;
      params.total = resp.total;
    } else {
      ElMessage({ type: "error", message: resp.msg });
    }
  })
    .catch((error) => {
      console.error("Error fetching audit log data:", error);
    });
}

function formattedJSON(raw: any): string {
  try {
    if (raw === null || raw === undefined) {
      return "";
    }
    if (typeof raw !== "string") {
      return JSON.stringify(raw, null, 4);
    }
    const trimmed = raw.trim();
    if (!trimmed) {
      return "";
    }
    try {
      return JSON.stringify(JSON.parse(trimmed), null, 4);
    } catch (e) {
      const normalized = trimmed
        .replace(/\bNone\b/g, "null")
        .replace(/\bTrue\b/g, "true")
        .replace(/\bFalse\b/g, "false")
        .replace(/'/g, '"');
      return JSON.stringify(JSON.parse(normalized), null, 4);
    }
  } catch (e) {
    console.error("Error formatting JSON:", e);
    return String(raw); // 解析失败，返回原始字符串，防止报错
  }
}

</script>

<style scoped>
.main {
  margin-top: 1px;
  width: 100%;
  height: 90%;
}

.logTable {
  margin-top: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}
/*
.logTable ::v-deep .el-table .cell {
  white-space: pre-line;
}


.input-with-select .el-input-group__prepend {
  background-color: #fff;
}
*/

</style>
