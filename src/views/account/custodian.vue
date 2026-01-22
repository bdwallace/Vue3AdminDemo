<template>
  <el-container>
    <div class="main">
      <div class="toolbar">
        <el-input placeholder="请输入搜索内容, 支持所有内容模糊搜索, 回车或点击按钮搜索" v-model="params.search"
                  style="width: 70%" class="input-with-select" size="large"  @keyup.enter="fetchData">
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
        <div class="toolbar-actions">
          <el-button type="primary" :icon="Plus" @click="handleAdd">
            新增账号
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
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" align="center"></el-table-column>
          <el-table-column prop="custodian_name" label="托管商名称" fit align="center" sortable>
            <template #default="{ row }">
              <el-image v-if="row.custodian_name==='Aliyun'" :src="aliyunImage" style="height: 50px;width: 110px"></el-image>
              <el-image v-else-if="row.custodian_name==='Cloudflare'" :src="cloudflareImage" style="height: 50px;width: 110px"></el-image>
              <span v-else>{{ row.custodian_name }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="custodian_account" label="托管商账号" fit align="center" sortable></el-table-column>
          <el-table-column prop="custodian_status" label="账号状态" fit align="center" sortable>
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.custodian_status)">
                {{ row.custodian_status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="update_time" label="更新时间" fit align="center" sortable></el-table-column>
          <el-table-column prop="remark" label="备注" fit align="center" show-overflow-tooltip></el-table-column>
          <el-table-column label="操作" width="280" align="center">
            <template #default="{ row }">
              <div class="action-buttons">
                <el-button class="action-btn" type="success" text  :icon="Check" @click="handleCheck(row)">
                  检测
                </el-button>
                <el-button class="action-btn" type="primary" text :icon="Edit" @click="handleEdit(row)">
                  编辑
                </el-button>
                <el-button class="action-btn" type="danger" text :icon="Delete" @click="handleDelete(row)">
                  删除
                </el-button>
              </div>
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
      :title="isEdit ? '编辑托管商账号' : '新增托管商账号'"
      width="40%"
    >
      <el-form :model="accountForm" :rules="accountRules" ref="accountFormRef" label-width="120px">
        <el-form-item label="托管商名称" prop="custodian_name">
          <el-select v-model="accountForm.custodian_name" placeholder="请选择托管商" style="width: 85%">
            <el-option label="阿里云" value="Aliyun"></el-option>
            <el-option label="Cloudflare" value="Cloudflare" disabled></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="托管商账号" prop="account">
          <el-input v-model="accountForm.custodian_account" placeholder="请输入账号" style="width: 85%"></el-input>
        </el-form-item>
        <el-form-item label="Access Key" >
          <el-input v-model="accountForm.access_key" placeholder="请输入Access Key" style="width: 85%"></el-input>
          </el-form-item>
          <el-form-item label="Access Secret" >
            <el-input v-model="accountForm.access_secret" placeholder="请输入Access Secret" style="width: 85%"></el-input>
          </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="accountForm.remark" type="textarea" :rows="3" style="width: 85%"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" style="text-align: center">
        <el-button @click="accountDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveAccount">保存</el-button>
      </div>
    </el-dialog>
  </el-container>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from "vue";
import { Search, Plus, Refresh, Edit, Delete, Check } from "@element-plus/icons-vue";
import {
  getCustodianAccountList,
  addCustodianAccount,
  updateCustodianAccount,
  deleteCustodianAccount,
  syncCustodianAccount,
  checkCustodianAccount
} from "@/api/account";
import { ElMessage, ElMessageBox } from "element-plus";
import { createPaginationHandlers } from "@/utils/common";
import type { FormInstance, FormRules } from "element-plus";
import aliyunImage from "@/assets/aliyun.png";
import cloudflareImage from "@/assets/cloudflare.png";

defineOptions({
  name: "CustodianAccount"
});

const loading = ref(false);
const accountDialogVisible = ref(false);
const isEdit = ref(false);
const accountFormRef = ref<FormInstance>();
const multipleTable = ref();
const params = reactive({ page: 1, pagesize: 20, total: 0, search: "" });
const tableData = ref([]);
const selectedAccounts = ref<any[]>([]);
const accountForm = ref({
  id: null,
  custodian_name: "",
  custodian_account: "",
  access_key: "",
  access_secret: "",
  status: "正常",
  remark: ""
});

const accountRules: FormRules = {
  custodian_name: [{ required: true, message: "请输入托管商名称", trigger: "blur" }],
  custodian_account: [{ required: true, message: "请输入托管商账号", trigger: "blur" }],
  status: [{ required: true, message: "请选择账号状态", trigger: "change" }]
};

const { currentChange, handleSizeChange } = createPaginationHandlers(params, fetchData);

onMounted(() => {
  fetchData();
});

function fetchData() {
  loading.value = true;
  getCustodianAccountList(params)
    .then((resp: any) => {
      if (resp.code === 200) {
        tableData.value = resp.data || [];
        params.total = resp.total || 0;
      } else {
        ElMessage({ type: "error", message: resp.msg || "获取托管商账号列表失败" });
      }
    })
    .catch((error) => {
      console.error("Error fetching hosting account data:", error);
      ElMessage({ type: "error", message: "获取托管商账号列表失败" });
    })
    .finally(() => {
      loading.value = false;
    });
}

function handleAdd() {
  isEdit.value = false;
  accountForm.value = {
    id: null,
    custodian_name: "",
    custodian_account: "",
    access_key: "",
    access_secret: "",
    status: "未知",
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
  accountForm.value.access_key = "";
  accountForm.value.access_secret = "";
  accountDialogVisible.value = true;
  nextTick(() => {
    accountFormRef.value?.clearValidate();
  });
}

function handleSaveAccount() {
  accountFormRef.value?.validate((valid) => {
    if (valid) {
      loading.value = true;
      const api = isEdit.value ? updateCustodianAccount : addCustodianAccount;
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
  ElMessageBox.confirm(`确认要删除账号 "${row.custodian_account}" 吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      loading.value = true;
      deleteCustodianAccount({ id: row.id })
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

function handleSelectionChange(selection: any[]) {
  selectedAccounts.value = selection;
}



function handleCheck(row: any) {
  loading.value = true;
  checkCustodianAccount({ id: row.id })
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
    禁用: "warning",
    未知: "info",
    active: "success",
    inactive: "danger",
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

.toolbar-actions {
  margin-left: 10px;
  display: flex;
  gap: 8px;
}

.accountTable {
  margin-top: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.action-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0px;
}

.action-buttons :deep(.el-button + .el-button) {
  margin-left: 0;
}

.action-buttons :deep(.action-btn.el-button) {
  padding: 0 6px;
  height: 24px;
}
</style>

