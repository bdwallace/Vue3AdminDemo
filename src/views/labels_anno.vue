<template>
  <el-container class="eh-page">
    <div class="main">
      <div class="toolbar">
        <el-input
          placeholder="请输入搜索内容, 支持所有内容模糊搜索, 回车或点击按钮搜索"
          v-model="params.search"
          class="input-with-select"
          @change="fetchData"
        >
          <template #append>
            <el-button type="primary" @click="fetchData">搜索</el-button>
          </template>
        </el-input>
        <el-tooltip class="item" effect="dark" content="新增标签或注解" placement="top">
          <el-button type="success" size="small" style="margin-left: 20px" @click="dialogAddVisable = true">新增</el-button>
        </el-tooltip>
      </div>

      <div class="eh-table-wrap labelsTable">
        <el-table
          ref="multipleTable"
          :data="tableData"
          tooltip-effect="dark"
          stripe
          border
          :header-cell-style="{ background: '#eef1f6', color: '#606266' }"
          @selection-change="handleSelectionChange"
        >
          <el-table-column prop="name" label="字段名称" fit align="center">
            <template #default="{ row }">
              <b style="color: #00a1c9">{{ row.name }}</b>
            </template>
          </el-table-column>
          <el-table-column prop="type" label="字段类型" fit align="center">
            <template #default="{ row }">
              <el-tag size="small" v-if="row.type === 'labels'">标签</el-tag>
              <el-tag size="small" v-else-if="row.type === 'annotations'">注解</el-tag>
              <el-tag size="small" v-else>{{ row.type }}</el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="show" label="是否显示" fit align="center">
            <template #default="{ row }">
              <el-switch
                v-model="row.show"
                active-color="#13ce66"
                inactive-color="#ff4949"
                @change="updateShowClick(row)"
              />
            </template>
          </el-table-column>
          <el-table-column prop="update_time" label="更新时间" fit align="center"></el-table-column>
        </el-table>
      </div>

      <el-dialog title="新增" v-model="dialogAddVisable" width="50%">
        <el-form :model="addData">
          <el-form-item label="字段名称" :label-width="formLabelWidth" required>
            <el-input v-model="addData.name" style="width: 90%" placeholder="请输入字段名称"></el-input>
          </el-form-item>
          <el-form-item label="字段类型" :label-width="formLabelWidth" required>
            <el-select v-model="addData.type" filterable placeholder="请选择字段类型" style="width: 90%">
              <el-option label="标签" value="labels"></el-option>
              <el-option label="注解" value="annotations"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer" style="text-align: center">
            <el-button @click="dialogAddVisable = false">取 消</el-button>
            <el-button type="primary" @click="addCommit">确 定</el-button>
          </div>
        </template>
      </el-dialog>

      <div class="eh-pagination">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :page-size="params.pagesize"
          :page-sizes="[15, 30, 50, 100]"
          :total="params.total"
          @current-change="currentChange"
          @size-change="handleSizeChange"
        />
      </div>
    </div>
  </el-container>
</template>

<script>
import { addLabelsAnno, getLabelsAnno, updateLabelsAnnoSetting } from '@/api'
import { currentChange, handleSelectionChange, handleSizeChange } from '@/utils/common'

export default {
  name: 'tables_manage',
  data() {
    return {
      dialogAddVisable: false,
      formLabelWidth: '100px',
      addData: {},
      params: { page: 1, pagesize: 15, total: 0, search: '' },
      multipleSelection: [],
      tableData: []
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    currentChange,
    handleSizeChange,
    handleSelectionChange,
    async fetchData() {
      var resp = await getLabelsAnno(this.params).catch(() => {
        this.$message({ type: 'error', message: '请求响应失败, 请联系管理员' })
        return 0
      })
      if (resp === 0) {
        return
      } else if (resp.code !== 200) {
        this.$message({ type: 'error', message: resp.msg })
      } else {
        this.tableData = resp.data
        this.params.total = resp.total
      }
    },
    async updateShowClick(row) {
      var resp = await updateLabelsAnnoSetting({ id: row.id, show: row.show }).catch(() => {
        this.$message({ type: 'error', message: '请求响应失败, 请联系管理员' })
        return 0
      })
      if (resp === 0) {
        return
      } else if (resp.code !== 200) {
        this.$message({ type: 'error', message: resp.msg })
      } else {
        this.$message({ type: 'success', message: resp.msg })
      }
    },
    async addCommit() {
      var resp = await addLabelsAnno(this.addData).catch(() => {
        this.$message({ type: 'error', message: '请求响应失败, 请联系管理员' })
        return 0
      })
      if (resp === 0) {
        return
      } else if (resp.code !== 200) {
        this.$message({ type: 'error', message: resp.msg })
      } else {
        this.$message({ type: 'success', message: resp.msg })
      }
      this.fetchData()
      this.dialogAddVisable = false
    }
  }
}
</script>
