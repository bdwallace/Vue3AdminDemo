<template>
  <el-container>
    <div class="main">
      <div class="search-bock">
        <el-form :inline="true" :model="params" class="demo-form-inline">
          <el-form-item label="云厂商账号">
            <el-select v-model="params.account" placeholder="请选择账号" style="width: 400px" >
              <el-option v-for="item in supplier_list" :value="item.supplier_account" :key="item.id">
                <span style="float: left;font-weight: bold">{{ item.supplier_account }}</span>
                <span style="float: right;color: #33c38f; font-size: 13px">{{ item.remark }}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="区域" >
            <el-select v-model="params.region" placeholder="请选择区域" style="width: 400px">
              <el-option v-for="item in region_list" :key="item.value" :label="item.label" :value="item.value">
                <span style="float: left">{{ item.label }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">{{ item.value }}</span>
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item>
            <el-button type="info" plain @click="fetchData" :icon="Search">搜索</el-button>
          </el-form-item>
          <el-tooltip class="item" effect="dark" content="此操作需要审批" placement="top">
            <el-form-item>
              <el-button type="primary" @click="addDialogVisable=true" :icon="Plus">创建MSK</el-button>
            </el-form-item>
          </el-tooltip>

        </el-form>

      </div>

      <div class="mskTable">
        <el-table ref="multipleTable" :data="tableData" tooltip-effect="dark" v-loading="loading"
                  border :header-cell-style="{background:'#eef1f6',color:'#606266'}"
                  @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="50"></el-table-column>
          <el-table-column prop="msk_name" label="集群名称" fit align="center">
            <template #default="{ row }">
              <el-button type="text" icon="el-icon-copy-document" v-if="row.msk_name"
                         @click="copyText(row.msk_name)" style="margin-right: 2px"></el-button>
              <el-tooltip class="item" effect="dark" :content="row.msk_name" placement="top">
                <b v-if="row.msk_name.length < 22" style="color: #00a1c9">{{ row.msk_name }}</b>
                <b v-else style="color: #00a1c9">{{ row.msk_name.substr(0,22) + '...'}}</b>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column prop="proxy_type" label="代理类型" fit align="center"></el-table-column>
          <el-table-column prop="region" label="区域" fit align="center"></el-table-column>
          <el-table-column prop="security_group" label="绑定的安全组" fit align="center">
            <template #default="{ row }">
              <template v-if="row.security_group && Array.isArray(row.security_group) && row.security_group.length > 0">
                <el-tag v-for="item in row.security_group.slice(0, 3)" @click="sgDetailClick(item)"
                        style="cursor: pointer;width:80%;margin-top: 3px" size="small">{{ item }}</el-tag>
                <div v-if="row.security_group.length > 3">
                  <el-button type="text" @click="showMore(row.security_group)" style="font-size: 12px">查看更多</el-button>
                </div>
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="supplier_name" label="所属云厂商" fit align="center">
              <template #default="{ row }">
                <el-image v-if="row.supplier_name==='Aliyun'" :src="imageMap[row.supplier_name]" style="height: 50px;width: 110px"></el-image>
                <el-image v-else-if="row.supplier_name==='OpenStack'" :src="imageMap[row.supplier_name]" style="height: 40px;width: 110px"></el-image>
                <el-image v-else-if="row.supplier_name==='HuaWei'" :src="imageMap[row.supplier_name]" style="height: 45px;width: 60px"></el-image>
                <el-image v-else-if="row.supplier_name==='AWS'" :src="imageMap[row.supplier_name]" style="height: 45px;width: 90px"></el-image>
                <el-image v-else-if="row.supplier_name==='Tencent'" :src="imageMap[row.supplier_name]" style="height: 28px;width: 100px"></el-image>
                <el-image v-else-if="row.supplier_name==='ucloud'" :src="imageMap[row.supplier_name]" style="height: 45px"></el-image>
                <span v-else>{{ row.supplier_name }}</span>
              </template>
          </el-table-column>
          <el-table-column prop="supplier_account" label="云厂商账号" fit align="center">
            <template #default="{ row }">
              <span style="color: #00a1c9">{{ row.supplier_account }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="msk_version" label="Apache Kafka 版本" fit align="center"></el-table-column>
          <el-table-column prop="proxy_count" label="区(代理总数)" fit align="center"></el-table-column>

        </el-table>
      </div>

      <el-dialog :visible.sync="showMoreDialog" title="更多绑定的资源" width="30%">
        <el-tooltip class="item" effect="dark" :content="'安全组:' + item" placement="top" v-for="item in currentSource">
          <el-tag v-if="item" :key="item" style="cursor: pointer;margin: 3px 3px"  @click="sgDetailClick(item)">{{ item }}</el-tag>
        </el-tooltip>
      </el-dialog>

      <div style="padding: 10px 16px;text-align: right;">
        <el-pagination background layout="total, sizes, prev, pager, next, jumper"
                       :page-size="params.pagesize" :page-sizes="[15,30,50,100]"
                       :total="params.total"
                       @current-change="currentChange"
                       @size-change="handleSizeChange">
        </el-pagination>
      </div>
    </div>
  </el-container>
</template>

<script setup lang='ts'>

import {ref, reactive, h, watch} from "vue";
import {
  Plus, CopyDocument,
  Search, EditPen, Delete,
} from '@element-plus/icons-vue'
import {copyText, imageMap} from "@/utils/common";
import {ElMessage, ElMessageBox} from "element-plus";
import {getAppData, getSupplierData} from "@/api/other_routes";
import {
  create_s3_bucket,
  delete_s3_bucket, edit_bucket_cors,
  edit_bucket_policy,
  get_bucket_cors,
  get_bucket_policy,
  getS3Data
} from "@/api/s3_routes";
import { useRouter } from 'vue-router';
import {getMskData} from "@/api/msk_routes";

const router = useRouter();



defineOptions({
  name: "MSK"
});


const addDialogVisable = ref(false)
const editDialogVisable = ref(false)
const corsDialogVisable = ref(false)
const loading = ref(false)
let formLabelWidth = "200px"
const multipleSelection = ref([])
const supplier_list = ref([])
const tableData = ref([])
const app_list = ref([])
const env_list = ref(["infra", 'gli', 'dev', 'fat', 'uat', 'prod'])
const params = reactive({
  page: 1, pagesize: 20, total: 0,
  account: "aws-workload-middleware-uat", region:'ap-southeast-1'
})
const region_list = ref([
  {label: "亚太地区（香港）", value: "ap-east-1"},
  {label: "亚太地区（孟买）", value: "ap-south-1"},
  {label: "亚太地区（大阪）", value: "ap-northeast-3"},
  {label: "亚太地区（首尔）", value: "ap-northeast-2"},
  {label: "亚太地区（新加坡）", value: "ap-southeast-1"},
  {label: "亚太地区（悉尼）", value: "ap-southeast-2"},
  {label: "亚太地区（东京）", value: "ap-northeast-1"},
  {label: "南美洲（圣保罗）", value: "sa-east-1"},
  {label: "Canada（Central）", value: "ca-central-1"},
  {label: "美国东部（俄亥俄）", value: "us-east-2"},
  {label: "美国东部（弗吉尼亚州北部)", value: "us-east-1"},
  {label: "美国西部（北加利福尼亚）", value: "us-west-1"},
  {label: "美国西部（俄勒冈州）", value: "us-west-2"}
])
const addData = reactive({
  supplier_name: '',
  supplier_account: '',
  business_name: 'BS_middleware',
  bucket_name: "",
  sel_number: '',
  env: '',
  func: '',
  permission: '',
  region: "",
  reason: '',

})

const editData = ref({
  supplier_name: '',
  supplier_account: '',
  bucket_name: "",
  policy: ""
})

const corsData = ref({
  supplier_name: '',
  supplier_account: '',
  bucket_name: "",
  cors: ""
})

const suppliers = [
  {label: '阿里云', value: "Aliyun", show: false},
  {label: '华为云', value: "HuaWei", show: false},
  {label: '腾讯云', value: 'Tencent', show: false},
  {label: 'AWS', value: "AWS", show: true}
]

watch(() => params.account, (newVal) => {
  for (const item of supplier_list.value){
    if (newVal === item['supplier_account']){
      region_list.value = item['region_list']
    }
  }
})

watch(() => params.region, (newVal, oldVal) => {
  if (newVal !== oldVal){
    params.page = 1
    fetchData()
  }
})


fetchData()
fetchSupplierData()
fetchAppData()

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
async function fetchSupplierData(){
  var resp = await getSupplierData({page: 1, pagesize: 100, search: 'AWS'}).catch(() => {
    ElMessage({type: 'error', message: '请求响应错误，请联系管理员'})
    return 0
  })
  if (resp.code === 200) {
    supplier_list.value = resp.data
  } else {
    ElMessage({type: 'error', message: resp.msg})
  }
}

async function fetchAppData(search=null){
  loading.value = true
  var params = {page: 1, pagesize: 50}
  if (search){
    params['search'] = search
  }
  var resp = await getAppData(params).catch(() => {
    ElMessage({type: 'error', message: '请求响应错误，请联系管理员'})
    return 0
  })
  if (resp.code === 200) {
    app_list.value = resp.data
  } else {
    ElMessage({type: 'error', message: resp.msg})
  }
  loading.value = false
}

async function fetchData() {
  loading.value = true
  var resp = await getMskData(params).catch(() => {
    ElMessage({type: 'error', message: '请求响应错误，请联系管理员'})
    return 0
  })
  if (resp.code === 200) {
    tableData.value = resp.data
    params.total = resp.total
  } else {
    ElMessage({type: 'error', message: resp.msg})
    tableData.value = []
    params.total = 0
  }
  loading.value = false
}

async function addItemCommit(){

  if (addData.bucket_name.includes('undefined')){
    ElMessage({type: 'warning', message: "你有必选项没选"})
    return
  }
  if (addData.env === 'prod'){
    ElMessage({type: 'warning', message: "prod 环境创建存储库需要安全工程师审批"})
  }
  var resp = await create_s3_bucket(addData).catch(() => {
    ElMessage({type: 'warning', message: "请求响应错误，请联系管理员"})
    return 0
  })
  if (!resp){return }
  if (resp.code === 200){
    ElMessage({type: 'success', message: resp.msg})
  }else if (resp.code === 301) {
    addDialogVisable.value = false
    ElMessage({type: 'success', message: resp.msg});
    await router.push('/process')
    return
  }else {
    ElMessage({type: 'error', message: resp.msg})
  }
  addDialogVisable.value = false
  // await fetchData()
}

async function deleteBucketClick(row){
  ElMessageBox.confirm(
    '是否确认删除 ' + row.bucket_name + " 桶",
    'Warning',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    var resp = await delete_s3_bucket(row).catch(() => {
      ElMessage({type: 'warning', message: "请求响应错误，请联系管理员"})
      return 0
    })
    if (!resp){return }
    if (resp.code === 200){
      ElMessage({type: 'success', message: resp.msg})
    }else if (resp.code === 301) {
      addDialogVisable.value = false
      ElMessage({type: 'success', message: resp.msg});
      await router.push('/process')
      return
    }else {
      ElMessage({type: 'error', message: resp.msg})
    }
  }).catch((e) => {
    ElMessage({type: 'error', message: e})
  })
}


async function editPolicyClick(row){
  editData.value = {...row}
  var resp = await get_bucket_policy(editData.value).catch(() => {
    ElMessage({type: 'warning', message: "请求响应错误，请联系管理员"})
    return 0
  })
  if (!resp){return }
  if (resp.code === 200){
    editData.value.policy = resp.data
  }else {
    ElMessage({type: 'error', message: resp.msg})
  }
  editDialogVisable.value = true
}
async function updatePolicyCommit(){
  var resp = await edit_bucket_policy(editData.value).catch(() => {
    ElMessage({type: 'warning', message: "请求响应错误，请联系管理员"})
    return 0
  })
  if (!resp){return }
  if (resp.code === 200){
    ElMessage({type: 'success', message: resp.msg})
  }else if (resp.code === 301) {
    addDialogVisable.value = false
    ElMessage({type: 'success', message: resp.msg});
    await router.push('/process')
    return
  }else {
    ElMessage({type: 'error', message: resp.msg})
  }
  editDialogVisable.value = false
}

async function editCorsClick(row){
  corsData.value = {...row}
  var resp = await get_bucket_cors(corsData.value).catch(() => {
    ElMessage({type: 'warning', message: "请求响应错误，请联系管理员"})
    return 0
  })
  if (!resp){return }
  if (resp.code === 200){
    corsData.value.cors = resp.data
  }else {
    ElMessage({type: 'error', message: resp.msg})
  }
  corsDialogVisable.value = true
}

async function updateCorsCommit(){
  var resp = await edit_bucket_cors(corsData.value).catch(() => {
    ElMessage({type: 'warning', message: "请求响应错误，请联系管理员"})
    return 0
  })
  if (!resp){return }
  if (resp.code === 200){
    ElMessage({type: 'success', message: resp.msg})
  }else if (resp.code === 301) {
    corsDialogVisable.value = false
    ElMessage({type: 'success', message: resp.msg});
    await router.push('/process')
    return
  }else {
    ElMessage({type: 'error', message: resp.msg})
  }
  corsDialogVisable.value = false
}
</script>

<style scoped>
.main {
  margin-top: 1px;
  width: 100%;
  height: 90%;
}

.mskTable {
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
