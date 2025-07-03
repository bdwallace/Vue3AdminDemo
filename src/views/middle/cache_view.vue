<template>
  <el-container>
    <div class="main">
      <div>
        <el-input placeholder="请输入搜索内容, 支持所有内容模糊搜索, 回车或点击按钮搜索" v-model="params.search"
                  @change="fetchData" style="width: 70%" class="input-with-select">
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
        <el-tooltip class="item" effect="dark" content="更新域名最新的数据" placement="top">
          <el-button type="primary" :icon="Plus" style="margin-left: 20px" @click="buttonClick">
            按钮
          </el-button>
        </el-tooltip>
      </div>


      <div class="demoTable">
        <el-table ref="multipleTable" :data="tableData" tooltip-effect="dark"
                  border :header-cell-style="{background:'#eef1f6',color:'#606266'}"
                  @selection-change="handleSelectionChange">

        </el-table>
      </div>

      <el-dialog v-model="dialogVisible" title="Tips" width="500" draggable>
        <span>It's a draggable Dialog</span>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="dialogVisible = false">Cancel</el-button>
            <el-button type="primary" @click="dialogVisible = false">
              Confirm
            </el-button>
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

import {ref, reactive, h} from "vue";
import {
  Plus,
  Search,
} from '@element-plus/icons-vue'

defineOptions({
  name: "Statistics"
});

const dialogVisible = ref(false)
let formLabelWidth = "100px"
const params = reactive({page: 1, pagesize: 20, total: 0, search: ""})
const multipleSelection = ref([])
const tableData = ref([])
const input1 = ref('')
const input2 = ref('')
const input3 = ref('')
const select = ref('')

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
  console.log('exec fetchDAta')
}
function buttonClick() {
  dialogVisible.value = true
}
</script>

<style scoped>
.main {
  margin-top: 1px;
  width: 100%;
  height: 90%;
}

.demoTable {
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
