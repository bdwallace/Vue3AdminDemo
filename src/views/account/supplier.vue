<template>
  <el-container>
    <div class="main">
      <div class="toolbar">
        <el-input
          v-model="params.search"
          placeholder="请输入搜索内容（供应商名称、账号等）"
          style="width: 400px"
          class="input-with-select"
          size="large"
          clearable
        >
          <template #append>
            <el-button :icon="Search" @click="fetchData" />
          </template>
        </el-input>
        <div class="toolbar-actions">
          <el-button type="primary" :icon="Plus" @click="handleAdd">
            新增账号
          </el-button>
          <el-button type="success" :icon="Refresh" @click="handleSyncAll">
            全量数据同步
          </el-button>
        </div>
      </div>

      <div class="accountTable">
        <el-table
          ref="multipleTable"
          :data="tableData"
          tooltip-effect="dark"
          stripe
          border
          :header-cell-style="{ background: '#eef1f6', color: '#606266' }"
          v-loading="loading"
        >
          <el-table-column prop="supplier_name" label="供应商名称" width="180" align="center" sortable></el-table-column>
          <el-table-column prop="account" label="供应商账号" width="200" align="center" sortable></el-table-column>
          <el-table-column prop="balance" label="账号余额" width="120" align="center" sortable>
            <template #default="{ row }">
              <span style="color: #409eff">{{ row.balance || "-" }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="账号状态" width="120" align="center" sortable>
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="update_time" label="更新时间" width="180" align="center" sortable></el-table-column>
          <el-table-column prop="remark" label="备注" min-width="200" align="center" show-overflow-tooltip></el-table-column>
          <el-table-column label="操作" width="280" fixed="right" align="center">
            <template #default="{ row }">
              <el-button type="success" text :icon="Check" @click="handleCheck(row)">
                检测
              </el-button>
              <el-button type="primary" text :icon="Edit" @click="handleEdit(row)">
                编辑
              </el-button>
              <el-button type="danger" text :icon="Delete" @click="handleDelete(row)">
                删除
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

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="accountDialogVisible"
      :title="isEdit ? '编辑账号' : '新增账号'"
      width="600px"
    >
      <el-form :model="accountForm" :rules="accountRules" ref="accountFormRef" label-width="120px">
        <el-form-item label="供应商名称" prop="supplier_name">
          <el-input v-model="accountForm.supplier_name" placeholder="例如：阿里云、腾讯云"></el-input>
        </el-form-item>
        <el-form-item label="供应商账号" prop="account">
          <el-input v-model="accountForm.account" placeholder="请输入账号"></el-input>
        </el-form-item>
        <el-form-item label="账号密码">
          <el-input
            v-model="accountForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
          ></el-input>
        </el-form-item>
        <el-form-item label="账号状态" prop="status">
          <el-select v-model="accountForm.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="正常" value="正常"></el-option>
            <el-option label="异常" value="异常"></el-option>
            <el-option label="禁用" value="禁用"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="accountForm.remark" type="textarea" :rows="3"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="accountDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveAccount">保存</el-button>
      </template>
    </el-dialog>
  </el-container>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from "vue";
import { Search, Plus, Refresh, Edit, Delete, Check } from "@element-plus/icons-vue";
import {
  getSupplierAccountList,
  addSupplierAccount,
  updateSupplierAccount,
  deleteSupplierAccount,
  syncSupplierAccount,
  checkSupplierAccount
} from "@/api/account";
import { ElMessage, ElMessageBox } from "element-plus";
import { createPaginationHandlers } from "@/utils/common";
import type { FormInstance, FormRules } from "element-plus";

defineOptions({
  name: "SupplierAccount"
});

const loading = ref(false);
const accountDialogVisible = ref(false);
const isEdit = ref(false);
const accountFormRef = ref<FormInstance>();
const params = reactive({ page: 1, pagesize: 20, total: 0, search: "" });
const tableData = ref([]);
const accountForm = ref({
  id: null,
  supplier_name: "",
  account: "",
  password: "",
  status: "正常",
  remark: ""
});

const accountRules: FormRules = {
  supplier_name: [{ required: true, message: "请输入供应商名称", trigger: "blur" }],
  account: [{ required: true, message: "请输入供应商账号", trigger: "blur" }],
  status: [{ required: true, message: "请选择账号状态", trigger: "change" }]
};

const { currentChange, handleSizeChange } = createPaginationHandlers(params, fetchData);

onMounted(() => {
  fetchData();
});

function fetchData() {
  loading.value = true;
  getSupplierAccountList(params)
    .then((resp: any) => {
      if (resp.code === 200) {
        tableData.value = resp.data || [];
        params.total = resp.total || 0;
      } else {
        ElMessage({ type: "error", message: resp.msg || "获取供应商账号列表失败" });
      }
    })
    .catch((error) => {
      console.error("Error fetching supplier account data:", error);
      ElMessage({ type: "error", message: "获取供应商账号列表失败" });
    })
    .finally(() => {
      loading.value = false;
    });
}

function handleAdd() {
  isEdit.value = false;
  accountForm.value = {
    id: null,
    supplier_name: "",
    account: "",
    password: "",
    status: "正常",
    remark: ""
  };
  accountDialogVisible.value = true;
  nextTick(() => {
    accountFormRef.value?.clearValidate();
  });
}

function handleEdit(row: any) {
  isEdit.value = true;
  accountForm.value = { ...row };
  accountForm.value.password = ""; // 密码不显示
  accountDialogVisible.value = true;
  nextTick(() => {
    accountFormRef.value?.clearValidate();
  });
}

function handleSaveAccount() {
  accountFormRef.value?.validate((valid) => {
    if (valid) {
      loading.value = true;
      const api = isEdit.value ? updateSupplierAccount : addSupplierAccount;
      api(accountForm.value)
        .then((resp: any) => {
          if (resp.code === 200) {
            ElMessage({ type: "success", message: isEdit.value ? "编辑成功" : "新增成功" });
            accountDialogVisible.value = false;
            fetchData();
          } else {
            ElMessage({ type: "error", message: resp.msg || "操作失败" });
          }
        })
        .catch((error) => {
          console.error("Error saving account:", error);
          ElMessage({ type: "error", message: "操作失败" });
        })
        .finally(() => {
          loading.value = false;
        });
    }
  });
}

function handleDelete(row: any) {
  ElMessageBox.confirm(`确认要删除账号 "${row.account}" 吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      loading.value = true;
      deleteSupplierAccount({ id: row.id })
        .then((resp: any) => {
          if (resp.code === 200) {
            ElMessage({ type: "success", message: "删除成功" });
            fetchData();
          } else {
            ElMessage({ type: "error", message: resp.msg || "删除失败" });
          }
        })
        .catch((error) => {
          console.error("Error deleting account:", error);
          ElMessage({ type: "error", message: "删除失败" });
        })
        .finally(() => {
          loading.value = false;
        });
    })
    .catch(() => {});
}

function handleSyncAll() {
  ElMessageBox.confirm("确认要进行全量数据同步吗？这可能需要较长时间。", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      loading.value = true;
      syncSupplierAccount()
        .then((resp: any) => {
          if (resp.code === 200) {
            ElMessage({ type: "success", message: "同步成功" });
            fetchData();
          } else {
            ElMessage({ type: "error", message: resp.msg || "同步失败" });
          }
        })
        .catch((error) => {
          console.error("Error syncing accounts:", error);
          ElMessage({ type: "error", message: "同步失败" });
        })
        .finally(() => {
          loading.value = false;
        });
    })
    .catch(() => {});
}

function handleCheck(row: any) {
  loading.value = true;
  checkSupplierAccount({ id: row.id })
    .then((resp: any) => {
      if (resp.code === 200) {
        ElMessage({ type: "success", message: resp.msg || "检测成功" });
        fetchData();
      } else {
        ElMessage({ type: "error", message: resp.msg || "检测失败" });
      }
    })
    .catch((error) => {
      console.error("Error checking account:", error);
      ElMessage({ type: "error", message: "检测失败" });
    })
    .finally(() => {
      loading.value = false;
    });
}

function getStatusType(status: string): "success" | "danger" | "warning" | "info" {
  const statusMap: Record<string, "success" | "danger" | "warning" | "info"> = {
    正常: "success",
    异常: "danger",
    禁用: "warning"
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
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.toolbar-actions {
  display: flex;
  gap: 8px;
}

.accountTable {
  margin-top: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

