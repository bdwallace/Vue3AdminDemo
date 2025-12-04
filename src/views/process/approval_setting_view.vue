<template>
  <el-container>
    <div class="main" >
      <div class="search-bock">
        <el-input placeholder="请输入搜索内容, 支持所有内容模糊搜索, 回车或点击按钮搜索" style="width: 70%" v-model="params.search" class="input-with-select" size="large">
            <template #append>
              <el-button :icon="Search" @click="fetchData" />
            </template>
        </el-input>
        <el-button type="primary" @click="setDialogVisable=true" :icon="Plus" style="margin-left: 15px">{{ 'title.pureAddApprovalEvent' }}</el-button>

      </div>

      <div class="approvalSettingTable">
        <el-table ref="multipleTable" :data="tableData" tooltip-effect="dark" stripe
          border :header-cell-style="{background:'#eef1f6',color:'#606266'}"
          @selection-change="handleSelectionChange">


          <el-table-column prop="option_type" label="操作类型" fit align="center"></el-table-column>

          <el-table-column prop="approver" label="审批人" fit align="center">
            <template #default="{ row }">
              <el-tag size="small" v-for="item in row.approver" style="margin-left: 3px;margin-top: 3px">{{ item }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="update_time" label="更新时间" fit align="center"></el-table-column>
          <el-table-column prop="operitor" label="操作" fit align="center">
            <template #default="{ row }">
              <el-button  type="primary" text link @click="editItemClick(row)"><el-icon ><EditPen /></el-icon>编辑</el-button>
              <el-button  type="danger" text link style="color: #ef3535" @click="deleteApprovalEventClick(row)">
                <el-icon ><Delete /></el-icon>删除
              </el-button>
            </template>
          </el-table-column>

        </el-table>
      </div>

      <el-dialog :title="'title.pureAddApprovalEvent'" v-model="setDialogVisable" width="45%">
        <el-form :model="addData" size="large">
          <el-form-item :label="'label.pureOptionType'" :label-width="formLabelWidth" required>
            <el-input v-model="addData.option_type" style="width: 85%" placeholder="请输入操作类型"></el-input>
          </el-form-item>
          <el-form-item :label="'label.pureApprover'" :label-width="formLabelWidth" required>
            <el-select v-model="addData.approvers" multiple filterable placeholder="请选择审批人" style="width: 85%">
                <el-option v-for="item in approver_list" :key="item.email" :label="item.user_name" :value="item.email">
                  <span style="float: left">{{ item.user_name }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">{{ item.email }}</span>
                </el-option>
              </el-select>
          </el-form-item>

        </el-form>
        <div slot="footer" class="dialog-footer" style="text-align: center">
          <el-button @click="setDialogVisable = false">{{"buttons.pureCancel"}}</el-button>
          <el-button type="primary" @click="addCommit">{{"buttons.pureConfirm"}}</el-button>
        </div>
      </el-dialog>

      <el-dialog title="编辑" v-model="dialogEditVisible" width="45%">
        <el-form :model="editData" size="large">
          <el-form-item :label="'label.pureOptionType'" :label-width="formLabelWidth" required>
            <el-input v-model="editData.option_type" style="width: 85%" placeholder="请输入操作类型"></el-input>
          </el-form-item>
          <el-form-item :label="'label.pureApprover'" :label-width="formLabelWidth" required>
            <el-select v-model="editData.approvers" multiple filterable placeholder="请选择审批人" style="width: 85%">
              <el-option v-for="item in approver_list" :key="item.email" :label="item.user_name" :value="item.email">
                <span style="float: left">{{ item.user_name }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">{{ item.email }}</span>
              </el-option>
            </el-select>
          </el-form-item>

        </el-form>
        <div slot="footer" class="dialog-footer" style="text-align: center">
          <el-button @click="dialogEditVisible = false">{{"buttons.pureCancel"}}</el-button>
          <el-button type="primary" @click="editItemCommit">{{"buttons.pureConfirm"}}</el-button>
        </div>
      </el-dialog>

      <div style="padding: 10px 16px;text-align: right;">
        <el-pagination background  layout="total, sizes, prev, pager, next, jumper"
                     :page-size="params.pagesize" :page-sizes="[10,20,50,100]"
                     :total="params.total"
                     @current-change="currentChange"
                     @size-change="handleSizeChange">
        </el-pagination>
      </div>
    </div>
  </el-container>
</template>

<script setup lang='ts'>

import {ref, reactive, h} from "vue";
import {
  Delete,
  EditPen,
  Plus,
  Search,
} from '@element-plus/icons-vue'
import {
  addApprovalEvent, deleteApprovalEvent, deleteSupplierAccount,
  editSupplierAccount,
  getApprovalEvent,
  getProcessData,
  getUserData,
  updateApprovalEvent
} from "@/api/other_routes";
import {ElMessage, ElMessageBox} from 'element-plus'
import Cookie from "js-cookie";


defineOptions({
  name: "ProcessSetting"
});

const setDialogVisable = ref(false)
const dialogEditVisible = ref(false)
const formLabelWidth = '150px'
const params = reactive({page: 1, pagesize: 20, total: 0, search: ""})
const multipleSelection = ref([])
const tableData = ref([])
const approver_list = ref([])
const editData = reactive({
  option_type: "",
  approvers: []
})
const addData = ref({
  option_type: "",
  approvers: []
})


fetchData()
fetchUserData()

function currentChange(page) {
  params.page = page
  fetchData()
}
function handleSizeChange(pagesize) {
  params.pagesize = pagesize
  fetchData()
}
function handleSelectionChange(val) {
  multipleSelection.value = val
}
function fetchData() {

  getApprovalEvent(params).then(resp => {
    if (resp.code === 200) {
      tableData.value = resp.data
      params["total"] = resp.total
    } else {
      ElMessage({type: 'error', message: resp.msg})
    }
  })
  .catch(error => {
    console.error("Error fetching supplier data:", error);
  });
}

function fetchUserData(){
  getUserData().then(resp => {
    if (resp.code === 200) {
      approver_list.value = resp.data
    } else {
      ElMessage({type: 'error', message: resp.msg})
    }
  })
  .catch(error => {
    console.error("Error fetching supplier data:", error);
  });

}

function addCommit(){
  addApprovalEvent(addData.value).then(resp => {
    if (resp.code === 200) {
      ElMessage({type: 'success', message: resp.msg})
    } else {
      ElMessage({type: 'error', message: resp.msg})
    }
  })
  .catch(error => {
    console.error("Error fetching supplier data:", error);
  });
  fetchData()
  setDialogVisable.value = false
}

function editItemClick(row){
  console.log(row)
  dialogEditVisible.value = true
  editData.option_type= row.option_type
  editData.approvers = row.approver
  editData.id = row.id
}

async function editItemCommit(){
  await updateApprovalEvent(editData).then(resp => {
    if (resp.code === 200) {
      ElMessage({type: 'success', message: resp.msg || 'Success'})
    } else {
      ElMessage({type: 'warning', message: resp.msg})
    }
  }).catch(error => {
    console.log(error)
    ElMessage({type: 'error', message: "请求响应失败，请联系管理员"})
  });
  await fetchData()
  dialogEditVisible.value = false
}

async function deleteApprovalEventClick(row){
  deleteApprovalEvent({id: row.id}).then(resp => {
    if (resp.code === 200) {
      ElMessage({type: 'success', message: resp.msg || 'Success'})
    } else {
      ElMessage({type: 'warning', message: resp.msg})
    }
  }).catch(error => {
    console.log(error)
    ElMessage({type: 'error', message: "请求响应失败，请联系管理员"})
  });
  await fetchData()
}

</script>

<style scoped>
.main {
  margin-top: 1px;
  width: 100%;
  height: 90%;
}

.approvalSettingTable {
  margin-top: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}
/*
.demoTable ::v-deep .el-table .cell {
  white-space: pre-line;
}


.input-with-select .el-input-group__prepend {
  background-color: #fff;
}
*/
</style>
