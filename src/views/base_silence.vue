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
        <el-tooltip class="item" effect="dark" content="创建新的静默" placement="top">
          <el-button type="primary" size="default" style="margin-left: 20px" @click="dialogAddVisible = true">新增静默</el-button>
        </el-tooltip>
      </div>

      <div class="eh-table-wrap silenceTable">
        <el-table
          ref="multipleTable"
          :data="tableData"
          tooltip-effect="dark"
          border
          :header-cell-style="{ background: '#eef1f6', color: '#606266' }"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="40"></el-table-column>
          <el-table-column prop="id" label="ID" sortable width="60px" align="center"></el-table-column>
          <el-table-column prop="search_regex" label="匹配内容" sortable align="center"></el-table-column>
          <el-table-column prop="start_time" label="静默开始时间" sortable align="center"></el-table-column>
          <el-table-column prop="end_time" label="静默结束时间" sortable align="center"></el-table-column>
          <el-table-column prop="status" label="状态" sortable align="center">
            <template #default="{ row }">
              <el-switch
                v-model="row.status"
                active-color="#13ce66"
                inactive-color="#ff4949"
                @change="updateStatusClick(row)"
              />
            </template>
          </el-table-column>
          <el-table-column prop="include_rule" label="规则ID" sortable align="center">
            <template #default="{ row }">
              <el-tag
                v-for="rule_id in row.include_rule"
                :key="String(rule_id)"
                size="small"
                type="success"
                effect="dark"
                style="width: 60%; margin-left: 3px; margin-top: 3px"
                >{{ rule_id }}</el-tag
              >
            </template>
          </el-table-column>
          <el-table-column prop="update_time" label="更新时间" sortable align="center"></el-table-column>
          <el-table-column prop="creator" label="创建人" sortable align="center"></el-table-column>
          <el-table-column prop="remark" label="备注" align="center"></el-table-column>
          <el-table-column label="操作" align="center">
            <template #default="{ row }">
              <el-button type="primary" link size="default" @click="editClick(row)">编辑</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <el-dialog title="新增静默项" v-model="dialogAddVisible" width="35%">
        <el-form :model="addData">
          <el-form-item label="模糊匹配内容" :label-width="formLabelWidth" required>
            <el-input v-model="addData.search_regex" placeholder="请输入匹配内容" style="width: 90%"></el-input>
            <span style="color: red; font-size: 12px; display: block"
              >您输入的匹配内容, 在告警规则管理页面能搜索出来的告警规则都会生效, 请先确认搜索出来的规则再提交</span
            >
          </el-form-item>
          <el-form-item label="日期时间" :label-width="formLabelWidth">
            <el-date-picker
              style="width: 90%"
              v-model="add_time_range_list"
              type="datetimerange"
              :shortcuts="rangeShortcuts"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            />
          </el-form-item>
          <el-form-item label="备注" :label-width="formLabelWidth">
            <el-input type="textarea" :rows="3" v-model="addData.remark" placeholder="请输入备注" style="width: 90%"></el-input>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="dialogAddVisible = false">取 消</el-button>
          <el-button type="primary" @click="addSilenceCommit">确 定</el-button>
        </template>
      </el-dialog>

      <el-dialog title="编辑静默项" v-model="dialogEditVisible" width="35%">
        <el-form :model="editData">
          <el-form-item label="模糊匹配内容" :label-width="formLabelWidth" required>
            <el-input v-model="editData.search_regex" placeholder="请输入匹配内容" style="width: 90%" disabled></el-input>
            <span style="color: red; font-size: 12px; display: block"
              >您输入的匹配内容, 在告警规则管理页面能搜索出来的告警规则都会生效, 请先确认搜索出来的规则再提交</span
            >
          </el-form-item>
          <el-form-item label="日期时间" :label-width="formLabelWidth">
            <el-date-picker
              style="width: 90%"
              v-model="edit_time_range_list"
              type="datetimerange"
              :shortcuts="rangeShortcuts"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            />
          </el-form-item>
          <el-form-item label="备注" :label-width="formLabelWidth">
            <el-input type="textarea" :rows="3" v-model="editData.remark" placeholder="请输入备注" style="width: 90%"></el-input>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="dialogEditVisible = false">取 消</el-button>
          <el-button type="primary" @click="updateSilenceCommit">确 定</el-button>
        </template>
      </el-dialog>

      <div class="eh-pagination">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :page-size="params.pagesize"
          :page-sizes="[20, 30, 50, 100]"
          :total="params.total"
          @current-change="currentChange"
          @size-change="handleSizeChange"
        />
      </div>
    </div>
  </el-container>
</template>

<script>
import { addAlertSilence, editSilenceItem, getAlertSilence, updateSilenceStatus } from '@/api/silence_api'
import { currentChange, formatDateToLocalString, handleSelectionChange, handleSizeChange } from '@/utils/common'

export default {
  name: 'alert_silence',
  data() {
    return {
      rangeShortcuts: [
        {
          text: '一天',
          value: () => {
            const end = new Date()
            const start = new Date()
            end.setTime(start.getTime() + 3600 * 1000 * 24)
            return [start, end]
          }
        },
        {
          text: '三天',
          value: () => {
            const end = new Date()
            const start = new Date()
            end.setTime(start.getTime() + 3600 * 1000 * 24 * 3)
            return [start, end]
          }
        },
        {
          text: '一周',
          value: () => {
            const end = new Date()
            const start = new Date()
            end.setTime(start.getTime() + 3600 * 1000 * 24 * 7)
            return [start, end]
          }
        }
      ],
      dialogAddVisible: false,
      dialogEditVisible: false,
      formLabelWidth: '120px',
      params: { page: 1, pagesize: 20, total: 0, search: '' },
      multipleSelection: [],
      tableData: [],
      addData: {
        search_regex: '',
        remark: ''
      },
      editData: {},
      add_time_range_list: [],
      edit_time_range_list: []
    }
  },

  created() {
    this.fetchData()
  },
  watch: {
    add_time_range_list: {
      handler(newVal) {
        if (!newVal || !newVal[0] || !newVal[1]) return
        const start = new Date(newVal[0])
        const end = new Date(newVal[1])
        this.addData['start_time'] = this.formatDateToLocalString(start)
        this.addData['end_time'] = this.formatDateToLocalString(end)
      }
    },
    edit_time_range_list: {
      handler(newVal) {
        if (!newVal || !newVal[0] || !newVal[1]) return
        const start = new Date(newVal[0])
        const end = new Date(newVal[1])
        this.editData['start_time'] = this.formatDateToLocalString(start)
        this.editData['end_time'] = this.formatDateToLocalString(end)
      }
    }
  },
  methods: {
    currentChange,
    handleSizeChange,
    handleSelectionChange,
    formatDateToLocalString,
    async fetchData() {
      var resp = await getAlertSilence(this.params).catch(() => {
        this.$message({ type: 'error', message: '请求响应失败, 请联系管理员' })
        return 0
      })
      if (!resp) {
        return
      }
      if (resp.code !== 200) {
        this.$message({ type: 'warning', message: resp.msg })
      } else {
        this.tableData = resp.data
        this.params.total = resp.total
      }
    },
    async addSilenceCommit() {
      var resp = await addAlertSilence(this.addData).catch(() => {
        this.$message({ type: 'error', message: '请求响应失败, 请联系管理员' })
        return 0
      })
      if (!resp) {
        return
      }
      if (resp.code === 200) {
        this.$message({ type: 'success', message: resp.msg })
      } else {
        this.$message({ type: 'error', message: resp.msg })
      }
      await this.fetchData()
      this.dialogAddVisible = false
    },
    async updateStatusClick(row) {
      var resp = await updateSilenceStatus(row).catch(() => {
        this.$message({ type: 'error', message: '请求响应失败, 请联系管理员' })
        return 0
      })
      if (!resp) {
        return
      }
      if (resp.code === 200) {
        this.$message({ type: 'success', message: resp.msg })
      } else {
        this.$message({ type: 'error', message: resp.msg })
      }
    },
    async editClick(row) {
      this.dialogEditVisible = true
      this.editData = { ...row }
    },
    async updateSilenceCommit() {
      var resp = await editSilenceItem({
        id: this.editData.id,
        start_time: this.editData.start_time,
        end_time: this.editData.end_time,
        remark: this.editData.remark
      }).catch(() => {
        this.$message({ type: 'error', message: '请求响应失败, 请联系管理员' })
        return 0
      })
      if (!resp) {
        return
      }
      if (resp.code === 200) {
        this.$message({ type: 'success', message: resp.msg })
      } else {
        this.$message({ type: 'error', message: resp.msg })
      }
      this.dialogEditVisible = false
    }
  }
}
</script>
