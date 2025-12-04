<template>
  <div class="process">
    <el-result v-if="title === '任务完成'" icon="success" :title="title"></el-result>
    <el-result v-else-if="title.indexOf('失败') !==- 1" icon="error" :title="title"></el-result>
    <el-result v-else-if="title.indexOf('未通过') !==- 1" icon="error" :title="title"></el-result>
    <el-result v-else-if="title.indexOf('取消') !==- 1" icon="error" :title="title"></el-result>
    <el-result v-else :title="title">
      <template #icon>
        <div class="loader"></div>
      </template>>
    </el-result>
    <div style="margin-top: 20px">
      <el-steps :active="steps[state]" align-center finish-status="success" :process-status="process_status.value">
        <el-step title="提交审批"></el-step>
        <el-step title="审批中"></el-step>
        <el-step v-if="!approval_status" title="审批完成" ></el-step>
        <el-step v-if="approval_status" title="审批未通过" ></el-step>
        <el-step v-if="!task_status" title="任务执行中"></el-step>
        <el-step v-if="task_status" title="任务执行失败"></el-step>
        <el-step title="任务完成"></el-step>
      </el-steps>
    </div>

    <div class="card">
      <el-card class="box-card" >
        <div slot="header" class="clearfix">
          <span style="font-weight: bold; font-size: 20px">{{ name }}</span>
          <div style="float: right">
            <el-button v-if="state==='审批中' && !approval_status" type="warning" plain style="margin-right: 2px" @click="approvalClick(true)">批准</el-button>
            <el-button v-if="state==='审批中' && !approval_status" type="primary" plain style="margin-right: 2px" @click="approvalClick(false)">拒绝</el-button>
            <el-button v-if="state==='审批中' && !approval_status" type="primary" plain @click="cancelClick(id)" >取消</el-button>
          </div>

        </div>


        <el-table ref="multipleTable" :data="tableData" tooltip-effect="dark" v-if="name&&name.indexOf('存储桶') !== -1"
          border :header-cell-style="{background:'#eef1f6',color:'#606266'}">

<!--          <el-table-column type="selection" width="60"></el-table-column>-->
          <el-table-column prop="bucket_name" label="存储桶名称" fit align="center"></el-table-column>
          <el-table-column prop="account" label="云厂商账号" fit align="center"></el-table-column>
          <el-table-column prop="region" label="区域" fit align="center"></el-table-column>
          <el-table-column prop="policy" label="策略" fit align="center" v-if="tableData.some(item => item.policy)">
            <template #default="{row}">
              <el-button type="primary" text link icon="el-icon-info" @click="detailClick(row.policy)">查看详情</el-button>
            </template>
          </el-table-column>
          <el-table-column prop="cors" label="Cors配置" fit align="center" v-if="tableData.some(item => item.cors)">
            <template #default="{row}">
              <el-button type="primary" text link @click="detailClick(row.cors)">查看详情</el-button>
            </template>
          </el-table-column>
        </el-table>

      </el-card>
    </div>

    <el-dialog v-model="showMoreDialog" title="详情" width="40%">
      <el-input type="textarea" autosize v-model="detail" style="width: 85%; margin-left: 50px"></el-input>

    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import {ref, reactive, h} from "vue";
import {ElMessage, ElMessageBox} from 'element-plus'
import { useRoute } from "vue-router";
import {approvalProcess, cancelApproval, getProcessData} from "@/api/other_routes";
import {Loading} from "@element-plus/icons-vue";

defineOptions({
  name: "Approval_Detail"
});

const name = ref('')
const detail = ref('')
const showMoreDialog = ref(false)
const title = ref('审批中')
const steps = {
  "提交审批": 1,
  "审批中": 2,
  "审批完成": 3,
  '审批未通过': 3,
  "任务执行中": 4,
  '任务执行失败': 4,
  "任务完成": 5
}
const tableData = ref([])
const state = ref("审批中")
const approval_status = ref(false)
const user_name = ref('')
const approver = ref('')
const task_status = ref(false)
const process_status = ref('process')

const route = useRoute();
const id = route.params.id


fetchData()

async function fetchData() {

  var resp = await getProcessData({search: id}).catch(() => {
    ElMessage({type: "error", message: "请求失败"})
    return 0
  })
  if (!resp) {
    return
  }
  if (resp.code === 200) {
    var data = resp.data[0]
    name.value = data.process_type
    state.value= data.status
    title.value = data.status
    approver.value = data.approver
    user_name.value = data.username
    if (data.status === '审批未通过') {
      approval_status.value = true
      process_status.value = 'error'
      state.value = '审批中'
    } else if (data.status === '任务执行失败') {
      task_status.value = true
      process_status.value = 'error'
      state.value = '任务执行中'
    }
    tableData.value = [data.process_data]

  } else {
    ElMessage({type: "warning", message: resp.msg})
  }

}
async function approvalClick(tof) {
  // 判断当前用户是否有权限审批
  if (tof) {
    ElMessageBox.confirm('请确认是否批准？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      var response = await approvalProcess({"process_name": id, approval_status: tof})
      if (response.code === 200) {
        ElMessage({type: 'success', message: '已批准'});
        await fetchData();
      } else {
        ElMessage({type: 'warning', message: response.msg});
      }
    }).catch(() => {
      ElMessage({type: 'info', message: '已取消审批'});
    })
  } else {
    ElMessageBox.confirm('请确认是否拒绝？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      var response = await approvalProcess({"process_name": id, approval_status: tof})
      if (response.code === 200) {
        ElMessage({type: 'success', message: '已拒绝'});
        await fetchData();
      } else {
        ElMessage({type: 'warning', message: response.msg});
      }
    }).catch(() => {
      ElMessage({type: 'info', message: '已取消审批'});
    })
  }

}
async function cancelClick(name) {
  ElMessageBox.confirm('请确认是否取消此审批？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    var response = await cancelApproval({"process_name": name})
    if (response.code === 200) {
      ElMessage({type: 'success', message: '已取消审批'});
      title.value = "已取消"
      await fetchData()
    } else {
      ElMessage({type: 'error', message: response.msg});
    }
  }).catch(() => {
    ElMessage({type: 'info', message: '已取消审批'});
  })

}

function detailClick(data){
  showMoreDialog.value = true
  detail.value = data
}
</script>

<style scoped>
.process {
  padding-top: 20px;
  width: 100%;
  height: 100%;

}

.tag {
  width: 95%;
  margin-right: 2px;
  margin-top: 4px;
}

.card {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.text {
  font-size: 14px;
}

.item {
  margin-bottom: 18px;
  height: 300px;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}

.clearfix:after {
  clear: both
}

.box-card {
  margin-top: 20px;
  width: 75%;
}

.loader {
  width: 50px;
  height: 50px;
  position: relative;
  animation: spin 1s infinite linear;
}

.loader:before,
.loader:after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-top-color: #ff5722;
  border-radius: 50%;
}

.loader:before {
  animation: spin 2s infinite ease-in-out;
}

.loader:after {
  animation: spin 1s infinite linear;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
