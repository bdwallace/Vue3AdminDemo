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
            <el-button type="primary" :icon="Search" @click="fetchData">搜索</el-button>
          </template>
        </el-input>
        <el-dropdown @command="statusSelectClick" style="margin-left: 20px">
          <el-button type="warning" size="default">
            <i class="iconfont icon-zhuangtai"></i>
            {{ alert_status }}
            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="待处理">待处理</el-dropdown-item>
              <el-dropdown-item command="处理中">处理中</el-dropdown-item>
              <el-dropdown-item command="已处理">已处理</el-dropdown-item>
              <el-dropdown-item command="异常">异常</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-dropdown @command="platformSelectClick" style="margin-left: 20px">
          <el-button type="primary" size="default" style="font-size: 13px">
            <i class="iconfont icon-jiankongpingtai"></i>
            {{ monitor_platform }}
            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="prometheus">prometheus</el-dropdown-item>
              <el-dropdown-item command="zabbix">zabbix</el-dropdown-item>
              <el-dropdown-item command="skywalking">skywalking</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-dropdown @command="refreshSetClick" style="margin-left: 20px">
          <el-button type="info" size="default" :icon="Refresh" style="font-size: 13px">
            {{ refresh_set }}
            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-for="(value, key) in time_map" :key="key" :command="value">{{
                key
              }}</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-tooltip class="item" effect="dark" content="开启或关闭告警提示音,有待处理的告警时发出提示音" placement="top">
          <el-button type="danger" size="default" plain style="margin-left: 20px" @click="openSoundClick">{{
            isSoundEnabled ? '🔇关闭提示音' : '🔊开启提示音'
          }}</el-button>
        </el-tooltip>
      </div>

      <div style="margin-top: 10px">
        <el-checkbox-group v-model="zone_select">
          <el-checkbox v-for="item in zone_list" :key="item" :label="item" @change="fetchData"></el-checkbox>
        </el-checkbox-group>
      </div>
      <div class="eh-table-wrap alertTable">
        <el-table
          ref="multipleTable"
          :data="tableData"
          tooltip-effect="dark"
          stripe
          border
          v-loading="loading"
          :header-cell-style="{ background: '#eef1f6', color: '#606266' }"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" fit></el-table-column>
          <el-table-column prop="zone" label="业务域" width="120" align="center"></el-table-column>
          <el-table-column prop="name" label="告警名称" fit align="center">
            <template #default="{ row }">
              <el-tooltip class="item" effect="dark" placement="top">
                <template #content>
                  <div v-html="(row.annotations?.description || '').replace(/\n/g, '<br>')"></div>
                </template>
                <b style="color: #00a1c9; cursor: pointer" @click="detailClick(row)">{{ row.name }}</b>
              </el-tooltip>
            </template>
          </el-table-column>

          <el-table-column prop="status" label="状态" width="150" align="center" sortable>
            <template #default="{ row }">
              <el-tag v-if="row.status === 'resolved'" size="small" type="success" effect="dark">已处理</el-tag>
              <el-tag v-else-if="row.status === 'firing'" size="small" type="danger" effect="dark">待处理</el-tag>
              <el-tag v-else-if="row.status === 'dealing'" size="small" type="warning" effect="dark">处理中</el-tag>
              <el-tag v-else-if="row.status === 'unusual'" size="small" type="info" effect="dark">异常</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="level" label="等级" fit align="center" sortable>
            <template #default="{ row }">
              <span v-if="!row.level">{{ row.labels.level }}</span>
              <span v-else>{{ row.level }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="start_time" label="告警开始时间" fit align="center" sortable></el-table-column>
          <el-table-column prop="end_time" label="告警结束时间" fit align="center" sortable></el-table-column>
          <el-table-column prop="owner" label="处理人员" fit align="center">
            <template #default="{ row }">
              <el-tag
                v-if="!row.owner && row.status === 'resolved'"
                size="small"
                type="success"
                effect="dark"
                style="width: 80px"
                >自动恢复</el-tag
              >
              <el-tag
                v-else-if="row.owner === 'prometheus'"
                size="small"
                type="success"
                effect="dark"
                style="width: 80px"
                >自动恢复</el-tag
              >
              <el-tag v-else-if="!row.owner" size="small" type="warning" effect="dark" style="width: 80px"
                >待认领</el-tag
              >
              <el-tag v-else size="small" type="success" effect="dark" style="width: 80px">{{
                row.owner.split('@')[0]
              }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="deal_time" label="持续时间" width="150" align="center" sortable>
            <template #default="{ row }">
              <span v-if="row.deal_time">{{ row.deal_time }} min</span>
            </template>
          </el-table-column>

          <el-table-column prop="remark" label="备注" fit align="center"></el-table-column>
          <el-table-column prop="annotations" label="处理方案" fit align="center" v-if="false">
            <template #default="{ row }">
              <el-link v-if="row.annotations?.solution" type="primary" :href="row.annotations.solution" target="_blank"
                >SOP地址</el-link
              >
            </template>
          </el-table-column>
          <el-table-column prop="claim_time" label="认领时间" fit align="center" sortable></el-table-column>
          <el-table-column prop="claim_duration" label="认领时长" width="140px" align="center" sortable>
            <template #default="{ row }">
              <span v-if="row.claim_duration">{{ row.claim_duration }} min</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" fit align="center">
            <template #default="{ row }">
              <el-button
                v-if="(!row.owner && row.status === 'firing') || (row.remark && !row.remark.includes('静默'))"
                type="primary"
                link
                size="small"
                :icon="Pointer"
                @click="dealClick(row)"
                >认领</el-button
              >
              <el-button type="primary" link size="small" :icon="Edit" @click="editClick(row)">编辑</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <el-dialog v-model="dialogEditVisable" title="编辑" width="35%">
        <el-form :model="editData">
          <el-form-item label="告警ID" :label-width="formLabelWidth">
            <el-input v-model="editData.fgp" style="width: 90%" disabled></el-input>
          </el-form-item>
          <el-form-item label="告警名称" :label-width="formLabelWidth" required>
            <el-input v-model="editData.name" style="width: 90%" disabled></el-input>
          </el-form-item>
          <el-form-item label="等级" :label-width="formLabelWidth" required>
            <el-input v-model="editData.level" style="width: 90%"></el-input>
          </el-form-item>
          <el-form-item label="业务域" :label-width="formLabelWidth" required>
            <el-input v-model="editData.zone" style="width: 90%"></el-input>
          </el-form-item>

          <el-form-item label="备注" :label-width="formLabelWidth" required>
            <el-input type="textarea" :rows="3" v-model="editData.remark" placeholder="请输入备注" style="width: 90%"></el-input>
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer" style="text-align: center">
            <el-button @click="dialogEditVisable = false">取 消</el-button>
            <el-button type="primary" @click="editCommit">确 定</el-button>
          </div>
        </template>
      </el-dialog>

      <el-dialog v-model="showMoreDialog" title="详情" width="40%">
        <b style="margin-left: 20px">ID: {{ origion_data.fgp }}</b>
        <br /><br />
        <label style="margin-left: 20px">标签:</label>
        <div style="margin-left: 50px" v-for="(value, key) in origion_data.labels" :key="key">
          <span style="margin-bottom: 5px"> {{ key }}</span> :
          <el-link v-if="value && value.startsWith('http')" :href="value" type="primary" target="_blank">{{
            value
          }}</el-link>
          <el-tag v-else size="small" style="margin-bottom: 5px">{{ value }}</el-tag>
        </div>
        <label style="margin-left: 20px">Annotations:</label>
        <div style="margin-left: 50px" v-for="(value, key) in origion_data.annotations" :key="key">
          <span style="margin-bottom: 5px"> {{ key }}</span> :
          <el-link v-if="value && value.startsWith('http')" :href="value" type="primary" target="_blank">{{
            value
          }}</el-link>
          <el-tag v-else size="small" style="margin-bottom: 5px">{{ value }}</el-tag>
        </div>
      </el-dialog>

      <div class="eh-pagination">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :page-size="params.pagesize"
          :page-sizes="[20, 50, 100, 500]"
          :total="params.total"
          @current-change="currentChange"
          @size-change="handleSizeChange"
        >
        </el-pagination>
      </div>
    </div>
  </el-container>
</template>

<script>
import { Search, ArrowDown, Refresh, Edit, Pointer } from '@element-plus/icons-vue'
import { getAlertSummary, getAudio, setAlertOwner, updateAlertSummary } from '@/api'
import { currentChange, handleSelectionChange, handleSizeChange } from '@/utils/common'
import Cookie from 'js-cookie'

export default {
  /** 与路由 name 一致，便于 keep-alive include */
  name: 'EhmonitorAlertSummary',
  components: {
    Search,
    ArrowDown,
    Refresh,
    Edit,
    Pointer
  },
  data() {
    return {
      timer: null,
      dialogEditVisable: false,
      loading: false,
      formLabelWidth: '100px',
      showMoreDialog: false,
      alert_status: '状态',
      monitor_platform: '监控平台',
      isSoundEnabled: false,
      hasCriticalAlerts: false,
      refresh_set: localStorage.getItem('refresh_set') || '刷新间隔',
      time_map: {
        off: 'off',
        '10s': 10000,
        '30s': 30000,
        '1min': 60000,
        '5min': 300000,
        '15min': 3000000
      },
      zone_select: [],
      zone_list: [],
      params: { page: 1, pagesize: 20, total: 0, search: '' },
      editData: {},
      origion_data: {},
      multipleSelection: [],
      tableData: []
    }
  },
  created() {
    this.fetchAndCacheAudio('p1')
  },
  mounted() {
    this.startAutoRefresh()
  },
  beforeUnmount() {
    this.stopAutoRefresh()
  },
  methods: {
    currentChange,
    handleSizeChange,
    handleSelectionChange,
    async fetchData() {
      if (this.zone_select.length !== 0) {
        this.params.zone__in = JSON.stringify(this.zone_select)
      } else {
        delete this.params.zone__in
      }
      this.loading = true
      var resp = await getAlertSummary(this.params).catch(() => {
        this.$message({ type: 'error', message: '请求响应失败, 请联系管理员' })
        return 0
      })
      if (!resp) {
        return
      }
      if (resp.code !== 200) {
        this.$message({ type: 'warning', message: resp.msg })
        return 0
      } else {
        this.tableData = resp.data
        this.zone_list = resp.zone_list
        this.params.total = resp.total
        this.hasCriticalAlerts = this.tableData.some(
          (item) => item.status === 'firing' && (!item.remark || !item.remark.includes('静默'))
        )
      }
      this.loading = false
    },
    async statusSelectClick(status) {
      console.log(status)
      this.alert_status = status
      if (status === '待处理') {
        this.params.status = 'firing'
      } else if (status === '已处理') {
        this.params.status = 'resolved'
      } else if (status === '处理中') {
        this.params.status = 'dealing'
      } else if (status === '异常') {
        this.params.status = 'unusual'
      }
      await this.fetchData()
    },
    async platformSelectClick(name) {
      console.log(name)
      this.monitor_platform = name
      if (name === 'prometheus') {
        this.params.platform__platform = 'prometheus'
      } else if (name === 'zabbix') {
        this.params.platform__platform = 'zabbix'
      } else if (name === 'skywalking') {
        this.params.platform__platform = 'skywalking'
      }
      await this.fetchData()
    },
    detailClick(row) {
      this.showMoreDialog = true
      this.origion_data = row
    },
    editClick(row) {
      this.editData = row
      this.dialogEditVisable = true
    },
    async editCommit() {
      var resp = await updateAlertSummary(this.editData).catch(() => {
        this.$message({ type: 'error', message: '请求响应失败, 请联系管理员' })
        return 0
      })

      if (!resp) {
        return
      } else if (resp.code !== 200) {
        this.$message({ type: 'warning', message: resp.msg })
        return 0
      } else {
        this.$message({ type: 'success', message: resp.msg })
        this.dialogEditVisable = false
        await this.fetchData()
      }
    },
    async dealClick(row) {
      console.log(Cookie.get('user_name'))
      var resp = await setAlertOwner({
        id: row.id,
        owner: Cookie.get('user_name')
      }).catch(() => {
        this.$message({ type: 'error', message: '请求响应失败, 请联系管理员' })
        return 0
      })

      if (!resp) {
        return
      } else if (resp.code !== 200) {
        this.$message({ type: 'warning', message: resp.msg })
        return 0
      } else {
        await this.fetchData()
      }
    },
    refreshSetClick(value) {
      console.log(value)
      Object.entries(this.time_map).forEach(([key, val]) => {
        if (val === value) {
          this.refresh_set = key
          localStorage.setItem('refresh_set', key)
        }
      })
      if (this.timer) {
        clearInterval(this.timer)
      }
      this.startAutoRefresh()
    },
    tableRowClassName({ row }) {
      if (row.status === 'firing') {
        console.log(row.level, row.status)
        return 'alert-row'
      }
      return ''
    },
    startAutoRefresh() {
      this.fetchData()
      this.refresh_set = localStorage.getItem('refresh_set') || '10s'
      if (this.refresh_set === 'off') return
      const refreshInterval = this.time_map[this.refresh_set]
      if (!refreshInterval) {
        console.warn('无效的刷新间隔：', this.refresh_set)
        return
      }
      console.log('刷新间隔设置为：', refreshInterval)

      this.timer = setInterval(() => {
        this.fetchData()
        this.fetchAndCacheAudio()
      }, refreshInterval)
    },
    stopAutoRefresh() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
    },
    openSoundClick() {
      if (this.isSoundEnabled) {
        this.isSoundEnabled = false
        this.$message({ type: 'success', message: '提示音已关闭' })
      } else {
        this.isSoundEnabled = true
        this.fetchAndCacheAudio('p1')
        this.$message({ type: 'success', message: '提示音已开启' })
      }
    },
    async fetchAndCacheAudio(audio_name = 'p1') {
      try {
        if (!this.isSoundEnabled) return
        if (!this.hasCriticalAlerts) return
        const resp = await getAudio({ audio_name: audio_name }).catch(() => {
          this.$message({ type: 'error', message: '请求响应失败, 请联系管理员' })
          return 0
        })
        const audioURL = URL.createObjectURL(resp)

        const audio = new Audio(audioURL)
        audio.play().catch((error) => console.error('播放失败:', error))
      } catch (error) {
        console.error('音频获取失败:', error)
      }
    }
  }
}
</script>
