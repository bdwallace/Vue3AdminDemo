<template>
  <el-container>
    <div class="main">
      <div class="toolbar">
        <el-input placeholder="请输入搜索内容, 支持所有内容模糊搜索, 回车或点击按钮搜索" v-model="params.search"
                  style="width: 70%" class="input-with-select" size="large" @keyup.enter="fetchData">
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
        <el-button type="primary" :icon="Refresh" @click="handleSync" style="margin-left: 10px">
          同步
        </el-button>
      </div>

      <div class="domainTable">
        <el-table
          ref="multipleTable"
          :data="tableData"
          tooltip-effect="dark"
          stripe
          border
          :header-cell-style="{ background: '#eef1f6', color: '#606266' }"
          @selection-change="handleSelectionChange"
          v-loading="loading"
        >
          <el-table-column type="selection" width="60"></el-table-column>
          <el-table-column prop="product" label="产品" fit align="center" sortable></el-table-column>
          <el-table-column prop="domain" label="域名" fit align="center" sortable></el-table-column>
          <el-table-column prop="supplier" label="供应商" fit align="center" sortable></el-table-column>
          <el-table-column prop="supplier_account" label="供应商账号" fit align="center" sortable></el-table-column>
          <el-table-column prop="hosting" label="托管商" fit align="center" sortable></el-table-column>
          <el-table-column prop="hosting_account" label="托管商账号" fit align="center" sortable></el-table-column>
          
          <el-table-column prop="ns_records" label="NS记录" fit align="center" show-overflow-tooltip></el-table-column>
          <el-table-column prop="status" label="域名状态" fit align="center" sortable>
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="expire_time" label="过期时间" fit align="center" sortable></el-table-column>
          <!-- <el-table-column prop="is_alert" label="是否告警" fit align="center">
            <template #default="{ row }">
              <el-tag :type="row.is_alert ? 'danger' : 'success'">
                {{ row.is_alert ? '是' : '否' }}
              </el-tag>
            </template>
          </el-table-column> -->
          <el-table-column prop="remark" label="备注" fit align="center" show-overflow-tooltip></el-table-column>
          <el-table-column label="操作" fit fixed="right" align="center">
            <template #default="{ row }">
              <el-button type="primary" text :icon="Edit" @click="handleEdit(row)">
                编辑
              </el-button>
              <el-button type="primary" text :icon="Setting" @click="handleRecordSetting(row)">
                解析设置
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div style="padding: 10px 16px; text-align: right">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :page-size="params.pagesize"
          :page-sizes="[20, 30, 50, 100]"
          :total="params.total"
          @current-change="currentChange"
          @size-change="handleSizeChange"
        ></el-pagination>
      </div>
    </div>

    <!-- 编辑对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑域名" width="600px">
      <el-form :model="editForm" label-width="120px">
        <el-form-item label="域名所属产品">
          <el-input v-model="editForm.product"></el-input>
        </el-form-item>
        <el-form-item label="供应商(注册商)">
          <el-input v-model="editForm.supplier"></el-input>
        </el-form-item>
        <el-form-item label="托管商(解析所在)">
          <el-input v-model="editForm.hosting"></el-input>
        </el-form-item>
        <el-form-item label="NS记录">
          <el-input v-model="editForm.ns_records" type="textarea" :rows="2"></el-input>
        </el-form-item>
        <el-form-item label="域名状态">
          <el-select v-model="editForm.status" placeholder="请选择状态">
            <el-option label="正常" value="正常"></el-option>
            <el-option label="过期" value="过期"></el-option>
            <el-option label="暂停" value="暂停"></el-option>
            <el-option label="锁定" value="锁定"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="过期时间">
          <el-date-picker
            v-model="editForm.expire_time"
            type="datetime"
            placeholder="选择过期时间"
            style="width: 100%"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="是否告警">
          <el-switch v-model="editForm.is_alert"></el-switch>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="editForm.remark" type="textarea" :rows="3"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveEdit">保存</el-button>
      </template>
    </el-dialog>
  </el-container>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { Search, Refresh, Edit, Setting } from "@element-plus/icons-vue";
import { getDomainList, syncDomain, updateDomain } from "@/api/domain";
import { ElMessage, ElMessageBox } from "element-plus";
import { createPaginationHandlers } from "@/utils/common";
import { useRouter } from "vue-router";

defineOptions({
  name: "Domain"
});

const router = useRouter();
const loading = ref(false);
const editDialogVisible = ref(false);
const params = reactive({ page: 1, pagesize: 20, total: 0, search: "" });
const multipleSelection = ref([]);
const tableData = ref([]);
const editForm = ref({
  id: null,
  product: "",
  supplier: "",
  hosting: "",
  domain: "",
  ns_records: "",
  status: "",
  expire_time: "",
  is_alert: false,
  remark: ""
});

const {
  currentChange,
  handleSizeChange,
  handleSelectionChange
} = createPaginationHandlers(params, fetchData, multipleSelection);

onMounted(() => {
  fetchData();
});

function fetchData() {
  loading.value = true;
  getDomainList(params)
    .then((resp: any) => {
      if (resp.code === 200) {
        tableData.value = resp.data || [];
        params.total = resp.total || 0;
      } else {
        ElMessage({ type: "error", message: resp.msg || "获取域名列表失败" });
      }
    })
    .catch((error) => {
      console.error("Error fetching domain data:", error);
      ElMessage({ type: "error", message: "获取域名列表失败" });
    })
    .finally(() => {
      loading.value = false;
    });
}

function handleSync() {
  ElMessageBox.confirm("确认要同步域名信息吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      loading.value = true;
      syncDomain()
        .then((resp: any) => {
          if (resp.code === 200) {
            ElMessage({ type: "success", message: "同步成功" });
            fetchData();
          } else {
            ElMessage({ type: "error", message: resp.msg || "同步失败" });
          }
        })
        .catch((error) => {
          console.error("Error syncing domain:", error);
          ElMessage({ type: "error", message: "同步失败" });
        })
        .finally(() => {
          loading.value = false;
        });
    })
    .catch(() => {});
}

function handleEdit(row: any) {
  editForm.value = { ...row };
  editDialogVisible.value = true;
}

function handleSaveEdit() {
  loading.value = true;
  updateDomain(editForm.value)
    .then((resp: any) => {
      if (resp.code === 200) {
        ElMessage({ type: "success", message: "保存成功" });
        editDialogVisible.value = false;
        fetchData();
      } else {
        ElMessage({ type: "error", message: resp.msg || "保存失败" });
      }
    })
    .catch((error) => {
      console.error("Error updating domain:", error);
      ElMessage({ type: "error", message: "保存失败" });
    })
    .finally(() => {
      loading.value = false;
    });
}

function handleRecordSetting(row: any) {
  router.push({
    path: "/domain/records",
    query: { domain: row.domain, domainId: row.id }
  });
}

function getStatusType(status: string): "success" | "danger" | "warning" | "info" {
  const statusMap: Record<string, "success" | "danger" | "warning" | "info"> = {
    正常: "success",
    过期: "danger",
    暂停: "warning",
    锁定: "info"
  };
  return statusMap[status] || "info";
}
</script>

<style scoped>
.main {
  margin-top: 1px;
  width: 100%;
  height: 90%;
}

.toolbar {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 16px;
}



.domainTable {
  margin-top: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

