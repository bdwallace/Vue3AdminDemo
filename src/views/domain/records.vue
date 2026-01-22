<template>
  <el-container class="records-page">
    <!-- 域名基本信息 -->
    <div class="create-server-block" v-if="domain_info.domain">
      <el-descriptions class="margin-top" title="域名基本信息" :column="4" >
        <el-descriptions-item label="主域名：" align="left">
          <el-tag size="default">{{ domain_info.domain }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="产品：" align="left">
          {{ domain_info.product}}
        </el-descriptions-item>
        <el-descriptions-item label="托管商：" align="left">
          {{ domain_info.custodian?.custodian_account || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="供应商：" align="left">
          {{ domain_info.supplier?.supplier_account || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="使用状态：" align="left">
          <el-tag size="default" v-if="domain_info.use_status === '使用中'" type="success">使用中</el-tag>
          <el-tag size="default" v-else-if="domain_info.use_status === '闲置中'" type="info">闲置中</el-tag>
          <el-tag size="default" v-else type="warning">未知</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="备注：" align="left">
          {{ domain_info.remark }}
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <div class="create-server-block">
      <div class="search-bar">
        <el-input
          placeholder="请输入搜索内容, 支持所有内容模糊搜索, 回车或点击按钮搜索"
          v-model="params.search"
          class="search-input"
          size="large"
          @change="fetchData"
          @keyup.enter="fetchData"
        >
          <template #append>
            <el-button type="primary" :icon="Search" @click="fetchData">搜索</el-button>
          </template>
        </el-input>
        <el-button
          @click="handleAdd"
          :icon="Plus"
          type="primary"
        >
          新增记录
        </el-button>
        <el-button
          @click="handleBatchDelete"
          :icon="Delete"
          type="danger"
          size="default"
        >
          批量删除
        </el-button>
        <el-tooltip content="从托管商同步最新的解析记录到数据库" placement="top">
          <el-button
            @click="handleSyncRecord"
            :icon="Refresh"
            type="success"
            size="default"
          >
            数据同步
          </el-button>
        </el-tooltip>
        
      </div>

      <el-table
        ref="multipleTable"
        :data="tableData"
        tooltip-effect="dark"
        border
        :header-cell-style="{ background: '#eef1f6', color: '#606266' }"
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="60" align="center" ></el-table-column>
        <el-table-column prop="business_line" label="业务线" fit align="center" sortable>
          <template #default="{ row }">
            {{ row.business_line || "-" }}
          </template>
        </el-table-column>
        <el-table-column prop="rr" label="主机记录" fit align="center" sortable>
            <template #default="{ row }">
              <b style="color: #00a1c9">{{ row.rr || "-" }}</b>
          </template>
        </el-table-column>
        <el-table-column prop="domain" label="主域名" fit align="center" sortable>
          <template #default="{ row }">
            {{ params.domain }}
          </template>
        </el-table-column>
        <el-table-column prop="type" label="记录类型" fit align="center" sortable>
          <template #default="{ row }">
            <el-tag>{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="value" label="记录值" fit align="center" sortable show-overflow-tooltip>
          <template #default="{ row }">
            <b>{{ row.value || "-" }}</b>
          </template>
        </el-table-column>
        <el-table-column prop="ttl" label="TTL" fit align="center" sortable></el-table-column>
        <el-table-column prop="priority" label="优先级" fit align="center" sortable></el-table-column>
        <el-table-column prop="weight" label="权重" fit align="center" sortable></el-table-column>
        <el-table-column prop="remark" label="备注" fit align="center" show-overflow-tooltip>
        </el-table-column>
        <el-table-column prop="update_time" label="更新时间" fit align="center" sortable></el-table-column>
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
                <el-button
                  class="action-btn"
                  size="default"
                  type="primary"
                  text
                  :icon="Edit"
                  @click="handleEdit(row)"
                >
                  编辑
                </el-button>
                <el-button
                  class="action-btn"
                  size="default"
                  type="danger"
                  text
                  :icon="Delete"
                  @click="handleDelete(row)"
                >
                  删除
                </el-button>
              </div>
          </template>
        </el-table-column>
        
      </el-table>
    </div>

    <!-- 添加/编辑抽屉 -->
    <el-drawer
      :title="isEdit ? '编辑记录' : '新增记录'"
      v-model="recordDialogVisible"
      size="35%"
      direction="rtl"
      ref="drawer"
    >
      <div class="demo-drawer__content">
        <el-form :model="recordForm" :rules="recordRules" ref="recordFormRef" >
          
          <el-form-item label="主机记录:" :label-width="formLabelWidth" prop="rr">
            <el-input
              v-model="recordForm.rr"
              placeholder="例如：www、@、*"
              style="width: 95%"
            ></el-input>
          </el-form-item>
          <el-form-item label="主域名:" :label-width="formLabelWidth" prop="domain">
            <el-input v-model="recordForm.domain" :disabled="isEdit" style="width: 95%"></el-input>
          </el-form-item>
          <el-form-item label="记录类型:" :label-width="formLabelWidth" prop="type">
            <el-select v-model="recordForm.type" placeholder="请选择记录类型" style="width: 95%">
              <el-option label="A" value="A"></el-option>
              <el-option label="CNAME" value="CNAME"></el-option>
              <el-option label="TXT" value="TXT"></el-option>
              <el-option label="SOA" value="SOA"></el-option>
              <el-option label="MX" value="MX"></el-option>
              <el-option label="SRV" value="SRV"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="记录值:" :label-width="formLabelWidth" prop="value">
            <el-input v-model="recordForm.value" type="textarea" :rows="4" style="width: 95%" placeholder="请输入记录值, 支持输入多个记录值, 每行一个记录值"></el-input>
          </el-form-item>
          <el-form-item label="TTL:" :label-width="formLabelWidth" prop="ttl">
            <el-input-number
              v-model="recordForm.ttl"
              :min="60"
              :max="86400"
              style="width: 95%"
            ></el-input-number>
          </el-form-item>
          <el-form-item label="优先级:" :label-width="formLabelWidth" prop="priority" v-if="recordForm.type==='MX'">
            <el-input-number
              v-model="recordForm.priority"
              :min="1"
              :max="50"
              style="width: 95%"
            ></el-input-number>

          </el-form-item>
          <el-form-item label="权重:" :label-width="formLabelWidth" prop="weight" v-if="recordForm.type==='CNAME'">
            <el-input-number
              v-model="recordForm.weight"
              :min="1"
              :max="100"
              style="width: 95%"
            ></el-input-number>

          </el-form-item>
          <el-form-item label="业务线:" :label-width="formLabelWidth" prop="business_line">
            <el-select
              v-model="recordForm.business_line"
              style="width: 90%"
              filterable remote clearable
              :remote-method="fetchBusinessLineList"
              :loading="businessLineLoading"
              placeholder="请输入关键词搜索业务线"
            >
              <el-option
                v-for="item in business_line_list"
                :key="item.id"
                :label="item.app_name"
                :value="item.app_name"
              >
                <span style="float: left">{{ item.app_name }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">{{ item.owner.join(' / ') }}</span>
              </el-option>
            </el-select>
            <el-button @click="refreshBusinessLineList" type="primary" text >刷新</el-button>
          </el-form-item>
          <el-form-item label="备注:" :label-width="formLabelWidth" prop="remark">
            <el-input v-model="recordForm.remark" type="textarea" :rows="3" style="width: 95%"></el-input>
          </el-form-item>
        </el-form>
        <div class="demo-drawer__footer" style="margin-top: 60%">
          <el-button @click="cancelForm" style="width: 50%">取 消</el-button>
          <el-button type="primary" @click="handleSaveRecord" style="width: 50%" :loading="commitLoading">{{ commitLoading ? "提交中..." : "提 交" }}</el-button>
        </div>
      </div>
    </el-drawer>

    <div style="padding: 10px 16px; text-align: right">
      <el-pagination
        background
        layout="total, sizes, prev, pager, next, jumper"
        :page-size="params.pagesize"
        :page-sizes="[10, 20, 50, 100, 500, 1000]"
        :total="params.total"
        @current-change="currentChange"
        @size-change="handleSizeChange"
      ></el-pagination>
    </div>
  </el-container>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from "vue";
import { Search, Plus, Edit, Delete, Refresh } from "@element-plus/icons-vue";
import {
  getDomainList,
  getDomainRecords,
  addDomainRecord,
  updateDomainRecord,
  deleteDomainRecord,
  syncDomainRecord
} from "@/api/domain";
import { getBusinessLineList, syncBusinessLine } from "@/api/appcenter";
import { ElMessage, ElMessageBox } from "element-plus";
import { createPaginationHandlers } from "@/utils/common";
import { useRoute } from "vue-router";
import type { FormInstance, FormRules } from "element-plus";

defineOptions({
  name: "DomainRecords"
});

const route = useRoute();
const loading = ref(false);
const commitLoading = ref(false);
const businessLineLoading = ref(false);
const recordDialogVisible = ref(false);
const isEdit = ref(false);
const recordFormRef = ref<FormInstance>();
const multipleSelection = ref<any[]>([]);
const formLabelWidth = "120px";

const params = reactive<{
  page: number;
  pagesize: number;
  total: number;
  search: string;
  domain: string;
  domain_id: string | number | null;
}>({
  page: 1,
  pagesize: 20,
  total: 0,
  search: "",
  domain: "",
  domain_id: null
});
const tableData = ref([]);
const business_line_list = ref([]);
const recordForm = ref({
  id: null,
  domain: "",
  rr: "",
  type: "A",
  value: "",
  ttl: 600,
  priority: 10,
  weight: 1,
  business_line: "",
  remark: ""
});

const domain_info = ref({
  domain: "",
  product: "",
  remark: "",
  use_status: "",
  custodian: {
    custodian_account: ""
  },
  supplier: {
    supplier_account: ""
  },
});

const recordRules: FormRules = {
  rr: [{ required: true, message: "请输入主机记录", trigger: "blur" }],
  domain: [{ required: true, message: "请输入主域名", trigger: "blur" }],
  type: [{ required: true, message: "请选择记录类型", trigger: "change" }],
  value: [{ required: true, message: "请输入记录值", trigger: "blur" }],
  ttl: [{ required: true, message: "请输入TTL", trigger: "blur" }]
};

const {
  currentChange,
  handleSizeChange,
  handleSelectionChange
} = createPaginationHandlers(params, fetchData, multipleSelection);

onMounted(() => {
  if (route.query.domain) {
    params.domain = route.query.domain as string;
  }
  if (route.query.domainId) {
    params.domain_id = route.query.domainId as any;
  }
  fetchDomainData();
  fetchData();
  fetchBusinessLineList();
});

function fetchData() {
  loading.value = true;
  getDomainRecords(params)
    .then((resp: any) => {
      if (resp.code === 200) {
        tableData.value = resp.data || [];
        params.total = resp.total || 0;
      } else {
        ElMessage({ type: "error", message: resp.msg || "获取解析记录列表失败" });
      }
    })
    .catch((error) => {
      console.error("Error fetching domain records:", error);
      ElMessage({ type: "error", message: "获取解析记录列表失败" });
    })
    .finally(() => {
      loading.value = false;
    });
}

function fetchBusinessLineList(search: string=null) {
  businessLineLoading.value = true;
  getBusinessLineList({page: 1, pagesize: 20, search: search})
    .then((resp: any) => {
        if (resp.code === 200) {
          business_line_list.value = resp.data || [];
      } else {
        ElMessage({ type: "error", message: resp.msg || "获取业务线列表失败" });
      }
    })
    .catch((error) => {
      console.error("Error fetching business line list:", error);
    })
    .finally(() => {
      businessLineLoading.value = false;
    });
}

function refreshBusinessLineList() {
  syncBusinessLine()
    .then((resp: any) => {
      if (resp.code === 200) {
        ElMessage({ type: "success", message: resp.msg || "刷新成功" });
      } else {
        ElMessage({ type: "error", message: resp.msg || "刷新失败" });
      }
    })
    .catch((error) => {
      console.error("Error refreshing business line:", error);
      ElMessage({ type: "error", message: "刷新失败" });
    });
}
function handleAdd() {
  isEdit.value = false;
  recordForm.value.domain = params.domain;
  // recordForm.value = {
  //   id: null,
  //   domain: params.domain || "",
  //   rr: "",
  //   type: "A",
  //   value: "",
  //   ttl: 600,
  //   priority: 10,
  //   business_line: "",
  //   remark: ""
  // };
  recordDialogVisible.value = true;
  nextTick(() => {
    recordFormRef.value?.clearValidate();
  });
}

function handleEdit(row: any) {
  isEdit.value = true;
  recordForm.value = { ...row };
  recordForm.value.domain = params.domain;
  recordDialogVisible.value = true;
  nextTick(() => {
    recordFormRef.value?.clearValidate();
  });
}

function cancelForm() {
  recordDialogVisible.value = false;
  recordFormRef.value?.clearValidate();
}

function fetchDomainData() {
  loading.value = true;
  const domainParams = {
    id: params.domain_id,
  };
  getDomainList(domainParams)
  .then((resp: any) => {
      if (resp.code === 200) {
        domain_info.value = resp.data[0];
        console.log(domain_info.value);
      } else {
        ElMessage({ type: "error", message: resp.msg || "获取域名信息失败" });
      }
    })
    .catch((error) => {
      console.error("Error fetching domain data:", error);
      ElMessage({ type: "error", message: "获取域名信息失败" });
    })
    .finally(() => {
      loading.value = false;
    });
}

function handleSaveRecord() {
  recordFormRef.value?.validate((valid) => {
    if (valid) {
      commitLoading.value = true;
      const api = isEdit.value ? updateDomainRecord : addDomainRecord;
      api(recordForm.value)
        .then((resp: any) => {
          if (resp.code === 200) {
            ElMessage({ type: "success", message: isEdit.value ? "修改成功" : "添加成功" });
            recordDialogVisible.value = false;
            fetchData();
          } else {
            ElMessage({ type: "error", message: resp.msg || "操作失败" });
          }
        })
        .catch((error) => {
          console.error("Error saving record:", error);
          ElMessage({ type: "error", message: "操作失败" });
        })
        .finally(() => {
          commitLoading.value = false;
        });
    }
  });
}

function handleDelete(row: any) {
  ElMessageBox.confirm(`确认要删除这条解析记录吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      loading.value = true;
      deleteDomainRecord({ id: row.id, domain: params.domain })
        .then((resp: any) => {
          if (resp.code === 200) {
            ElMessage({ type: "success", message: "删除成功" });
            fetchData();
          } else {
            ElMessage({ type: "error", message: resp.msg || "删除失败" });
          }
        })
        .catch((error) => {
          console.error("Error deleting record:", error);
          ElMessage({ type: "error", message: "删除失败" });
        })
        .finally(() => {
          loading.value = false;
        });
    })
    .catch(() => {});
}

function handleBatchDelete() {
  if (multipleSelection.value.length === 0) {
    ElMessage({ type: "warning", message: "请选择要删除的记录" });
    return;
  }

  ElMessageBox.confirm(
    `确认要删除选中的 ${multipleSelection.value.length} 条解析记录吗？`,
    "提示",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }
  )
    .then(() => {
      loading.value = true;
      const id_list = multipleSelection.value.map((row: any) => row.id);

      deleteDomainRecord({ id: id_list, domain: params.domain })
        .then((resp: any) => {
          if (resp.code === 200) {
            ElMessage({ type: "success", message: "删除成功" });
            fetchData();
          } else {
            ElMessage({ type: "error", message: resp.msg || "删除失败" });
          }
        })
        .catch((error) => {
          console.error("Error batch deleting records:", error);
          ElMessage({ type: "error", message: "批量删除失败" });
        })
        .finally(() => {
          loading.value = false;
          multipleSelection.value = [];
        });
    })
    .catch(() => {});
}

function handleSyncRecord() {
  syncDomainRecord({ domain: params.domain })
    .then((resp: any) => {
      if (resp.code === 200) {
        ElMessage({ type: "success", message: "同步成功" });
        fetchData();
      } else {
        ElMessage({ type: "error", message: resp.msg || "同步失败" });
      }
    })
    .catch((error) => {
      console.error("Error syncing record:", error);
      ElMessage({ type: "error", message: "同步失败" });
    })
}
</script>

<style scoped>


.records-page {
    height: 100%;
    width: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    box-sizing: border-box;
}

.create-server-block {
    background-color: white;
    padding: 20px 20px 16px;
    width: 100%;
}

.search-bar {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 10px;
}

.search-input {
    width: 70%;
}

.create-server-block :deep(.el-table .cell) {
    white-space: pre-line;
}

.create-server-block :deep(.el-descriptions-item__label) {
    margin-right: 8px !important;
}

.demo-drawer__footer {
    margin-left: 10px;
    margin-right: 10px;
    display: flex;
}

.action-buttons {
  display: inline-flex;
  align-items: center;
  gap: 0;
}

.action-buttons :deep(.el-button + .el-button) {
  margin-left: 0;
}

.action-buttons :deep(.action-btn.el-button) {
  padding: 0 6px;
  height: 24px;
}
</style>

