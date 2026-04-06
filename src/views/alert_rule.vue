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
        <el-tooltip class="item" effect="dark" content="此操作将会同步新增至prometheus" placement="top">
          <el-button type="primary" :icon="Plus" size="default" style="margin-left: 20px" @click="createClick()">新增规则</el-button>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" content="导入已存在的yaml 告警规则, 此操作将会同步至prometheus" placement="top">
          <el-button type="primary" :icon="Download" size="default" style="margin-left: 20px" @click="dialogVisable = true; fetchAccountData()">导入规则</el-button>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" content="将选中的告警规则导出成yaml文件" placement="top">
          <el-button type="info" :icon="Document" size="default" style="margin-left: 20px" @click="exportClick">导出规则</el-button>
        </el-tooltip>
        <el-button type="danger" :icon="Delete" size="default" style="margin-left: 20px" @click="batchDelRuleClick">批量删除</el-button>
        <el-tooltip class="item" effect="dark" content="批量配置告警发送" placement="top">
          <el-button type="warning" :icon="Setting" size="default" @click="barchSetClick">批量配置</el-button>
        </el-tooltip>
      </div>
      <div style="margin-top: 10px">
        <div style="display: flex; align-items: center; margin-top: 5px" v-if="zone_list && zone_list.length > 0">
          <label style="margin-right: 8px; font-size: 14px">业务域：</label>
          <el-checkbox-group v-model="zone_select">
            <el-checkbox v-for="item in zone_list" :key="item" :label="item" @change="fetchData"></el-checkbox>
          </el-checkbox-group>
        </div>
        <div style="display: flex; align-items: center" v-if="group_list && group_list.length > 0">
          <label style="margin-right: 8px; font-size: 14px">监控组：</label>
          <el-checkbox-group v-model="group_select">
            <el-checkbox v-for="item in group_list" :key="item" :label="item" @change="fetchData"></el-checkbox>
          </el-checkbox-group>
        </div>
      </div>

      <div class="eh-table-wrap alertTable">
        <el-table
          ref="multipleTable"
          :data="tableData"
          tooltip-effect="dark"
          border
          :header-cell-style="{ background: '#eef1f6', color: '#606266' }"
          stripe
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="40"></el-table-column>
          <el-table-column prop="id" label="规则ID" fit align="center" sortable></el-table-column>
          <el-table-column prop="name" label="告警名称" fit align="center" sortable>
            <template #default="{ row }">
              <b style="color: #00a1c9">{{ row.name }}</b>
            </template>
          </el-table-column>
          <el-table-column prop="group_name" label="监控组" fit align="center" sortable></el-table-column>
          <el-table-column prop="zone" label="业务域" fit align="center" sortable>
            <template #default="{ row }">
              {{ row.labels.namespace }}
            </template>
          </el-table-column>
          <el-table-column prop="env" label="环境" fit align="center" sortable>
            <template #default="{ row }">
              {{ row.labels.env }}
            </template>
          </el-table-column>
          <el-table-column prop="platform" label="监控平台" fit align="center">
            <template #default="{ row }">
              <el-image v-if="row.platform === 'zabbix'" :src="zabbixUrl" style="height: 50px; width: 60px"></el-image>
              <el-image v-else-if="row.platform === 'prometheus'" :src="prometheusUrl" style="height: 50px; width: 70px"></el-image>
              <el-image v-else-if="row.platform === 'skywalking'" :src="skywalkingUrl" style="height: 45px; width: 70px"></el-image>
            </template>
          </el-table-column>
          <el-table-column prop="platform_name" label="账号" fit align="center">
            <template #default="{ row }">
              {{ row.platform_name }}（{{ row.platform_ns }}）
            </template>
          </el-table-column>
          <el-table-column prop="level" label="等级" width="100px" align="center">
            <template #default="{ row }">
              {{ row.labels.level }}
            </template>
          </el-table-column>
          <el-table-column prop="freq" label="告警频率(min/次)" align="center" width="100px">
            <template #default="{ row }">
              <span v-if="row.freq !== 0">{{ row.freq }} min/次</span>
              <span v-else>{{ row.freq }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="group" label="告警群" fit align="center">
            <template #default="{ row }">
              <div v-for="(item, index) in row.group" :key="index">
                <el-tag size="small" style="margin-right: 3px; margin-top: 5px" v-if="item.name">{{ item.name }}</el-tag>
                <el-tag size="small" style="margin-right: 3px; margin-top: 5px" v-else>{{ item }}</el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="recovery" label="恢复通知" align="center" width="100px" sortable>
            <template #default="{ row }">
              <el-switch
                v-model="row.recovery"
                active-color="#13ce66"
                inactive-color="#ff4949"
                @change="updateRecoverClick(row)"
              >
              </el-switch>
            </template>
          </el-table-column>
          <el-table-column prop="update_time" label="更新时间" fit align="center" sortable></el-table-column>

          <el-table-column label="操作" width="150" align="center" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link :icon="CopyDocument" size="small" @click="createClick(row)" style="margin-right: 5px">复制</el-button>

              <el-dropdown trigger="click" @command="handleCommand">
                <el-button type="primary" link size="small">
                  更多操作
                  <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-tooltip class="item" effect="dark" content="编辑告警规则, 此操作将会同步更新至prometheus" placement="top">
                      <el-dropdown-item :command="{ action: 'edit', row }">
                        <el-icon style="vertical-align: middle; margin-right: 4px"><Edit /></el-icon>
                        编辑
                      </el-dropdown-item>
                    </el-tooltip>
                    <el-tooltip class="item" effect="dark" content="告警通知发送配置" placement="top">
                      <el-dropdown-item :command="{ action: 'setting', row }">
                        <el-icon style="vertical-align: middle; margin-right: 4px"><Setting /></el-icon>
                        配置
                      </el-dropdown-item>
                    </el-tooltip>
                    <el-tooltip class="item" effect="dark" content="危险操作, 此操作将会同步删除prometheus的告警规则，请谨慎操作" placement="top">
                      <el-dropdown-item :command="{ action: 'delete', row }">
                        <el-icon style="vertical-align: middle; margin-right: 4px"><Delete /></el-icon>
                        删除
                      </el-dropdown-item>
                    </el-tooltip>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <el-dialog title="导入规则" v-model="dialogVisable" width="40%">
        <el-form :model="importData">
          <el-form-item label="监控平台" :label-width="formLabelWidth" required>
            <el-select v-model="importData.platform" placeholder="请选择监控平台" style="width: 90%">
              <el-option label="prometheus" value="prometheus"></el-option>
              <el-option label="skywalking" value="skywalking" disabled></el-option>
              <el-option label="zabbix" value="zabbix" disabled></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="账号" :label-width="formLabelWidth" required>
            <el-select v-model="importData.account_id" placeholder="请选择监控平台" style="width: 90%">
              <el-option v-for="item in accont_list" :key="item.id" :label="item.name" :value="item.id">
                <span style="float: left">{{ item.name }}({{ item.env }})</span>
                <span style="float: right; color: #8492a6; font-size: 13px">{{ item.remark }}</span>
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="Yaml内容" :label-width="formLabelWidth" required>
            <el-input v-model="importData.yaml_content" type="textarea" :rows="20" placeholder="请输入prometheus YAML文件内容" style="width: 90%"></el-input>
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer" style="text-align: center">
            <el-button @click="dialogVisable = false">取 消</el-button>
            <el-button type="primary" @click="importCommit">确 定</el-button>
          </div>
        </template>
      </el-dialog>

      <el-dialog title="新增监控项" v-model="dialogAddVisable" width="60%" :close-on-click-modal="false">
        <el-form :model="addData">
          <el-form-item label="监控平台" :label-width="formLabelWidth" required>
            <el-select v-model="addData.platform" placeholder="请选择监控平台" style="width: 90%">
              <el-option label="prometheus" value="prometheus"></el-option>
              <el-option label="skywalking" value="skywalking" disabled></el-option>
              <el-option label="zabbix" value="zabbix" disabled></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="账号" :label-width="formLabelWidth" required>
            <el-select v-model="addData.platform_id" placeholder="请选择账号" style="width: 90%">
              <el-option v-for="item in accont_list" :key="item.id" :label="item.name" :value="item.id">
                <span style="float: left">{{ item.name }}({{ item.env }})</span>
                <span style="float: right; color: #8492a6; font-size: 13px">{{ item.remark }}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="监控项名称" :label-width="formLabelWidth" required>
            <el-input v-model="addData.name" style="width: 90%" placeholder="请输入告警名称"></el-input>
          </el-form-item>
          <el-form-item label="所属组" :label-width="formLabelWidth" required>
            <el-input v-model="addData.group_name" style="width: 90%" placeholder="请输入所属组名"></el-input>
          </el-form-item>

          <el-form-item
            v-for="(label, index) in addData.label_data"
            :key="label.id"
            :label="'Label' + [index]"
            :label-width="formLabelWidth"
            :style="{ marginBottom: '5px' }"
          >
            <el-input
              v-if="['env', 'level', 'namespace', 'prometheus'].includes(addData.label_data[index].key)"
              v-model.trim="addData.label_data[index].key"
              style="width: 20%; margin-right: 7px"
              placeholder="请输入Key"
              disabled
            ></el-input>
            <el-input v-else v-model.trim="addData.label_data[index].key" style="width: 20%; margin-right: 7px" placeholder="请输入Key"></el-input>
            <el-input
              v-if="['prometheus'].includes(addData.label_data[index].key)"
              v-model.trim="addData.label_data[index].value"
              style="width: 69%"
              placeholder="请输入Value"
              disabled
            ></el-input>
            <el-input v-else v-model.trim="addData.label_data[index].value" style="width: 69%" placeholder="请输入Value"></el-input>
            <el-button v-if="index === 0" type="primary" size="small" style="margin-left: 5px" :icon="Plus" @click="addLabelClick(addData)">添加</el-button>
            <el-button
              v-if="index > 0 && !['env', 'level', 'namespace', 'prometheus'].includes(addData.label_data[index].key)"
              type="warning"
              size="small"
              style="margin-left: 5px"
              @click.prevent="removeLabelClick(addData, label)"
              :icon="Delete"
              >删除</el-button
            >
          </el-form-item>
          <el-form-item></el-form-item>
          <el-form-item
            v-for="(anno, i) in addData.anno_data"
            :key="anno.id"
            :label="'Annotation' + [i]"
            :label-width="formLabelWidth"
            :style="{ marginBottom: '5px' }"
          >
            <el-input v-model.trim="addData.anno_data[i].key" style="width: 20%; margin-right: 7px" placeholder="请输入Key"></el-input>
            <el-input
              v-if="addData.anno_data[i].key === 'description'"
              v-model="addData.anno_data[i].value"
              type="textarea"
              style="width: 69%"
              placeholder="请输入Value"
            ></el-input>
            <el-input v-else v-model.trim="addData.anno_data[i].value" style="width: 69%" placeholder="请输入Value"></el-input>
            <el-button v-if="i === 0" type="primary" size="small" style="margin-left: 5px" :icon="Plus" @click="addAnnoClick(addData)">添加</el-button>
            <el-button v-if="i > 0" type="warning" size="small" style="margin-left: 5px" @click.prevent="removeAnnoClick(addData, anno)" :icon="Delete"
              >删除</el-button
            >
          </el-form-item>
          <el-form-item></el-form-item>
          <el-form-item
            v-for="(item, index) in addData.other_field"
            :key="item.id"
            :label="'其他配置' + [index]"
            :label-width="formLabelWidth"
            :style="{ marginBottom: '5px' }"
          >
            <el-input v-model.trim="addData.other_field[index].key" style="width: 20%; margin-right: 7px" placeholder="请输入Key"></el-input>
            <el-input
              v-if="addData.other_field[index].key === 'expr'"
              v-model="addData.other_field[index].value"
              type="textarea"
              style="width: 69%"
              placeholder="请输入Value"
            ></el-input>
            <el-input v-else v-model.trim="addData.other_field[index].value" style="width: 69%" placeholder="请输入Value"></el-input>
            <el-button v-if="index === 0" type="primary" size="small" style="margin-left: 5px" :icon="Plus" @click="addOtherClick(addData)">添加</el-button>
            <el-button v-if="index > 0" type="warning" size="small" style="margin-left: 5px" @click.prevent="removeOtherClick(addData, item)" :icon="Delete"
              >删除</el-button
            >
          </el-form-item>
          <el-form-item></el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer" style="text-align: center">
            <el-button @click="dialogAddVisable = false">取 消</el-button>
            <el-button type="primary" @click="addCommit">确 定</el-button>
          </div>
        </template>
      </el-dialog>

      <el-dialog title="编辑监控项" v-model="dialogEditVisable" width="60%" :close-on-click-modal="false">
        <el-form :model="editData">
          <el-form-item label="账号" :label-width="formLabelWidth" required>
            <el-select v-model="editData.platform_id" placeholder="请选择账号" style="width: 90%" disabled>
              <el-option v-for="item in accont_list" :key="item.id" :label="item.name" :value="item.id">
                <span style="float: left">{{ item.name }}({{ item.env }})</span>
                <span style="float: right; color: #8492a6; font-size: 13px">{{ item.remark }}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="监控项名称" :label-width="formLabelWidth" required>
            <el-input v-model="editData.name" style="width: 90%"></el-input>
          </el-form-item>
          <el-form-item label="所属组" :label-width="formLabelWidth" required>
            <el-input v-model="editData.group_name" style="width: 90%" disabled></el-input>
          </el-form-item>

          <el-form-item
            v-for="(label, index) in editData.label_data"
            :key="label.id"
            :label="'Label' + [index]"
            :label-width="formLabelWidth"
            :style="{ marginBottom: '5px' }"
          >
            <el-input
              v-if="['env', 'level', 'namespace', 'prometheus', 'rule_id'].includes(editData.label_data[index].key)"
              v-model.trim="editData.label_data[index].key"
              style="width: 20%; margin-right: 7px"
              placeholder="请输入Key"
              disabled
            ></el-input>
            <el-input v-else v-model.trim="editData.label_data[index].key" style="width: 20%; margin-right: 7px" placeholder="请输入Key"></el-input>
            <el-input
              v-if="['prometheus'].includes(editData.label_data[index].key)"
              v-model.trim="editData.label_data[index].value"
              style="width: 69%"
              placeholder="请输入Value"
              disabled
            ></el-input>
            <el-input v-else v-model.trim="editData.label_data[index].value" style="width: 69%" placeholder="请输入Value"></el-input>
            <el-button v-if="index === 0" type="primary" size="small" style="margin-left: 5px" :icon="Plus" @click="addLabelClick(editData)">添加</el-button>
            <el-button
              v-if="index > 0 && !['env', 'level', 'namespace', 'prometheus', 'rule_id'].includes(editData.label_data[index].key)"
              type="warning"
              size="small"
              style="margin-left: 5px"
              @click.prevent="removeLabelClick(editData, label)"
              :icon="Delete"
              >删除</el-button
            >
          </el-form-item>
          <el-form-item></el-form-item>
          <el-form-item
            v-for="(anno, i) in editData.anno_data"
            :key="anno.id"
            :label="'Annotation' + [i]"
            :label-width="formLabelWidth"
            :style="{ marginBottom: '5px' }"
          >
            <el-input v-model.trim="editData.anno_data[i].key" style="width: 20%; margin-right: 7px" placeholder="请输入Key"></el-input>
            <el-input
              v-if="editData.anno_data[i].key === 'description'"
              v-model="editData.anno_data[i].value"
              type="textarea"
              style="width: 69%"
              placeholder="请输入Value"
            ></el-input>
            <el-input v-else v-model.trim="editData.anno_data[i].value" style="width: 69%" placeholder="请输入Value"></el-input>
            <el-button v-if="i === 0" type="primary" size="small" style="margin-left: 5px" :icon="Plus" @click="addAnnoClick(editData)">添加</el-button>
            <el-button v-if="i > 0" type="warning" size="small" style="margin-left: 5px" @click.prevent="removeAnnoClick(editData, anno)" :icon="Delete"
              >删除</el-button
            >
          </el-form-item>
          <el-form-item></el-form-item>
          <el-form-item
            v-for="(item, index) in editData.other_field"
            :key="item.id"
            :label="'其他配置' + [index]"
            :label-width="formLabelWidth"
            :style="{ marginBottom: '5px' }"
          >
            <el-input v-model.trim="editData.other_field[index].key" style="width: 20%; margin-right: 7px" placeholder="请输入Key"></el-input>
            <el-input
              v-if="editData.other_field[index].key === 'expr'"
              v-model="editData.other_field[index].value"
              type="textarea"
              style="width: 69%"
              placeholder="请输入Value"
            ></el-input>
            <el-input v-else v-model.trim="editData.other_field[index].value" style="width: 69%" placeholder="请输入Value"></el-input>
            <el-button v-if="index === 0" type="primary" size="small" style="margin-left: 5px" :icon="Plus" @click="addOtherClick(editData)">添加</el-button>
            <el-button v-if="index > 0" type="warning" size="small" style="margin-left: 5px" @click.prevent="removeOtherClick(editData, item)" :icon="Delete"
              >删除</el-button
            >
          </el-form-item>
          <el-form-item></el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer" style="text-align: center">
            <el-button @click="dialogEditVisable = false">取 消</el-button>
            <el-button type="primary" @click="editCommit">确 定</el-button>
          </div>
        </template>
      </el-dialog>

      <el-dialog title="告警配置" v-model="dialogSetVisable" width="50%">
        <el-form :model="setData">
          <el-form-item label="监控项ID" :label-width="formLabelWidth" required v-if="!barchSet">
            <el-input v-model="setData.id" style="width: 90%" disabled></el-input>
          </el-form-item>
          <el-form-item label="监控项名称" :label-width="formLabelWidth" required v-if="!barchSet">
            <el-input v-model="setData.name" style="width: 90%" disabled></el-input>
          </el-form-item>
          <el-form-item label="所属组" :label-width="formLabelWidth" required v-if="!barchSet">
            <el-input v-model="setData.group_name" style="width: 90%" disabled></el-input>
          </el-form-item>
          <el-form-item label="告警群" :label-width="formLabelWidth" required>
            <el-select v-model="setData.chat_groups" multiple filterable placeholder="请选择要发送的群组" style="width: 90%">
              <el-option v-for="item in chat_groups_list" :key="item.chat_id" :label="item.name" :value="item.chat_id">
                <span style="float: left">{{ item.name }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">{{ item.chat_id }}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="告警频率" :label-width="formLabelWidth" required>
            <el-input v-model="setData.freq" style="width: 90%" placeholder="告警发送周期(步长), 告警期间多久发送一次告警, 默认为0只发送一次">
              <template #append>
                <span>min / 次</span>
              </template>
            </el-input>
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer" style="text-align: center">
            <el-button @click="dialogSetVisable = false">取 消</el-button>
            <el-button type="primary" @click="setCommit">确 定</el-button>
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
        >
        </el-pagination>
      </div>
    </div>
  </el-container>
</template>

<script>
import {
  Search,
  Plus,
  Download,
  Document,
  Delete,
  Setting,
  Edit,
  ArrowDown,
  CopyDocument
} from '@element-plus/icons-vue'
import skywalkingUrl from '@/assets/skywalking.svg?url'
import prometheusUrl from '@/assets/prometheus.webp?url'

function platformBadgeUrl(label, color) {
  return (
    'data:image/svg+xml;charset=UTF-8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="70" height="50"><rect fill="${color}" width="70" height="50" rx="4"/><text x="35" y="32" text-anchor="middle" fill="#fff" font-size="11" font-family="system-ui,sans-serif">${label}</text></svg>`
    )
  )
}
import {
  getAlertPlatform,
  importAlertRule,
  getAlertRule,
  exportAlertRule,
  updateAlertRule,
  deleteAlertRule,
  addAlertRule,
  deployAlertRule,
  getChatGroups,
  setConfig
} from '@/api'
import { currentChange, handleSelectionChange, handleSizeChange, saveYamlFile } from '@/utils/common'

export default {
  name: 'alert_manage',
  components: {
    Search,
    Plus,
    Download,
    Document,
    Delete,
    Setting,
    Edit,
    ArrowDown,
    CopyDocument
  },
  data() {
    return {
      zabbixUrl: platformBadgeUrl('Zabbix', '#c0392b'),
      prometheusUrl,
      skywalkingUrl,
      dialogVisable: false,
      dialogEditVisable: false,
      dialogAddVisable: false,
      dialogSetVisable: false,
      barchSet: false,
      formLabelWidth: '100px',
      zone_select: [],
      zone_list: [],
      group_select: [],
      group_list: [],
      chat_groups_list: [],
      importData: {},
      recovery: false,
      addData: {
        name: '',
        group_name: '',
        label_data: [
          { key: 'namespace', value: '', id: Date.now() + Math.random() },
          { key: 'env', value: 'prod', id: Date.now() + Math.random() },
          { key: 'level', value: 'P2', id: Date.now() + Math.random() },
          { key: 'prometheus', value: 'monitoring/kube-prometheus-stack-prometheus', id: Date.now() + Math.random() }
        ],
        anno_data: [
          { key: 'summary', value: '', id: Date.now() + Math.random() },
          { key: 'solution', value: '', id: Date.now() + Math.random() },
          { key: 'dashboard', value: '', id: Date.now() + Math.random() },
          { key: 'description', value: '', id: Date.now() + Math.random() }
        ],
        other_field: [
          { key: 'expr', value: '', id: Date.now() + Math.random() },
          { key: 'for', value: '10s', id: Date.now() + Math.random() }
        ]
      },
      editData: {
        name: '',
        label_data: [{ key: '', value: '', id: Date.now() + Math.random() }],
        anno_data: [{ key: '', value: '', id: Date.now() + Math.random() }],
        other_field: [{ key: '', value: '', id: Date.now() + Math.random() }]
      },
      setData: {
        group_name: '',
        chat_groups: []
      },
      params: { page: 1, pagesize: 15, total: 0, search: '' },
      multipleSelection: [],
      accont_list: [],
      tableData: []
    }
  },
  created() {
    this.fetchData()
  },
  watch: {
    'addData.platform_id': {
      handler(newV) {
        this.accont_list.forEach((item) => {
          if (item.id === newV) {
            this.addData.label_data.forEach((label) => {
              if (label.key === 'env') {
                label.value = item.env
              }
            })
          }
        })
      }
    }
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
      if (this.group_select.length !== 0) {
        this.params.group_name__in = JSON.stringify(this.group_select)
      } else {
        delete this.params.group_name__in
      }
      var resp = await getAlertRule(this.params).catch(() => {
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
        this.group_list = resp.group_list
        this.params.total = resp.total
      }
    },
    async fetchAccountData() {
      var resp = await getAlertPlatform({ page: 1, pagesize: 100, search: '' }).catch(() => {
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
        this.accont_list = resp.data
        console.log(this.accont_list)
      }
    },
    async importCommit() {
      var resp = await importAlertRule(this.importData).catch(() => {
        this.$message({ type: 'error', message: '请求响应失败, 请联系管理员' })
        return 0
      })
      if (!resp) {
        return
      }
      if (resp.code !== 200) {
        this.$message({ type: 'warning', message: resp.msg.replace(/\n/g, '<br>'), dangerouslyUseHTMLString: true })
      } else {
        this.$message({ type: 'success', message: resp.msg })
      }
      await this.fetchData()
      this.dialogVisable = false
    },
    handleCommand(cmd) {
      const { action, row } = cmd
      if (action === 'edit') this.editClick(row)
      else if (action === 'setting') this.setClick(row)
      else if (action === 'delete') this.deleteClick(row)
    },
    editClick(row) {
      var tmp_data = JSON.parse(JSON.stringify(row))
      this.fetchAccountData()
      this.editData.name = row.name
      this.editData.group_name = tmp_data.group_name
      this.editData.remark = tmp_data.remark
      var label_data = []
      var anno_data = []
      var other_field = []
      Object.entries(tmp_data.other_field).forEach(([key, value]) => {
        other_field.push({ key: key, value: value })
      })

      Object.entries(tmp_data.labels).forEach(([key, value]) => {
        label_data.push({ key: key, value: value })
      })

      Object.entries(tmp_data.annotations).forEach(([key, value]) => {
        anno_data.push({ key: key, value: value })
      })

      this.editData.label_data = label_data
      this.editData.anno_data = anno_data
      this.editData.other_field = other_field
      this.editData.platform_id = row.platform_id
      this.editData.id = row.id
      console.log(this.editData)
      this.dialogEditVisable = true
    },
    async exportClick() {
      var batchSelect = []
      if (this.multipleSelection.length === 0) {
        this.$message({ type: 'info', message: '请选中您要导出的规则' })
        return 0
      }
      this.multipleSelection.forEach((item) => {
        batchSelect.push(item.id)
      })
      console.log(batchSelect)
      var resp = await exportAlertRule({ ids: batchSelect }).catch(() => {
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
        saveYamlFile(resp.data, resp.group_name + '.yaml')
      }
    },
    async addCommit() {
      var data = this.preDealData(this.addData)
      var resp = await addAlertRule(data).catch(() => {
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
        this.$message({ type: 'success', message: resp.msg })
      }
      this.fetchData()
      this.dialogAddVisable = false
    },
    async editCommit() {
      console.log(this.editData)
      var data = this.preDealData(this.editData)
      var resp = await updateAlertRule(data).catch(() => {
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
        this.$message({ type: 'success', message: resp.msg })
      }
      this.fetchData()
      this.dialogEditVisable = false
    },
    async batchDelRuleClick() {
      var batchSelect = []
      if (this.multipleSelection.length === 0) {
        this.$message({ type: 'info', message: '请选中您要删除的规则' })
        return 0
      }
      this.multipleSelection.forEach((item) => {
        batchSelect.push(item.id)
      })
      this.$confirm('删除后是否更新到prometheus?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          var data = { id_list: batchSelect }
          var resp = await deleteAlertRule(data).catch(() => {
            this.$message({ type: 'error', message: '请求响应失败, 请联系管理员' })
            return 0
          })
          if (resp === 0) {
            return
          }
          if (resp.code === 200) {
            this.$message({ type: 'success', message: '删除成功' })
            await this.fetchData()
          } else {
            this.$message({ type: 'warning', message: resp.msg })
          }
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '取消删除'
          })
        })
    },
    async barchSetClick() {
      this.barchSet = true

      var resp = await getChatGroups().catch(() => {
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
        this.chat_groups_list = resp.data
      }

      var batchSelect = []
      if (this.multipleSelection.length === 0) {
        this.$message({ type: 'info', message: '请选中您要配置的规则' })
        return 0
      }
      this.multipleSelection.forEach((item) => {
        batchSelect.push(item.id)
      })
      this.dialogSetVisable = true
      this.setData = {
        id: batchSelect
      }
    },
    async createClick(row) {
      await this.fetchAccountData()
      if (row) {
        this.transferAddData(row)
      }
      this.dialogAddVisable = true
    },
    async setClick(row) {
      this.barchSet = false
      var resp = await getChatGroups().catch(() => {
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
        this.chat_groups_list = resp.data
      }
      this.dialogSetVisable = true
      const group_id = Array.isArray(row.group) ? row.group.map((item) => item.chat_id) : []
      this.setData = {
        id: [row.id],
        name: row.name,
        group_name: row.group_name,
        chat_groups: group_id
      }
    },
    async updateRecoverClick(row) {
      var data = {
        id: [row.id],
        recovery: row.recovery
      }
      var resp = await setConfig(data).catch(() => {
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
        this.$message({ type: 'success', message: resp.msg })
      }
    },
    async setCommit() {
      var data = {
        id: this.setData.id,
        chat_group: [],
        freq: this.setData.freq
      }
      if (Array.isArray(this.setData.chat_groups) && this.setData.chat_groups.length > 0) {
        data['chat_group'] = this.setData.chat_groups
          .map((item) => {
            if (typeof item === 'string') {
              return this.chat_groups_list.find((g) => g.chat_id === item) || { name: '', chat_id: item }
            } else if (typeof item === 'object' && item.chat_id) {
              return item
            }
            return null
          })
          .filter(Boolean)
      }
      if (Array.isArray(data.id) && data.id.length === 0) {
        this.$message({ type: 'warning', message: '请先选中要批量操作的规则' })
        return
      }
      var resp = await setConfig(data).catch(() => {
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
        this.$message({ type: 'success', message: resp.msg })
      }
      this.fetchData()
      this.dialogSetVisable = false
    },
    async deleteClick(row) {
      this.$confirm('删除后是否更新到prometheus?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          var data = { id: row.id }
          var resp = await deleteAlertRule(data).catch(() => {
            this.$message({ type: 'error', message: '请求响应失败, 请联系管理员' })
            return 0
          })
          if (resp === 0) {
            return
          }
          if (resp.code === 200) {
            this.$message({ type: 'success', message: '删除成功' })
            await this.fetchData()
          } else {
            this.$message({ type: 'warning', message: resp.msg })
          }
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '取消删除'
          })
        })
    },

    preDealData(data) {
      var commit_data = JSON.parse(JSON.stringify(data))

      commit_data.labels = data.label_data.reduce((acc, item) => {
        acc[item.key] = item.value
        return acc
      }, {})

      commit_data.annotations = data.anno_data.reduce((acc, item) => {
        acc[item.key] = item.value
        return acc
      }, {})

      commit_data.other_field = data.other_field.reduce((acc, item) => {
        acc[item.key] = item.value
        return acc
      }, {})
      console.log(commit_data)
      delete commit_data.label_data
      delete commit_data.anno_data
      return commit_data
    },
    transferAddData(data) {
      var addData = JSON.parse(JSON.stringify(data))
      delete addData.labels
      delete addData.annotations
      addData.label_data = Object.entries(data.labels || {})
        .filter(([key]) => key !== 'rule_id')
        .map(([key, value]) => ({
          key,
          value
        }))
      addData.anno_data = Object.entries(data.annotations || {}).map(([key, value]) => ({
        key,
        value
      }))
      addData.other_field = Object.entries(data.other_field || {}).map(([key, value]) => ({
        key,
        value
      }))

      this.addData = addData
    },

    addLabelClick(data) {
      data.label_data.push({
        key: '',
        value: '',
        id: Date.now() + Math.random()
      })
    },
    removeLabelClick(data, item) {
      var index = data.label_data.indexOf(item)
      if (index !== -1) {
        data.label_data.splice(index, 1)
      }
    },
    addAnnoClick(data) {
      data.anno_data.push({
        key: '',
        value: '',
        id: Date.now() + Math.random()
      })
    },
    removeAnnoClick(data, item) {
      var index = data.anno_data.indexOf(item)
      if (index !== -1) {
        data.anno_data.splice(index, 1)
      }
    },

    addOtherClick(data) {
      data.other_field.push({
        key: '',
        value: '',
        id: Date.now() + Math.random()
      })
    },
    removeOtherClick(data, item) {
      var index = data.other_field.indexOf(item)
      if (index !== -1) {
        data.other_field.splice(index, 1)
      }
    }
  }
}
</script>
