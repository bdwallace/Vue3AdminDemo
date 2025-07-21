<template>
  <el-container>
    <div class="main">
      <div class="search-bock">
        <el-form :inline="true" :model="params" class="demo-form-inline">
          <el-form-item :label="transformI18n($t('label.pureAccount'))">
            <el-select v-model="params.account" placeholder="请选择账号" style="width: 400px" >
              <el-option v-for="item in supplier_list" :value="item.supplier_account" :key="item.id">
                <span style="float: left;font-weight: bold">{{ item.supplier_account }}</span>
                <span style="float: right;color: #33c38f; font-size: 13px">{{ item.remark }}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="transformI18n($t('label.pureRegion'))" >
            <el-select v-model="params.region" placeholder="请选择区域" style="width: 400px">
              <el-option v-for="item in region_list" :key="item.value" :label="item.label" :value="item.value">
                <span style="float: left">{{ item.label }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">{{ item.value }}</span>
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item>
            <el-button type="info" plain @click="fetchData" :icon="Search">{{ transformI18n($t('search.pureSearch'))}}</el-button>
          </el-form-item>
          <el-tooltip class="item" effect="dark" content="此操作需要审批" placement="top">
            <el-form-item>
              <el-button type="primary" @click="addDialogVisable=true" :icon="Plus">{{ transformI18n($t('buttons.pureCreateS3')) }}</el-button>
            </el-form-item>
          </el-tooltip>

        </el-form>

      </div>

      <div class="s3Table">
        <el-table ref="multipleTable" :data="tableData" tooltip-effect="dark"
                  border :header-cell-style="{background:'#eef1f6',color:'#606266'}"
                  @selection-change="handleSelectionChange">
          <el-table-column prop="bucket_name" label="名称" fit align="center">
            <template #default="{ row }">
              <el-button type="primary" text size="small" :icon="CopyDocument" v-if="row.bucket_name"
                         @click="copyText(row.bucket_name)" style="margin-right: 2px"></el-button>
              <el-tooltip class="item" effect="dark" :content="row.bucket_name" placement="top">
                <b style="color: #00a1c9">{{ row.bucket_name }}</b>
              </el-tooltip>
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
          <el-table-column prop="supplier_account" label="云厂商账号" fit align="center"></el-table-column>
          <el-table-column prop="region" label="区域" fit align="center"></el-table-column>
          <el-table-column prop="operitor" label="操作" align="center">
            <template #default="{row}">
              <el-tooltip class="item" effect="dark" content="此操作需要审批" placement="top">
                <el-button  type="danger" text link style="color: #ef3535" @click="deleteBucketClick(row)">
                  <el-icon ><Delete /></el-icon>删除
                </el-button>
              </el-tooltip>
              <el-tooltip class="item" effect="dark" content="此操作需要审批" placement="top">
                <el-button  type="primary" text link  @click="editPolicyClick(row)">
                  <el-icon ><EditPen /></el-icon>修改策略
                </el-button>
              </el-tooltip>
              <el-tooltip class="item" effect="dark" content="修改跨源资源共享, 此操作需要审批" placement="top">
                <el-button  type="primary" text link  @click="editCorsClick(row)">
                  <el-icon ><EditPen /></el-icon>修改CORS
                </el-button>
              </el-tooltip>
            </template>

          </el-table-column>
        </el-table>
      </div>

      <el-dialog :title="transformI18n($t('title.pureCreateBucket'))" v-model="addDialogVisable" width="45%">
        <el-form :model="addData" size="large">
          <el-form-item :label="transformI18n($t('label.pureSupplier'))" :label-width="formLabelWidth" required>
            <el-select v-model="addData.supplier_name" placeholder="请选择云厂商" style="width: 85%">
              <el-option v-for="item in suppliers" :label="item.label" :key="item.value" :value="item.value" :disabled="!item.show"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="transformI18n($t('label.pureSupplierAccount'))" :label-width="formLabelWidth" required>
            <el-select v-model="addData.supplier_account" placeholder="请选择云厂商账号" style="width: 85%">
              <el-option v-for="item in supplier_list" :key="item.id" :label="item.supplier_account" :value="item.supplier_account">
                <span style="float: left">{{ item.supplier_account }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">{{ item.remark }}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="transformI18n($t('label.pureEnv'))" :label-width="formLabelWidth" required prop="env">
            <el-select v-model="addData.env" placeholder="请选择环境" style="width: 85%" >
              <el-option v-for="item in env_list" :key="item" :label="item" :value="item">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="transformI18n($t('label.pureFunc'))" :label-width="formLabelWidth" required prop="func">
            <el-input  v-model="addData.func" style="width: 85%" placeholder="请输入用途"></el-input>
          </el-form-item>
          <el-form-item :label="transformI18n($t('label.purePermission'))" :label-width="formLabelWidth" required prop="permission">
            <el-select v-model="addData.permission" placeholder="请选择环境" style="width: 85%" >
              <el-option label="公共读写" value="pubrw">
                <span style="float: left">公共读写</span>
                <span style="float: right; color: #8492a6; font-size: 13px">pubrw</span>
              </el-option>
              <el-option label="公共读私有写" value="pubr-priw">
                <span style="float: left">公共读私有写</span>
                <span style="float: right; color: #8492a6; font-size: 13px">pubr-priw</span>
              </el-option>
              <el-option label="私有读写" value="prirw">
                <span style="float: left">私有读写</span>
                <span style="float: right; color: #8492a6; font-size: 13px">prirw</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="transformI18n($t('label.pureRegion'))" :label-width="formLabelWidth" required prop="region">
            <el-select v-model="addData.region" placeholder="请选择区域" style="width: 85%" >
              <el-option v-for="item in region_list" :key="item.value" :label="item.label" :value="item.value">
                <span style="float: left">{{ item.label }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">{{ item.value }}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="transformI18n($t('label.pureSelNumber'))" :label-width="formLabelWidth"  >
            <el-input  v-model="addData.sel_number" style="width: 85%" placeholder="可选请输入序列号"></el-input>
          </el-form-item>
          <el-form-item :label="transformI18n($t('label.pureBucketName'))" :label-width="formLabelWidth" required>
            <el-input v-model="addData.bucket_name" placeholder="请输入存储桶名称" style="width: 85%" disabled></el-input>
          </el-form-item>

<!--          <el-form-item label="所属业务:" :label-width="formLabelWidth" required>-->
<!--            <el-select v-model="addData.app_name" filterable placeholder="请选择所属业务" style="width: 85%"-->
<!--                       remote :remote-method="fetchAppData" :loading="loading">-->
<!--              <el-option v-for="item in app_list" :key="item.id" :label="item.app_name" :value="item.app_name">-->
<!--                <span style="float: left">{{ item.app_name }}</span>-->
<!--                <span style="float: right; color: #8492a6; font-size: 13px">{{ item.maintain_owner.join(' / ') }}</span>-->
<!--              </el-option>-->
<!--            </el-select>-->
<!--          </el-form-item>-->
          <el-form-item :label="transformI18n($t('label.pureApplyReason'))" :label-width="formLabelWidth" >
            <el-input type="textarea" :rows="3" v-model="addData.reason" style="width: 85%" placeholder="请输入申请原因"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer" style="text-align: center">
          <el-button @click="addDialogVisable = false">{{transformI18n($t("buttons.pureCancel"))}}</el-button>
          <el-button type="primary" @click="addItemCommit">{{transformI18n($t("buttons.pureConfirm"))}}</el-button>
        </div>
      </el-dialog>


      <el-dialog title="修改策略" v-model="editDialogVisable" width="45%">
        <el-form :model="editData" size="large">
          <el-form-item :label="transformI18n($t('label.pureSupplier'))" :label-width="formLabelWidth" required>
            <el-select v-model="editData.supplier_name" placeholder="请选择云厂商" style="width: 85%" disabled>
              <el-option v-for="item in suppliers" :label="item.label" :key="item.value" :value="item.value" :disabled="!item.show"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="transformI18n($t('label.pureSupplierAccount'))" :label-width="formLabelWidth" required>
            <el-select v-model="editData.supplier_account" placeholder="请选择云厂商账号" style="width: 85%" disabled>
              <el-option v-for="item in supplier_list" :key="item.id" :label="item.supplier_account" :value="item.supplier_account">
                <span style="float: left">{{ item.supplier_account }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">{{ item.remark }}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="存储桶名称" :label-width="formLabelWidth" required>
            <el-input  v-model="editData.bucket_name" style="width: 85%" disabled ></el-input>
          </el-form-item>
          <el-form-item label="权限策略:" :label-width="formLabelWidth">
            <el-input type="textarea" :rows="12" v-model="editData.policy" style="width: 85%"></el-input>
          </el-form-item>

        </el-form>
        <div slot="footer" class="dialog-footer" style="text-align: center">
          <el-button @click="editDialogVisable = false">{{transformI18n($t("buttons.pureCancel"))}}</el-button>
          <el-button type="primary" @click="updatePolicyCommit">{{transformI18n($t("buttons.pureConfirm"))}}</el-button>
        </div>
      </el-dialog>

      <el-dialog title="修改CORS" v-model="corsDialogVisable" width="45%">
        <el-form :model="corsData" size="large">
          <el-form-item :label="transformI18n($t('label.pureSupplier'))" :label-width="formLabelWidth" required>
            <el-select v-model="corsData.supplier_name" placeholder="请选择云厂商" style="width: 85%" disabled>
              <el-option v-for="item in suppliers" :label="item.label" :key="item.value" :value="item.value" :disabled="!item.show"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="transformI18n($t('label.pureSupplierAccount'))" :label-width="formLabelWidth" required>
            <el-select v-model="corsData.supplier_account" placeholder="请选择云厂商账号" style="width: 85%" disabled>
              <el-option v-for="item in supplier_list" :key="item.id" :label="item.supplier_account" :value="item.supplier_account">
                <span style="float: left">{{ item.supplier_account }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">{{ item.remark }}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="存储桶名称" :label-width="formLabelWidth" required>
            <el-input  v-model="corsData.bucket_name" style="width: 85%" disabled ></el-input>
          </el-form-item>
          <el-form-item label="CORS配置:" :label-width="formLabelWidth">
            <el-input type="textarea" :rows="12" v-model="corsData.cors" style="width: 85%"></el-input>
          </el-form-item>

        </el-form>
        <div slot="footer" class="dialog-footer" style="text-align: center">
          <el-button @click="corsDialogVisable = false">{{transformI18n($t("buttons.pureCancel"))}}</el-button>
          <el-button type="primary" @click="updateCorsCommit">{{transformI18n($t("buttons.pureConfirm"))}}</el-button>
        </div>
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
import {$t, transformI18n} from "@/plugins/i18n";
import { useRouter } from 'vue-router';

const router = useRouter();



defineOptions({
  name: "S3"
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
  account: "aws-core-infra", region:'ap-southeast-1'
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
watch(
  () => [addData.env, addData.func, addData.permission, addData.region, addData.sel_number],
  () => {
    const { env, func, permission, region, sel_number } = addData
    const suffix = sel_number ? `-${sel_number}` : ""
    addData.bucket_name = `s3-${env}-${func}-${permission}-dg-${region}${suffix}`
  }
)

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
  var resp = await getS3Data(params).catch(() => {
    ElMessage({type: 'error', message: '请求响应错误，请联系管理员'})
    return 0
  })
  if (resp.code === 200) {
    tableData.value = resp.data
    params.total = resp.total
  } else {
    ElMessage({type: 'error', message: resp.msg})
  }
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
      confirmButtonText: transformI18n($t('buttons.pureConfirm')),
      cancelButtonText: transformI18n($t('buttons.pureCancel')),
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

.s3Table {
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
