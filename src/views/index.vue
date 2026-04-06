<template>
  <div class="eh-dashboard">
    <el-row :gutter="16" class="eh-dashboard__charts">
      <el-col :xs="24" :md="12">
        <el-card shadow="never" class="eh-panel eh-panel--chart">
          <div id="apply_status_distribute" class="eh-chart" />
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card shadow="never" class="eh-panel eh-panel--chart">
          <div id="cert_status_type_distribute" class="eh-chart" />
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" class="eh-panel eh-panel--section">
      <div class="filter-row">
        <el-date-picker
          v-model="time_range_list"
          type="datetimerange"
          :shortcuts="dateShortcuts"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          align="right"
        />
      </div>

      <div class="eh-table-wrap indexTable">
        <el-table
          ref="multipleTable"
          :data="tableData1"
          tooltip-effect="dark"
          stripe
          border
          :header-cell-style="{ background: '#eef1f6', color: '#606266' }"
        >
          <el-table-column prop="zone" label="业务域" fit align="center" sortable></el-table-column>
          <el-table-column prop="count" label="告警次数" fit align="center" sortable></el-table-column>
          <el-table-column prop="resolved" label="已处理" fit align="center" sortable></el-table-column>
          <el-table-column prop="dealing" label="处理中" fit align="center" sortable></el-table-column>
          <el-table-column prop="firing" label="待处理" fit align="center" sortable></el-table-column>
          <el-table-column prop="rate" label="告警处理率" fit align="center" sortable>
            <template #default="{ row }">
              {{ compute_rate(row.resolved, row.count) }}%
            </template>
          </el-table-column>
          <el-table-column prop="avg_deal" label="平均处理时间" fit align="center" sortable>
            <template #default="{ row }">
              {{ row.avg_deal }} min
            </template>
          </el-table-column>
          <el-table-column prop="avg_claim" label="平均认领时长" fit align="center" sortable>
            <template #default="{ row }">
              {{ row.avg_claim }} min
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="filter-row" style="margin-top: 16px">
        <el-checkbox-group v-model="zone_select">
          <el-checkbox v-for="item in zone_list" :key="item" :label="item" @change="fetchData"></el-checkbox>
        </el-checkbox-group>
      </div>

      <div class="eh-table-wrap indexTable">
        <el-table
          ref="multipleTable2"
          :data="tableData2"
          tooltip-effect="dark"
          stripe
          border
          :header-cell-style="{ background: '#eef1f6', color: '#606266' }"
        >
          <el-table-column prop="zone" label="业务域" fit align="center" sortable></el-table-column>
          <el-table-column prop="name" label="告警名称" fit align="center" sortable></el-table-column>
          <el-table-column prop="fgp" label="告警ID" fit align="center" sortable></el-table-column>
          <el-table-column prop="count" label="告警次数" fit align="center" sortable></el-table-column>
          <el-table-column prop="resolved" label="已处理" fit align="center" sortable></el-table-column>
          <el-table-column prop="dealing" label="处理中" fit align="center" sortable></el-table-column>
          <el-table-column prop="firing" label="待处理" fit align="center" sortable></el-table-column>
          <el-table-column prop="rate" label="告警处理率" fit align="center" sortable>
            <template #default="{ row }">
              {{ compute_rate(row.resolved, row.count) }}%
            </template>
          </el-table-column>
          <el-table-column prop="avg_deal" label="平均处理时间" fit align="center" sortable>
            <template #default="{ row }">
              {{ row.avg_deal }} min
            </template>
          </el-table-column>

          <el-table-column prop="avg_claim" label="平均认领时长" fit align="center" sortable>
            <template #default="{ row }">
              {{ row.avg_claim }} min
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="eh-pagination">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :page-size="params.pagesize"
          :page-sizes="[15, 30, 50, 100]"
          :total="params.total"
          @current-change="currentChange"
          @size-change="handleSizeChange"
        >
        </el-pagination>
      </div>
    </el-card>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { getIndexData } from '@/api'
import { currentChange, handleSizeChange, formatDateToLocalString } from '@/utils/common'

export default {
  name: 'index',
  data() {
    return {
      time_range_list: [],
      days: 1,
      start_time: '',
      end_time: '',
      zone_select: [],
      zone_list: [],
      params: { page: 1, pagesize: 15, total: 0 },
      pie: [],
      rose: [],
      tableData1: [],
      tableData2: [],
      dateShortcuts: [
        {
          text: '最近一周',
          value: () => {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            return [start, end]
          }
        },
        {
          text: '最近一个月',
          value: () => {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            return [start, end]
          }
        },
        {
          text: '最近三个月',
          value: () => {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            return [start, end]
          }
        }
      ]
    }
  },

  created() {
    this.fetchData()
  },
  watch: {
    time_range_list: {
      handler(newVal) {
        if (!newVal || !Array.isArray(newVal) || newVal.length < 2) {
          return
        }
        console.log(newVal)
        const start = new Date(newVal[0])
        const end = new Date(newVal[1])
        const diffTime = (end - start) / (1000 * 60 * 60 * 24)
        this.days = diffTime.toFixed(2)
        this.params['start_time'] = this.formatDateToLocalString(start)
        this.params['end_time'] = this.formatDateToLocalString(end)
        console.log(this.params)
        this.fetchData()
        this.department_people_distribute_pie()
        this.menu_groups_distribute_pie()
      }
    }
  },
  mounted() {
    setTimeout(() => {
      this.department_people_distribute_pie()
      this.menu_groups_distribute_pie()
    }, 400)
  },
  methods: {
    currentChange,
    handleSizeChange,
    formatDateToLocalString,
    compute_rate(resolved, count) {
      if (!count) return '0.00'
      return ((resolved / count) * 100).toFixed(2)
    },
    async fetchData() {
      this.params['days'] = this.days
      if (this.zone_select.length !== 0) {
        this.params.zone__in = JSON.stringify(this.zone_select)
      } else {
        delete this.params.zone__in
      }
      var response = await getIndexData(this.params).catch(() => {
        this.$message({ type: 'error', message: '请求响应错误， 请联系管理员' })
        return 0
      })
      if (!response) {
        return
      }
      if (response.code !== 200) {
        this.$message({ type: 'warning', message: response.msg })
      } else {
        this.pie = response.data.pie
        this.rose = response.data.rose
        this.zone_list = response.data.zone_list
        this.tableData1 = response.data.table1
        this.tableData2 = response.data.table2
        this.params.total = response.table2_total
      }
    },
    department_people_distribute_pie() {
      var el = document.getElementById('apply_status_distribute')
      if (!el) return
      var mychart = echarts.init(el)
      var option = {
        backgroundColor: '#2c343c',
        title: {
          text: '业务域与告警次数分布',
          textStyle: { color: '#ccc' },
          top: 20,
          left: 'center'
        },
        tooltip: { trigger: 'item' },
        legend: { left: 'left', orient: 'vertical', top: 20, textStyle: { color: '#ccc' } },
        toolbox: {
          show: true,
          feature: {
            mark: { show: true },
            dataView: { show: true, readOnly: false },
            restore: { show: true },
            saveAsImage: { show: true }
          }
        },
        series: [
          {
            name: '业务域与告警次数分布',
            type: 'pie',
            radius: '50%',
            label: {
              show: true,
              formatter: '{b}: {c}'
            },
            data: this.pie
          }
        ]
      }
      mychart.setOption(option)
    },
    menu_groups_distribute_pie() {
      var el = document.getElementById('cert_status_type_distribute')
      if (!el) return
      var mychart = echarts.init(el)
      var option = {
        backgroundColor: '#2c343c',
        title: {
          text: '处理人员与告警处理数量分布',
          left: 'center',
          top: 20,
          textStyle: { color: '#ccc' }
        },
        tooltip: { trigger: 'item' },
        legend: { left: 'left', orient: 'vertical', top: 20, textStyle: { color: '#ccc' } },
        toolbox: {
          show: true,
          feature: {
            mark: { show: true },
            dataView: { show: true, readOnly: false },
            restore: { show: true },
            saveAsImage: { show: true }
          }
        },
        series: [
          {
            name: '处理人员与告警处理数量分布',
            type: 'pie',
            radius: '55%',
            center: ['50%', '50%'],
            data: this.rose.sort(function (a, b) {
              return a.value - b.value
            }),
            roseType: 'radius',
            label: {
              show: true,
              formatter: '{b}: {c}',
              color: 'rgba(255, 255, 255, 0.3)',
              textStyle: { color: '#ccc' }
            },
            labelLine: {
              lineStyle: {
                color: 'rgba(255, 255, 255, 0.3)'
              },
              smooth: 0.2,
              length: 10,
              length2: 20
            },
            itemStyle: {
              color: '#c23531',
              shadowBlur: 200
            },
            animationType: 'scale',
            animationEasing: 'elasticOut',
            animationDelay: function (idx) {
              return Math.random() * 200
            }
          }
        ]
      }
      mychart.setOption(option)
    }
  }
}
</script>
