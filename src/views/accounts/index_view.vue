<template>
  <el-container>
    <div class="main">
      <div>
        <el-input placeholder="请输入搜索内容, 支持所有内容模糊搜索, 回车或点击按钮搜索" v-model="params.search"
                  @change="fetchData" style="width: 70%" class="input-with-select" size="large">
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
        <el-tooltip class="item" effect="dark" content="新增云厂商账号AKSK" placement="top">
          <el-button type="primary" :icon="Plus" style="margin-left: 20px" @click="dialogAddVisible=true">
            {{ transformI18n($t('buttons.pureAddCount')) }}
          </el-button>
        </el-tooltip>

      </div>


      <div class="supplierTable">
        <el-table ref="multipleTable" :data="tableData" tooltip-effect="dark" stripe
                  border :header-cell-style="{background:'#eef1f6',color:'#606266'}"
                  @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="50"></el-table-column>
          <el-table-column prop="supplier_name" label="云厂商" fit align="center" sortable>
            <template #default="item">
              <el-image v-if="item.row.supplier_name==='Aliyun'" :src="imageMap[item.row.supplier_name]" style="height: 50px;width: 110px"></el-image>
              <el-image v-else-if="item.row.supplier_name==='OpenStack'" :src="imageMap[item.row.supplier_name]" style="height: 40px;width: 110px"></el-image>
              <el-image v-else-if="item.row.supplier_name==='HuaWei'" :src="imageMap[item.row.supplier_name]" style="height: 45px;width: 60px"></el-image>
              <el-image v-else-if="item.row.supplier_name==='AWS'" :src="imageMap[item.row.supplier_name]" style="height: 45px;width: 90px"></el-image>
              <el-image v-else-if="item.row.supplier_name==='Tencent'" :src="imageMap[item.row.supplier_name]" style="height: 28px;width: 100px"></el-image>
              <el-image v-else-if="item.row.supplier_name==='ucloud'" :src="imageMap[item.row.supplier_name]" style="height: 45px"></el-image>
              <span v-else>{{ item.row.supplier_name }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="supplier_account" label="云厂商账号" fit align="center" sortable></el-table-column>
          <el-table-column prop="region" label="默认区域" fit align="center" sortable></el-table-column>
          <el-table-column prop="update_time" label="更新时间" fit align="center" sortable></el-table-column>
          <el-table-column prop="status" label="账号状态" width="110px" align="center" sortable>
            <template #default="item" >
              <el-tag v-if="item.row.status==='未知'" type='warning'> {{ item.row.status }}</el-tag>
              <el-tag v-else-if="item.row.status==='检测中...'" type="primary">{{ item.row.status }}</el-tag>
              <el-tag v-else-if="item.row.status==='同步中...'" type="primary">{{ item.row.status }}</el-tag>
              <el-tag v-else-if="item.row.status==='正常'" type="success">{{ item.row.status }}</el-tag>
              <el-tag v-else-if="item.row.status==='同步完成'" type="success">{{ item.row.status }}</el-tag>
              <el-tag v-else-if="item.row.status==='异常'" type='danger'> {{ item.row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" fit align="center" sortable></el-table-column>
          <el-table-column prop="operitor" label="操作" align="center">

            <template #default="{row}">
              <el-tooltip class="item" effect="dark" content="检查账号是否可用" placement="top">
                <el-button  type="primary" text link @click="healthCheckClick(row)"><FontIcon icon="icon-jiankangjiancha" style="font-size: 20px"></FontIcon>检测</el-button>
              </el-tooltip>
              <el-button  type="primary" text link @click="editItemClick(row)"><el-icon ><EditPen /></el-icon>编辑</el-button>
              <el-button  type="danger" text link style="color: #ef3535" @click="deleteAccountClick(row)">
                <el-icon ><Delete /></el-icon>删除
              </el-button>
            </template>

          </el-table-column>
        </el-table>
      </div>

      <el-dialog v-model="dialogAddVisible" :title="transformI18n($t('title.pureAddSupplier'))" width="45%" draggable >
        <el-form ref="ruleFormRef" :model="addData"
          :rules="rules" :label-width="formLabelWidth" size="large"
        >
           <el-form-item :label="transformI18n($t('label.pureSupplier'))" :label-width="formLabelWidth" prop="supplier_name" required >
            <el-select v-model="addData.supplier_name" placeholder="请选择或输入供应商" style="width: 85%" allow-create filterable>
              <el-option
                v-for="item in supplier_list"
                :key="item.value"
                :label="item.label"
                :value="item.value" :disabled="!item.show">
              </el-option>

            </el-select>
          </el-form-item>
          <el-form-item :label="transformI18n($t('label.pureAccount'))" :label-width="formLabelWidth" prop="supplier_account" required>
            <el-input v-model="addData.supplier_account" placeholder='可以随意命名，建议以邮箱命名，便于区分' style="width: 85%"></el-input>
          </el-form-item>

          <el-form-item :label="transformI18n($t('label.pureDefaultRegion'))" :label-width="formLabelWidth" prop="region" required>
            <el-input v-model="addData.region" placeholder='请选择 或 输入默认区域' style="width: 85%"></el-input>
          </el-form-item>


          <el-form-item label="API KEY(用户名)" :label-width="formLabelWidth" prop="api_key" required>
            <el-input v-model="addData.api_key" style="width: 85%" type="password" show-password placeholder="请输入AK"></el-input>
          </el-form-item>
          <el-form-item label="API SECRET(密码)" :label-width="formLabelWidth" prop="api_key" required>
            <el-input v-model="addData.api_secret" style="width: 85%" type="password" show-password placeholder="请输入SK"></el-input>
          </el-form-item>
          <el-form-item :label="transformI18n($t('label.pureRemark'))" :label-width="formLabelWidth">
            <el-input type="textarea" :rows="3" v-model="addData.remark" style="width: 85%"></el-input>
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer" style="text-align: center">
            <el-button @click="dialogAddVisible = false">{{transformI18n($t("buttons.pureCancel"))}}</el-button>
            <el-button type="primary" @click="addCommit(ruleFormRef)">{{transformI18n($t("buttons.pureConfirm"))}}</el-button>
          </div>
        </template>
      </el-dialog>

      <el-dialog v-model="dialogEditVisible" :title="transformI18n($t('title.pureEditSupplier'))" width="45%" draggable >
        <el-form ref="ruleFormRef" :model="editData"
          :rules="rules" :label-width="formLabelWidth" size="large"
        >
           <el-form-item :label="transformI18n($t('label.pureSupplier'))" :label-width="formLabelWidth" prop="supplier_name" required >
            <el-select v-model="editData.supplier_name" placeholder="请选择或输入供应商" style="width: 85%" disabled>
              <el-option
                v-for="item in supplier_list"
                :key="item.value"
                :label="item.label"
                :value="item.value" :disabled="!item.show">
              </el-option>

            </el-select>
          </el-form-item>
          <el-form-item :label="transformI18n($t('label.pureAccount'))" :label-width="formLabelWidth" prop="supplier_account" required>
            <el-input v-model="editData.supplier_account" placeholder='可以随意命名，建议以邮箱命名，便于区分' style="width: 85%"></el-input>
          </el-form-item>

          <el-form-item :label="transformI18n($t('label.pureDefaultRegion'))" :label-width="formLabelWidth" prop="region" required>
            <el-input v-model="editData.region" placeholder='请选择 或 输入默认区域' style="width: 85%"></el-input>
          </el-form-item>


          <el-form-item label="API KEY(用户名)" :label-width="formLabelWidth" prop="api_key" required>
            <el-input v-model="editData.api_key" style="width: 85%" type="password" show-password placeholder="请输入AK"></el-input>
          </el-form-item>
          <el-form-item label="API SECRET(密码)" :label-width="formLabelWidth" prop="api_key" required>
            <el-input v-model="editData.api_secret" style="width: 85%" type="password" show-password placeholder="请输入SK"></el-input>
          </el-form-item>
          <el-form-item :label="transformI18n($t('label.pureRemark'))" :label-width="formLabelWidth">
            <el-input type="textarea" :rows="3" v-model="editData.remark" style="width: 85%"></el-input>
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer" style="text-align: center">
            <el-button @click="dialogAddVisible = false">{{transformI18n($t("buttons.pureCancel"))}}</el-button>
            <el-button type="primary" @click="editItemCommit">{{transformI18n($t("buttons.pureConfirm"))}}</el-button>
          </div>
        </template>
      </el-dialog>
      <div style="padding: 10px 16px;text-align: right;">
        <el-pagination background layout="total, sizes, prev, pager, next, jumper"
                       :page-size="params.pagesize" :page-sizes="[20,30,50,100]"
                       :total="params.total"
                       @current-change="currentChange"
                       @size-change="handleSizeChange">
        </el-pagination>
      </div>
    </div>
  </el-container>
</template>

<script setup lang='ts'>
import {$t, transformI18n} from "@/plugins/i18n";

import {ref, reactive, h} from "vue";
import {
  Plus, Search, Delete, EditPen
} from '@element-plus/icons-vue'
import {
  AccountHealthCheck,
  addSupplierAccount,
  deleteSupplierAccount,
  editSupplierAccount,
  getSupplierData
} from "@/api/other_routes";
import {ElMessage, ElMessageBox} from "element-plus";
import type { FormInstance, FormRules } from 'element-plus'
import { useRenderIcon } from '@/components/ReIcon/src/hooks'
import {useWatermark} from "@pureadmin/utils";


defineOptions({
  name: "Account"
});

// 数据
const dialogAddVisible = ref(false)
const dialogEditVisible = ref(false)
const formLabelWidth = '150px'
const params = reactive({page: 1, pagesize: 20, total: 0, search: ""})
const multipleSelection = ref([])
const tableData = ref([])
const imageMap = {
  Aliyun: new URL('@/assets/aliyun.png', import.meta.url).href,
  OpenStack: new URL('@/assets/openstack.png', import.meta.url).href,
  HuaWei: new URL('@/assets/huawei.png', import.meta.url).href,
  AWS: new URL('@/assets/aws.png', import.meta.url).href,
  Tencent: new URL('@/assets/Tencent_Cloud_logo.png', import.meta.url).href,
  ucloud: new URL('@/assets/ucloud.png', import.meta.url).href
}
interface RuleForm {
  supplier_name: string
  api_token: string
  supplier_account: string
  remark: string
  api_key: string
  api_secret: string
  region: string
}
const rules = reactive<FormRules<RuleForm>>({
  supplier_name: [
    {required: true, message: 'Please input Activity supplier name', trigger: 'blur'},
  ],
  region: [
    {required: true, message: 'Please select Activity region', trigger: 'blur'},
  ],
  supplier_account: [
    {required: true, message: 'Please input Activity account name', trigger: 'blur'},
  ],
  api_key: [
    {required: true, message: 'Please input Activity API KEY', trigger: 'blur'},
  ],
  api_secret: [
    {required: true, message: 'Please input Activity API SECRET', trigger: 'blur'},
  ],
})
const supplier_list = [
  {label: '华为云', value: "HuaWei", show: true},
  {label: 'AWS', value: "AWS", show: true},
]
const ruleFormRef = ref<FormInstance>()
const addData = reactive<RuleForm>({
  supplier_name: "",
  api_token: "",
  supplier_account: "",
  remark: "",
  api_key: "",
  api_secret: "",
  region: ""
})
const editData = ref({})

fetchData()


//方法
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
  getSupplierData(params).then(resp => {
    if (resp.code === 200) {
      tableData.value = resp.data
      params.total = resp.total
    } else {
      ElMessage({type: 'error', message: resp.msg})
    }
  }).catch(error => {
      console.error("Error fetching supplier data:", error);
    });
}

async function addCommit(formEl) {
  formEl.validate(async (valid, fields) => {
    if (valid){
      await addSupplierAccount(addData ).then(resp => {
        if (resp.code === 200) {
          ElMessage({type: 'success', message: resp.msg || 'Success'})
        } else {
          ElMessage({type: 'warning', message: resp.msg})
        }
      }).catch(error => {
          ElMessage({type: 'error', message: "请求响应失败，请联系管理员"})
        });
      await fetchData()
      dialogAddVisible.value = false

    }
  })
}

async function healthCheckClick(row){
  var id = row.id
  // row.status = "检测中..."
  AccountHealthCheck({id: id}).then(resp => {
    if (resp.code === 200) {
      ElMessage({type: 'success', message: resp.msg || 'Success'})
    } else {
      ElMessage({type: 'warning', message: resp.msg})
      // row.status = "异常"
    }
  }).catch(error => {
    console.log(error)
    ElMessage({type: 'error', message: "请求响应失败，请联系管理员"})
  });
  await fetchData()
}
function editItemClick(row){
  // console.log(row)
  dialogEditVisible.value = true
  editData.value = {...row}
}

async function editItemCommit(){
  editSupplierAccount(editData.value).then(resp => {
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

async function deleteAccountClick(row){
  ElMessageBox.confirm(
    '是否确认删除供应商为 '+ row.supplier_name+ " 的 " + row.supplier_account + ' 账号?',
    'Warning',
    {
      confirmButtonText: transformI18n($t('buttons.pureConfirm')),
      cancelButtonText: transformI18n($t('buttons.pureCancel')),
      type: 'warning',
    }
  ).then(async () => {
    var resp = await deleteSupplierAccount({"id": row.id})

    if (resp.code === 200) {
      ElMessage({type: 'success', message: resp.msg || '删除成功'})
      fetchData()
    } else {
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

.supplierTable {

  margin-top: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}
/*
.supplierTable ::v-deep .el-table .cell {
  white-space: pre-line;
}


.input-with-select .el-input-group__prepend {
  background-color: #fff;
}
*/

</style>
