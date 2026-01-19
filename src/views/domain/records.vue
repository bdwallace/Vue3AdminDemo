<template>
  <el-container>
    <div class="main">
      <div class="toolbar">
        <el-input
          v-model="params.search"
          placeholder="请输入搜索内容（业务线、主机记录、主域名等）"
          style="width: 400px"
          class="input-with-select"
          size="large"
          clearable
          @keyup.enter="fetchData"
        >
          <template #append>
            <el-button :icon="Search" @click="fetchData" />
          </template>
        </el-input>
        <div class="toolbar-actions">
          <el-button type="primary" :icon="Plus" @click="handleAdd">
            添加记录
          </el-button>
        </div>
      </div>

      <div class="recordTable">
        <el-table
          ref="multipleTable"
          :data="tableData"
          tooltip-effect="dark"
          stripe
          border
          :header-cell-style="{ background: '#eef1f6', color: '#606266' }"
          v-loading="loading"
        >
          <el-table-column prop="business_line" label="业务线" width="120" align="center" sortable></el-table-column>
          <el-table-column prop="host_record" label="主机记录" width="150" align="center" sortable></el-table-column>
          <el-table-column prop="main_domain" label="主域名" width="200" align="center" sortable></el-table-column>
          <el-table-column prop="record_type" label="记录类型" width="120" align="center" sortable>
            <template #default="{ row }">
              <el-tag>{{ row.record_type }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="record_value" label="记录值" width="250" align="center" show-overflow-tooltip></el-table-column>
          <el-table-column prop="ttl" label="TTL" width="100" align="center" sortable></el-table-column>
          <el-table-column prop="priority" label="优先级" width="100" align="center" sortable></el-table-column>
          <el-table-column prop="update_time" label="更新时间" width="180" align="center" sortable></el-table-column>
          <el-table-column prop="remark" label="备注" min-width="150" align="center" show-overflow-tooltip></el-table-column>
          <el-table-column label="操作" width="150" fixed="right" align="center">
            <template #default="{ row }">
              <el-button type="primary" text :icon="Edit" @click="handleEdit(row)">
                修改
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
      v-model="recordDialogVisible"
      :title="isEdit ? '修改记录' : '添加记录'"
      width="700px"
    >
      <el-form :model="recordForm" :rules="recordRules" ref="recordFormRef" label-width="120px">
        <el-form-item label="业务线" prop="business_line">
          <el-input v-model="recordForm.business_line"></el-input>
        </el-form-item>
        <el-form-item label="主机记录" prop="host_record">
          <el-input v-model="recordForm.host_record" placeholder="例如：www、@、*"></el-input>
        </el-form-item>
        <el-form-item label="主域名" prop="main_domain">
          <el-input v-model="recordForm.main_domain" :disabled="isEdit"></el-input>
        </el-form-item>
        <el-form-item label="记录类型" prop="record_type">
          <el-select v-model="recordForm.record_type" placeholder="请选择记录类型" style="width: 100%">
            <el-option label="A" value="A"></el-option>
            <el-option label="AAAA" value="AAAA"></el-option>
            <el-option label="CNAME" value="CNAME"></el-option>
            <el-option label="MX" value="MX"></el-option>
            <el-option label="TXT" value="TXT"></el-option>
            <el-option label="NS" value="NS"></el-option>
            <el-option label="SRV" value="SRV"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="记录值" prop="record_value">
          <el-input v-model="recordForm.record_value" type="textarea" :rows="2"></el-input>
        </el-form-item>
        <el-form-item label="TTL" prop="ttl">
          <el-input-number v-model="recordForm.ttl" :min="60" :max="86400" style="width: 100%"></el-input-number>
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-input-number
            v-model="recordForm.priority"
            :min="1"
            :max="100"
            :disabled="recordForm.record_type !== 'MX'"
            style="width: 100%"
          ></el-input-number>
          <span style="font-size: 12px; color: #999; margin-left: 8px">
            (仅MX记录需要设置)
          </span>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="recordForm.remark" type="textarea" :rows="3"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="recordDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveRecord">保存</el-button>
      </template>
    </el-dialog>
  </el-container>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from "vue";
import { Search, Plus, Edit, Delete } from "@element-plus/icons-vue";
import {
  getDomainRecords,
  addDomainRecord,
  updateDomainRecord,
  deleteDomainRecord
} from "@/api/domain";
import { ElMessage, ElMessageBox } from "element-plus";
import { createPaginationHandlers } from "@/utils/common";
import { useRoute } from "vue-router";
import type { FormInstance, FormRules } from "element-plus";

defineOptions({
  name: "DomainRecords"
});

const route = useRoute();
const loading = ref(false);
const recordDialogVisible = ref(false);
const isEdit = ref(false);
const recordFormRef = ref<FormInstance>();
const params = reactive<{
  page: number;
  pagesize: number;
  total: number;
  search: string;
  domain: string;
  domainId: string | number | null;
}>({
  page: 1,
  pagesize: 20,
  total: 0,
  search: "",
  domain: "",
  domainId: null
});
const tableData = ref([]);
const recordForm = ref({
  id: null,
  business_line: "",
  host_record: "",
  main_domain: "",
  record_type: "A",
  record_value: "",
  ttl: 600,
  priority: 10,
  remark: ""
});

const recordRules: FormRules = {
  business_line: [{ required: true, message: "请输入业务线", trigger: "blur" }],
  host_record: [{ required: true, message: "请输入主机记录", trigger: "blur" }],
  main_domain: [{ required: true, message: "请输入主域名", trigger: "blur" }],
  record_type: [{ required: true, message: "请选择记录类型", trigger: "change" }],
  record_value: [{ required: true, message: "请输入记录值", trigger: "blur" }],
  ttl: [{ required: true, message: "请输入TTL", trigger: "blur" }]
};

const { currentChange, handleSizeChange } = createPaginationHandlers(params, fetchData);

onMounted(() => {
  if (route.query.domain) {
    params.domain = route.query.domain as string;
    params.main_domain = route.query.domain as string;
  }
  if (route.query.domainId) {
    params.domainId = route.query.domainId as any;
  }
  fetchData();
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

function handleAdd() {
  isEdit.value = false;
  recordForm.value = {
    id: null,
    business_line: "",
    host_record: "",
    main_domain: params.domain || "",
    record_type: "A",
    record_value: "",
    ttl: 600,
    priority: 10,
    remark: ""
  };
  recordDialogVisible.value = true;
  nextTick(() => {
    recordFormRef.value?.clearValidate();
  });
}

function handleEdit(row: any) {
  isEdit.value = true;
  recordForm.value = { ...row };
  recordDialogVisible.value = true;
  nextTick(() => {
    recordFormRef.value?.clearValidate();
  });
}

function handleSaveRecord() {
  recordFormRef.value?.validate((valid) => {
    if (valid) {
      loading.value = true;
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
          loading.value = false;
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
      deleteDomainRecord({ id: row.id })
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

.recordTable {
  margin-top: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

