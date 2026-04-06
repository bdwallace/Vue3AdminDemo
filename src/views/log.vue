<template>
  <el-container class="eh-page">
    <div class="main">
      <div class="toolbar">
        <el-input
          placeholder="请输入搜索内容, 支持所有内容模糊搜索, 回车或点击按钮搜索"
          v-model="params.search"
          class="input-with-select"
          size="large"
          clearable
          @keyup.enter="fetchData"
          @change="fetchData"
        >
          <template #append>
            <el-button :icon="Search" @click="fetchData" />
          </template>
        </el-input>
      </div>

      <div class="eh-table-wrap logTable">
        <el-table
          ref="multipleTable"
          :data="tableData"
          tooltip-effect="dark"
          stripe
          border
          :header-cell-style="{ background: '#eef1f6', color: '#606266' }"
          v-loading="loading"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="60"></el-table-column>
          <el-table-column prop="user_name" label="请求用户" fit align="center"></el-table-column>
          <el-table-column prop="request_type" label="请求类型" fit align="center"></el-table-column>
          <el-table-column prop="user_ip" label="用户IP" fit align="center"></el-table-column>
          <el-table-column prop="create_time" label="请求时间" fit align="center"></el-table-column>
          <el-table-column prop="request_path" label="路由地址" fit align="center"></el-table-column>
          <el-table-column prop="request_param" label="请求参数" fit align="center">
            <template #default="{ row }">
              <el-popover trigger="click" placement="left">
                <div
                  style="
                    white-space: pre-wrap;
                    word-wrap: break-word;
                    max-height: 600px;
                    max-width: 800px;
                    overflow: auto;
                    padding: 5px;
                    background: rgb(236 240 244);
                  "
                >
                  {{ formatJSON(row.request_param) }}
                </div>
                <template #reference>
                  <el-button type="primary" link>查看详情</el-button>
                </template>
              </el-popover>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="eh-pagination">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :page-size="params.pagesize"
          :page-sizes="[15, 20, 50, 100]"
          :total="params.total"
          @current-change="currentChange"
          @size-change="handleSizeChange"
        />
      </div>
    </div>
  </el-container>
</template>

<script>
import { Search } from '@element-plus/icons-vue'
import { currentChange, handleSelectionChange, handleSizeChange } from '@/utils/common'
import { getAuditLog } from '@/api'

export default {
  name: 'log',
  data() {
    return {
      Search,
      loading: false,
      params: { page: 1, pagesize: 15, total: 0, search: '' },
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
      this.loading = true
      var response = await getAuditLog(this.params).catch(() => {
        this.$message({ type: 'error', message: '请求错误' })
        return 0
      })
      if (!response) {
        return
      }
      this.loading = false
      if (response.code === 200) {
        this.tableData = response.data
        this.params.total = response.total
      } else {
        this.$message({ type: 'warning', message: response.msg })
      }
    },
    formatJSON(str) {
      try {
        return JSON.stringify(JSON.parse(str), null, 4)
      } catch (e) {
        return str
      }
    }
  }
}
</script>