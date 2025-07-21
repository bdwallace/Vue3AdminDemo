<template>
  <el-container>
    <div class="main" >
      <div class="search-bock">
        <el-select v-model="params.applier" placeholder="请选择申请人" style="margin-right: 10px;width: 150px"
                   @change="fetchData" filterable clearable size="large">
          <el-option v-for="item in applicant_list" :label="'申请人:' + item" :value="item">
          </el-option>
        </el-select>
        <el-input placeholder="请输入搜索内容, 支持所有内容模糊搜索, 回车或点击按钮搜索" style="width: 70%" v-model="params.search" class="input-with-select" size="large">
            <template #append>
              <el-button :icon="Search" @click="fetchData" />
            </template>
        </el-input>
<!--        <el-tooltip class="item" effect="dark" content="此操作需要审批" placement="top">-->
<!--          <el-button type="primary" @click="setDialogVisable=true" :icon="Plus">{{ transformI18n($t('buttons.pureSettings')) }}</el-button>-->
<!--        </el-tooltip>-->
        <el-checkbox-group v-model="approval_status" style="margin-top: 5px">
          <el-checkbox v-for="key in ['审批中', '任务执行中', '已取消', '任务完成']" :value="key" :label="key" @change="fetchData"></el-checkbox>
        </el-checkbox-group>
      </div>

      <div class="processTable">
        <el-table ref="multipleTable" :data="tableData" tooltip-effect="dark" stripe
          border :header-cell-style="{background:'#eef1f6',color:'#606266'}"
          @selection-change="handleSelectionChange">

<!--          <el-table-column type="selection" width="60"></el-table-column>-->
          <el-table-column prop="process_name" label="进度名称" fit align="center"></el-table-column>
          <el-table-column prop="process_type" label="操作类型" fit align="center"></el-table-column>

          <el-table-column prop="platform" label="审批平台" fit align="center">
            <template #default="{ row }">
              <el-image v-if="row.platform==='Lark'" :src="imageMap['lark']" style="width: 70px"></el-image>
            </template>
          </el-table-column>
          <el-table-column prop="applier" label="申请人" fit align="center"></el-table-column>
          <el-table-column prop="approver" label="审批人" fit align="center">
            <template #default="{ row }">
              <el-tag size="small" v-for="item in row.approver.split(',')" style="margin-left: 3px;margin-top: 3px">{{ item }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column  prop="status" label="状态" fit align="center" sortable>
            <template #default="{ row }" >
              <el-tag v-if="row.status==='任务完成'" type='success' icon="el-icon-check">{{ row.status }}</el-tag>
              <el-button v-else-if="row.status==='审批中'" circle type="primary" >
                <el-icon class="is-loading"><Loading /></el-icon>
              </el-button>
              <el-tag v-else-if="row.status==='已取消' || row.status==='任务执行失败'" type="danger"  >{{ row.status }}</el-tag>
              <el-tag v-else-if="row.status==='任务执行中'">{{ row.status }}</el-tag>
              <el-tag v-else type="warning" >{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="result" label="执行结果" fit align="center">
            <template #default="{ row }">
              <el-tooltip class="item" effect="dark" :content="row.result" placement="top" v-if="row.result">
                <span v-if="row.result.length < 30">{{ row.result }}</span>
                <span v-else>{{ row.result.substr(0,30) + '...'}}</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column prop="create_time" label="申请时间" fit align="center"></el-table-column>
          <el-table-column prop="operitor" label="操作" fit align="center">
            <template #default="{ row }">
              <el-button type="primary" text link icon="el-icon-info" @click="detail(row.process_name)">详情</el-button>
<!--              <el-button v-if="row.status==='审批中'" type="text" icon="el-icon-close" @click="cancelClick(row.process_name)">取消</el-button>-->

              <el-button v-if="row.status==='审批中'" type="primary" text link icon="el-icon-close" @click="cancelClick(row.process_name)">取消</el-button>

            </template>
          </el-table-column>

        </el-table>
      </div>

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
  Loading,
  Search,
} from '@element-plus/icons-vue'
import {cancelApproval, getProcessData} from "@/api/other_routes";
import { ElMessage } from 'element-plus'
import Cookie from "js-cookie";
import {$t, transformI18n} from "@/plugins/i18n";
import {imageMap} from "@/utils/common";
import { useRouter } from 'vue-router';

const router = useRouter();


defineOptions({
  name: "Process"
});


const params = reactive({page: 1, pagesize: 20, total: 0, search: ""})
const approval_status = ref([])
const multipleSelection = ref([])
const applicant_list = ref([])
const tableData = ref([])

params['applier'] = Cookie.get("user_name")
fetchData()
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

  if (approval_status.value.length !== 0){
    params['status__in'] = JSON.stringify(approval_status.value)
  }else {
    delete params['status__in']
  }

  if (!params['applier']){
    delete params['applier']
  }
  getProcessData(params).then(resp => {
    if (resp.code === 200) {
      tableData.value = resp.data
      params["total"] = resp.total
      applicant_list.value = resp['applicant_list']
    } else {
      ElMessage({type: 'error', message: resp.msg})
    }
  })
  .catch(error => {
    console.error("Error fetching supplier data:", error);
  });
}

function detail(process_name){
  router.push('/detail/' + process_name)
}
async function cancelClick(name){
    var response = await cancelApproval({"process_name": name})
    if (response.code === 200) {
      ElMessage({type: 'success', message: "已取消审批单"})
      await fetchData()
    } else {
      ElMessage({type: 'error', message: response.msg})
    }
}

</script>

<style scoped>
.main {
  margin-top: 1px;
  width: 100%;
  height: 90%;
}

.processTable {
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
