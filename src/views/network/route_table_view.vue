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
              <el-button type="primary" @click="addDialogVisable=true" :icon="Plus">创建VPC</el-button>
            </el-form-item>
          </el-tooltip>

        </el-form>

      </div>

      <div class="routeTable">
        <el-table ref="multipleTable" :data="tableData" tooltip-effect="dark" v-loading="loading"
                  border :header-cell-style="{background:'#eef1f6',color:'#606266'}"
                  @selection-change="handleSelectionChange">
          <el-table-column prop="Name" label="路由表名称" fit align="center" sortable>
            <template #default="{ row }">
              <b style="cursor: pointer" @click="detailClick(row)">{{ row.Name }}</b>
            </template>
          </el-table-column>

          <el-table-column prop='RouteTableId' label="路由表ID" fit align="center" sortable>
            <template #default="{ row }">
              <el-button type="text" icon="el-icon-copy-document" v-if="row.RouteTableId"
                         @click="copyText(row.RouteTableId)" style="margin-right: 2px;padding: 5px 2px"></el-button>
              <el-tooltip class="item" effect="dark" :content="row.RouteTableId" placement="top">
                <b style="color: #00a1c9; cursor: pointer" @click="detailClick(row)">{{ row.RouteTableId }}</b>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column prop="Associations" label="关联子网" fit align="center" sortable>
            <template #default="{ row }">
              <b v-for="item in row.Associations" style="color: #00a1c9">{{ item.SubnetId }} / {{ row.SubnetName }}</b>
            </template>
          </el-table-column>
          <el-table-column prop="VpcId" label="VPC ID" fit align="center" sortable></el-table-column>
          <el-table-column prop="Region" label="区域" fit align="center" sortable></el-table-column>
          <el-table-column prop="OwnerId" label="OwnerId" fit align="center" sortable></el-table-column>
<!--          <el-table-column prop="operitor" label="操作" align="center">-->
<!--            <template #default="{row}">-->
<!--              <el-tooltip class="item" effect="dark" content="此操作需要审批" placement="top">-->
<!--                <el-button  type="danger" text link style="color: #ef3535" @click="deleteBucketClick(row)">-->
<!--                  <el-icon ><Delete /></el-icon>删除-->
<!--                </el-button>-->
<!--              </el-tooltip>-->
<!--            </template>-->

<!--          </el-table-column>-->
        </el-table>
      </div>

      <el-dialog title="路由详情" v-model="dialogRoutesTableVisible">
        <el-table :data="routesData" >
          <el-table-column property="DestinationCidrBlock" label="目标" fit align="center">
            <template #default="{ row }">
              <span v-if="row.DestinationCidrBlock">{{ row.DestinationCidrBlock }}</span>
              <span v-if="row.DestinationPrefixListId">{{ row.DestinationPrefixListId }}</span>
            </template>
          </el-table-column>
          <el-table-column property="GatewayId" label="目标" fit align="center">
            <template #default="{ row }">
              <b style="color: #00a1c9" v-if="row.GatewayId">{{ row.GatewayId }}</b>
              <b style="color: #00a1c9" v-else-if="row.TransitGatewayId">{{ row.TransitGatewayId }}</b>
            </template>
          </el-table-column>
          <el-table-column property="State" label="状态" fit align="center"></el-table-column>
        </el-table>
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

import {ref, reactive, h, watch, computed} from "vue";
import {
  Plus, CopyDocument,
  Search, EditPen, Delete,
} from '@element-plus/icons-vue'
import {copyText, imageMap} from "@/utils/common";
import {ElMessage, ElMessageBox} from "element-plus";
import {getAppData, getSupplierData} from "@/api/other_routes";
import { useRouter } from 'vue-router';
import {getRouteData} from "@/api/routes";

const router = useRouter();



defineOptions({
  name: "RouteTable"
});


const addDialogVisable = ref(false)
const dialogRoutesTableVisible = ref(false)
const title = ref("")
const  loading = ref(true)
let formLabelWidth = "200px"
const multipleSelection = ref([])
const supplier_list = ref([])
const tableData = ref([])
const routesData = ref([])

const app_list = ref([])
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

}

async function fetchData() {
  loading.value = true
  var resp = await getRouteData(params).catch(() => {
    ElMessage({type: 'error', message: '请求响应错误，请联系管理员'})
    return 0
  })
  if (resp.code === 200) {
    tableData.value = resp.data
    params.total = resp.total
  } else {
    ElMessage({type: 'error', message: resp.msg})
  }
  loading.value = false
}
function detailClick(row) {
  console.log("已执行")
  title.value = row.SubnetName + ' 路由详情'
  dialogRoutesTableVisible.value = true
  routesData.value = row.Routes
  console.log(routesData.value)
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


</script>

<style scoped>
.main {
  margin-top: 1px;
  width: 100%;
  height: 90%;
}

.routeTable {
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
