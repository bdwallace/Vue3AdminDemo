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
        <el-button type="primary" size="small" style="margin-left: 20px" class="iconfont icon-jichengzhongxin1" @click="dialogAddPlatformVisable = true">
          集成接入
        </el-button>
      </div>

      <div class="eh-table-wrap settingTable">
        <el-table
          ref="multipleTable"
          :data="tableData"
          tooltip-effect="dark"
          stripe
          border
          :header-cell-style="{ background: '#eef1f6', color: '#606266' }"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="40"></el-table-column>
          <el-table-column prop="name" label="名称标识" fit align="center"></el-table-column>
          <el-table-column prop="env" label="环境" fit align="center"></el-table-column>
          <el-table-column prop="platform" label="监控平台" fit align="center">
            <template #default="scope">
              <img
                v-if="scope.row.platform === 'skywalking'"
                :src="skywalkingUrl"
                alt="skywalking"
                style="height: 45px; width: 70px"
              />
              <span v-else>{{ scope.row.platform }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="webhook" label="Webhook" fit align="center">
            <template #default="scope">
              <el-button type="primary" link v-if="scope.row.webhook" @click="copyText(scope.row.webhook)">复制</el-button>
              <el-tooltip class="item" effect="dark" :content="scope.row.webhook" placement="top">
                <span v-if="scope.row.webhook">{{ scope.row.webhook.substr(0, 25) + '...' }}</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column prop="namespace" label="NameSpace" fit align="center"></el-table-column>
          <el-table-column prop="l_release" label="Release" fit align="center"></el-table-column>
          <el-table-column prop="create_time" label="创建时间" fit align="center"></el-table-column>
          <el-table-column prop="update_time" label="更新时间" fit align="center"></el-table-column>
          <el-table-column prop="remark" label="备注" fit align="center"></el-table-column>
          <el-table-column prop="status" label="状态" fit align="center">
            <template #default="scope">
              <el-tag v-if="scope.row.status === '未知'" type="warning">{{ scope.row.status }}</el-tag>
              <el-tag v-else-if="scope.row.status === '检测中...'" type="primary">{{ scope.row.status }}</el-tag>
              <el-tag v-else-if="scope.row.status === '同步中...'" type="primary">{{ scope.row.status }}</el-tag>
              <el-tag v-else-if="scope.row.status === '正常'" type="success">{{ scope.row.status }}</el-tag>
              <el-tag v-else-if="scope.row.status === '同步完成'" type="success">{{ scope.row.status }}</el-tag>
              <el-tag v-else-if="scope.row.status === '异常'" type="danger">{{ scope.row.status }}</el-tag>
              <el-tag v-else type="warning">未知</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="300" align="center" fixed="right">
            <template #default="scope">
              <el-tooltip class="item" effect="dark" content="检查是否可以将告警规则部署到K8s集群中" placement="top">
                <el-button type="primary" link class="fa-solid fa-heart-circle-check" @click="healthCheckClick(scope.row)">检测</el-button>
              </el-tooltip>
              <el-button type="primary" link size="small" @click="editClick(scope.row)">编辑</el-button>
              <el-button type="primary" link size="small" style="color: #ef3535" @click="deleteClick(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <el-dialog title="新增监控平台" v-model="dialogAddPlatformVisable" width="40%">
        <el-form :model="addPlatformData">
          <el-form-item label="名称标识" :label-width="formLabelWidth" required>
            <el-input v-model="addPlatformData.name" style="width: 80%" placeholder="名称标识, 建议以域名为名称标识"></el-input>
          </el-form-item>

          <el-form-item label="监控平台" :label-width="formLabelWidth" required>
            <el-select v-model="addPlatformData.platform" placeholder="请选择监控平台" style="width: 80%">
              <el-option label="zabbix" value="zabbix" disabled>zabbix</el-option>
              <el-option label="skywalking" value="skywalking" disabled>skywalking</el-option>
              <el-option label="prometheus" value="prometheus">prometheus</el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="环境" :label-width="formLabelWidth" required>
            <el-select v-model="addPlatformData.env" placeholder="请选择环境" style="width: 80%">
              <el-option label="GLI" value="gli">GLI</el-option>
              <el-option label="FAT" value="fat">FAT</el-option>
              <el-option label="UAT" value="uat">UAT</el-option>
              <el-option label="PROD" value="prod">PROD</el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="命名空间" :label-width="formLabelWidth">
            <el-input v-model="addPlatformData.namespace" placeholder="请输入prometheus所在集群的命名空间" style="width: 80%"></el-input>
          </el-form-item>
          <el-form-item label="Release" :label-width="formLabelWidth">
            <el-input v-model="addPlatformData.l_release" placeholder="请输入prometheus所在集群的labels.release" style="width: 80%"></el-input>
          </el-form-item>

          <el-form-item label="秘钥文件" :label-width="formLabelWidth">
            <el-input
              v-model="addPlatformData.secret_file"
              style="width: 80%"
              type="textarea"
              :rows="5"
              placeholder="当prometheus部署在k8s集群中时，需要k8s集群输出的.kube/config文件。
k8s配置导出命令：kubectl config view --raw > ~/.kube/config
如果需要本系统自动部署告警规则至prometheus,请输入文件内容"
            ></el-input>
          </el-form-item>

          <el-form-item label="备注" :label-width="formLabelWidth">
            <el-input v-model="addPlatformData.remark" style="width: 80%" placeholder="请输入备注"></el-input>
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer" style="text-align: center">
            <el-button @click="dialogAddPlatformVisable = false">取 消</el-button>
            <el-button type="primary" @click="addItemCommit">确 定</el-button>
          </div>
        </template>
      </el-dialog>

      <el-dialog title="编辑" v-model="dialogEditVisable" width="50%">
        <el-form :model="editData">
          <el-form-item label="名称标识" :label-width="formLabelWidth" required>
            <el-input v-model="editData.name" style="width: 80%" placeholder="名称标识, 建议以域名为名称标识" disabled></el-input>
          </el-form-item>

          <el-form-item label="监控平台" :label-width="formLabelWidth" required>
            <el-select v-model="editData.platform" placeholder="请选择监控平台" style="width: 80%">
              <el-option label="zabbix" value="zabbix" disabled>zabbix</el-option>
              <el-option label="skywalking" value="skywalking" disabled>skywalking</el-option>
              <el-option label="prometheus" value="prometheus">prometheus</el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="命名空间" :label-width="formLabelWidth">
            <el-input v-model="editData.namespace" placeholder="请输入prometheus所在集群的命名空间" style="width: 80%"></el-input>
          </el-form-item>
          <el-form-item label="Release" :label-width="formLabelWidth">
            <el-input v-model="editData.l_release" placeholder="请输入prometheus所在集群的labels.release" style="width: 80%"></el-input>
          </el-form-item>

          <el-form-item label="秘钥文件" :label-width="formLabelWidth">
            <el-input
              v-model="editData.secret_file"
              style="width: 80%"
              type="textarea"
              :rows="5"
              placeholder="当prometheus部署在k8s集群中时，需要k8s集群输出的.kube/config文件。
k8s配置导出命令：kubectl config view --raw > ~/.kube/config
如果需要本系统自动部署告警规则至prometheus,请输入文件内容"
            ></el-input>
          </el-form-item>

          <el-form-item label="备注" :label-width="formLabelWidth">
            <el-input v-model="editData.remark" style="width: 80%" placeholder="请输入备注"></el-input>
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer" style="text-align: center">
            <el-button @click="dialogEditVisable = false">取 消</el-button>
            <el-button type="primary" @click="editItemCommit">确 定</el-button>
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
import skywalkingUrl from '@/assets/skywalking.svg?url'
import { copyText, currentChange, handleSelectionChange, handleSizeChange } from '@/utils/common'
import { addAlertPlatform, delAlertPlatform, getAlertPlatform, healthcheck, updateAlertPlatform } from '@/api'

export default {
  name: 'integrate_center',
  data() {
    return {
      skywalkingUrl,
      dialogAddPlatformVisable: false,
      dialogEditVisable: false,
      formLabelWidth: '150px',
      addPlatformData: {
        name: '',
        platform: '',
        remark: '',
        namespace: 'monitoring',
        l_release: 'kube-prometheus-stack'
      },
      editData: {},
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
    copyText,
    async fetchData() {
      var resp = await getAlertPlatform(this.params).catch(() => {
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
        this.params.total = resp.total
      }
    },
    async addItemCommit() {
      var resp = await addAlertPlatform(this.addPlatformData).catch(() => {
        this.$message({ type: 'error', message: '请求响应失败, 请联系管理员' })
        return 0
      })
      if (!resp) {
        return
      }
      if (resp.code !== 200) {
        this.$message({ type: 'warning', message: resp.msg })
      } else {
        this.$message({ type: 'success', message: resp.msg })
        await this.fetchData()
      }
      this.dialogAddPlatformVisable = false
    },
    async editItemCommit() {
      var resp = await updateAlertPlatform(this.editData).catch(() => {
        this.$message({ type: 'error', message: '请求响应失败, 请联系管理员' })
        return 0
      })
      if (!resp) {
        return
      }
      if (resp.code !== 200) {
        this.$message({ type: 'warning', message: resp.msg })
      } else {
        this.$message({ type: 'success', message: resp.msg })
        await this.fetchData()
      }
      this.dialogEditVisable = false
    },
    async healthCheckClick(row) {
      var resp = await healthcheck({ id: row.id }).catch(() => {
        this.$message({ type: 'error', message: '请求响应失败, 请联系管理员' })
        return 0
      })

      if (!resp) {
        return
      }
      if (resp.code === 200) {
        this.$message({ type: 'success', message: resp.msg })
        await this.fetchData()
      } else {
        this.$message({ type: 'error', message: '检测失败，' + resp.msg })
      }
    },
    editClick(row) {
      this.dialogEditVisable = true
      this.editData = row
    },
    async deleteClick(row) {
      this.$confirm('请确认是否删除？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          var resp = await delAlertPlatform({ id: row.id, name: row.name }).catch(() => {
            this.$message({ type: 'error', message: '请求响应失败, 请联系管理员' })
            return 0
          })

          if (!resp) {
            return
          }
          if (resp.code === 200) {
            this.$message({ type: 'success', message: resp.msg })
            await this.fetchData()
          } else {
            this.$message({ type: 'error', message: resp.msg })
          }
        })
        .catch(() => {
          this.$message({ type: 'info', message: '已取消' })
        })
    }
  }
}
</script>
