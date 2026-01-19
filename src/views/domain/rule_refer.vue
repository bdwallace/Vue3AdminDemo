<template>
    <el-container style="height: 100%;display: table">
  
  <!--    <div class="create-server-block" style="background: white">-->
      <div class="create-server-block" style="margin-top: 15px">
        <el-descriptions class="margin-top" title="安全组基本信息" :column="4">
          <el-descriptions-item label="安全组ID">{{ security_group_info.id}}</el-descriptions-item>
          <el-descriptions-item label="安全组名称">
            <el-tag size="medium">{{ security_group_info.firewall_name.substring(0, 60) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="所属业务">{{ security_group_info.business_name }}</el-descriptions-item>
          <el-descriptions-item label="所属云厂商">{{ security_group_info.supplier_name}}</el-descriptions-item>
          <el-descriptions-item label="云厂商账号">{{ security_group_info.supplier_account}}</el-descriptions-item>
          <el-descriptions-item label="所属区域">{{ security_group_info.region }}</el-descriptions-item>
          <el-descriptions-item label="备注">{{ security_group_info.remark }}</el-descriptions-item>
          <el-descriptions-item label="规则数量">{{ security_group_info.amount }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ security_group_info.update_time}}</el-descriptions-item>
  
        </el-descriptions>
      </div>
  
  
      <div class="create-server-block">
        <div class="search-bock">
          <el-input placeholder="请输入搜索内容, 支持所有内容模糊搜索, 回车或点击按钮搜索" v-model="params.search" style="width: 70%;" @change="fetchData">
            <el-button type="primary" slot="append" icon="el-icon-search" @click="fetchData">搜索</el-button>
          </el-input>
          <el-tooltip content="此操作需要审批" class="item" effect="dark"  placement="top">
            <el-button @click="addRuleClick" style="margin-bottom: 8px;margin-left: 20px"
                       icon="el-icon-plus" type="primary" size="medium" :disabled="disable_sg_lilst.includes(security_group_info.id)">新增规则</el-button>
          </el-tooltip>
          <el-tooltip content="未绑定业务线(所属业务)，将无法获取审批人发起审批" class="item" effect="dark"  placement="top">
            <el-button @click="updateBusinessClick" style="margin-bottom: 8px;margin-left: 20px" icon="iconfont icon-bangding" type="primary" size="small" >绑定业务线</el-button>
          </el-tooltip>
          <el-tooltip content="此操作需要审批" class="item" effect="dark"  placement="top">
            <el-button @click="batchDelRuleClick" style="margin-bottom: 8px;margin-left: 20px"
                       icon="el-icon-delete" type="danger" size="medium" :disabled="disable_sg_lilst.includes(security_group_info.id)">批量删除</el-button>
          </el-tooltip>
  <!--        <el-tooltip content="此操作需要审批" placement="top" v-if="security_group_info.supplier_name !== 'OpenStack'">-->
  <!--          <el-button @click="bindHostClick" style="margin-bottom: 8px;margin-left: 20px" type="warning" size="small">绑定安全组</el-button>-->
  <!--        </el-tooltip>-->
  <!--        <el-tooltip content="此操作需要审批" placement="top" v-if="security_group_info.supplier_name !== 'OpenStack'">-->
  <!--          <el-button @click="unbindHostClick" style="margin-bottom: 8px;margin-left: 20px" type="warning" size="small">解绑安全组</el-button>-->
  <!--        </el-tooltip>-->
  
        </div>
  
        <el-table ref="multipleTable" :data="tableData" tooltip-effect="dark"
            border :header-cell-style="{background:'#eef1f6',color:'#606266'}"
            @selection-change="handleSelectionChange">
  
            <el-table-column type="selection" fit></el-table-column>
            <el-table-column prop="id" label="ID" fit align="center"></el-table-column>
            <el-table-column prop="direction" label="方向" fit align="center" sortable></el-table-column>
            <el-table-column prop="policy" label="授权策略" fit align="center" sortable v-if="security_group_info.supplier_name ==='Aliyun'"></el-table-column>
            <el-table-column prop="priority" label="优先级" fit align="center" sortable v-if="security_group_info.supplier_name ==='Aliyun'"></el-table-column>
            <el-table-column prop="protocol" label="IP协议" fit align="center"></el-table-column>
            <el-table-column prop="port_range" label="端口范围" fit align="center" sortable></el-table-column>
            <el-table-column prop="source" label="源地址" fit align="center" sortable>
              <template slot-scope="scope">
                <el-tooltip class="item" effect="dark" :content="scope.row.source.name" placement="top" v-if="scope.row.source_type === 'pl' || scope.row.source_type === 'sg' || scope.row.source.length > 20">
                  <el-button type="primary" size="small" plain v-if="scope.row.source_type === 'pl' || scope.row.source_type === 'sg' || scope.row.source.length > 20" @click="DetailClick(scope.row)">
                      {{ scope.row.source.id}}
                  </el-button>
                </el-tooltip>
                <span v-else>{{ scope.row.source}}</span>
  
              </template>
            </el-table-column>
  <!--          <el-table-column prop="policy" label="策略" fit align="center"></el-table-column>-->
            <el-table-column prop="create_time" label="创建时间" fit align="center" sortable></el-table-column>
            <el-table-column prop="update_time" label="更新时间" fit align="center" sortable></el-table-column>
            <el-table-column prop="remark" label="备注" fit align="center"></el-table-column>
            <el-table-column label="操作" width="180" align="center" fixed="right">
              <template slot-scope="scope">
                <el-tooltip class="item" effect="dark" content="此操作需要审批" placement="top"
                            v-if="security_group_info.supplier_name === 'AWS' || security_group_info.supplier_name === 'Aliyun'">
                  <el-button type="text" icon="el-icon-edit" size="mini" @click="editClick(scope.row)" :disabled="disable_sg_lilst.includes(security_group_info.id)">编辑</el-button>
                </el-tooltip>
                <el-tooltip class="item" effect="dark" content="此操作需要审批" placement="top" >
                  <el-button type="text" icon="el-icon-delete" size="mini" style="color: #ef3535"
                             @click="deleteRuleClick(scope.row)" :disabled="disable_sg_lilst.includes(security_group_info.id)">删除</el-button>
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table>
      </div>
  
      <el-dialog title="安全组绑定主机" :visible.sync="DialogVisable" width="40%">
        <el-form :model="bindData">
          <el-form-item label="安全组名称:" :label-width="formLabelWidth" >
            <el-input v-model="bindData.sg_name" placeholder="请输入防火墙名称" style="width: 85%" disabled></el-input>
          </el-form-item>
          <el-form-item label="安全组ID:" :label-width="formLabelWidth" >
            <el-input v-model="bindData.sg_id" placeholder="请输入防火墙名称" style="width: 85%" disabled></el-input>
          </el-form-item>
          <el-form-item label="绑定主机:" :label-width="formLabelWidth" required>
            <el-select v-model="bindData.host_id" filterable placeholder="请选择要绑定的主机" style="width: 85%" remote :remote-method="filterHost">
              <el-option v-for="item in all_hosts" :key="item.id" :label="item.label" :value="item.id">
                <span style="float: left">{{ item.label }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">{{ item.value }}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="绑定原因:" :label-width="formLabelWidth" required>
            <el-input type="textarea" rows="3" v-model="bindData.reason" style="width: 85%" placeholder="请输入绑定原因"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer" style="text-align: center">
          <el-button @click="DialogVisable = false">取 消</el-button>
          <el-button type="primary" @click="bindHostCommit">确 定</el-button>
        </div>
      </el-dialog>
  
      <el-dialog title="解除绑定主机" :visible.sync="unbindDialogVisable" width="40%">
        <el-form :model="unbindData">
          <el-form-item label="安全组名称:" :label-width="formLabelWidth" >
            <el-input v-model="unbindData.sg_name" placeholder="请输入防火墙名称" style="width: 85%" disabled></el-input>
          </el-form-item>
          <el-form-item label="安全组ID:" :label-width="formLabelWidth" >
            <el-input v-model="unbindData.sg_id" placeholder="请输入防火墙名称" style="width: 85%" disabled></el-input>
          </el-form-item>
          <el-form-item label="已绑定主机:" :label-width="formLabelWidth" required>
            <el-select v-model="unbindData.host_id" filterable placeholder="请选择要解除绑定的主机" style="width: 85%">
              <el-option v-for="item in all_hosts" :key="item.id" :label="item.label" :value="item.id">
                <span style="float: left">{{ item.label }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">{{ item.value }}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="解绑原因:" :label-width="formLabelWidth" required>
            <el-input type="textarea" rows="3" v-model="unbindData.reason" style="width: 85%" placeholder="请输入解绑原因"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer" style="text-align: center">
          <el-button @click="unbindDialogVisable = false">取 消</el-button>
          <el-button type="primary" @click="unbindHostCommit">确 定</el-button>
        </div>
      </el-dialog>
  
      <el-drawer title="编辑规则" :visible.sync="editdrawer" size="35%" direction="rtl" ref="drawer">
        <div class="demo-drawer__content">
          <el-form :model="editRule" style="margin-left: 40px">
  
            <el-form-item label="协议类型:" :label-width="formLabelWidth">
              <el-select v-model="editRule.protocol" placeholder="请选择协议类型" style="width: 85%" disabled>
                <el-option label="TCP" value="TCP"></el-option>
                <el-option label="UDP" value="UDP"></el-option>
                <el-option label="ICMP" value="ICMP"></el-option>
                <el-option label="ANY" value="ANY"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="来源IP:" :label-width="formLabelWidth" v-if="editRule.source_type === 'pl' || editRule.source_type === 'sg'">
              <el-input v-model="editRule.source.id" style="width: 85%" disabled></el-input>
            </el-form-item>
            <el-form-item label="来源IP:" :label-width="formLabelWidth" v-else>
              <el-input v-model="editRule.source" style="width: 85%" ></el-input>
            </el-form-item>
            <el-form-item label="端口范围:" :label-width="formLabelWidth">
              <el-input v-model="editRule.port_range" style="width: 85%"></el-input>
            </el-form-item>
            <el-form-item label="申请原因:" :label-width="formLabelWidth" required>
              <el-input type="textarea" rows="3" v-model="editRule.reason" style="width: 85%" placeholder="请输入申请原因"></el-input>
            </el-form-item>
            <el-form-item label="备注:" :label-width="formLabelWidth" required>
              <el-input v-model="editRule.remark" type="textarea" :rows="3" placeholder="请使用英文备注，AWS云厂商不支持中文字符, Openstack可用中文字符" style="width: 85%"></el-input>
            </el-form-item>
          </el-form>
          <div class="demo-drawer__footer" style="margin-top: 80%;">
            <el-button @click="cancelForm" style="width: 50%">取 消</el-button>
            <el-button type="primary" @click="editRuleCommit()" style="width: 50%">提交</el-button>
          </div>
        </div>
      </el-drawer>
  
      <el-drawer title="新增规则" :visible.sync="adddrawer" size="35%" direction="rtl" ref="drawer">
        <div class="demo-drawer__content">
          <el-form :model="addRulesForm" style="margin-left: 40px">
            <el-form-item label="方向:" :label-width="formLabelWidth" required>
              <el-select v-model="addRulesForm.direction" placeholder="请选择方向" style="width: 85%">
                <el-option v-for="item in direction_options" :label="item" :value="item"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="授权策略:" :label-width="formLabelWidth" required v-if="security_group_info.supplier_name ==='Aliyun'">
              <el-select v-model="addRulesForm.policy" placeholder="请选择策略" style="width: 85%">
                <el-option label="接受" value="接受"></el-option>
                <el-option label="拒绝" value="拒绝"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="协议类型:" :label-width="formLabelWidth" required>
              <el-select v-model="addRulesForm.protocol" placeholder="请选择协议类型" style="width: 85%">
                <el-option label="TCP" value="TCP"></el-option>
                <el-option label="UDP" value="UDP"></el-option>
                <el-option label="ICMP" value="ICMP"></el-option>
  <!--              <el-option label="ANY" value="ANY"></el-option>-->
              </el-select>
            </el-form-item>
            <el-form-item label="源地址类型:" :label-width="formLabelWidth" required>
              <el-select v-model="source_type" placeholder="请选择源地址类型" style="width: 85%">
                <el-option label="ip或ip段" value="ip或ip段"></el-option>
                <el-option label="前缀列表" value="前缀列表"></el-option>
                <el-option label="其他安全组" value="其他安全组"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item :label="ip_label" :label-width="formLabelWidth" required v-if="source_type==='ip或ip段'">
              <el-input v-model="addRulesForm.target_ip" style=" width: 85%" type="textarea" :rows="3" placeholder="支持多项IP地址，多项请用','或换行隔开
  如0.0.0.0/0, 192.168.20.20, 192.168.30.0/24
  若不填子网掩码，自动补全/32"></el-input>
            </el-form-item>
            <el-form-item label="前缀列表:" :label-width="formLabelWidth" required v-if="source_type==='前缀列表'">
              <el-select v-model="addRulesForm.target_ip" placeholder="请选择前缀列表" style="width: 85%">
                <el-option :label="item.name + ' / ' + item.id" :value="item.id" v-for="item in source_list">
                  <span style="float: left;font-weight: bold">{{ item.name }}</span>
                  <span style="float: right;color: #33c38f; font-weight: bold">{{ item.id }}</span>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="其他安全组:" :label-width="formLabelWidth" required v-if="source_type==='其他安全组'">
              <el-select v-model="addRulesForm.target_ip" placeholder="请选择其他安全组" style="width: 85%" filterable>
                <el-option :label="item.name + ' / ' + item.id" :value="item.id" v-for="item in source_list">
                  <span style="float: left;font-weight: bold">{{ item.name }}</span>
                  <span style="float: right;color: #33c38f; font-weight: bold">{{ item.id }}</span>
                </el-option>
              </el-select>
            </el-form-item>
  
            <el-form-item label="端口范围:" :label-width="formLabelWidth" required  v-if="addRulesForm.protocol !== 'ICMP'">
              <el-input v-model="addRulesForm.port_range" style="width: 85%" type="textarea" :rows="3" placeholder="支持单个端口、端口范围，多项请用','或换行隔开
  如8000, 1000-2000"></el-input>
            </el-form-item>
  
            <el-form-item label="优先级:" :label-width="formLabelWidth" v-if="security_group_info.supplier_name ==='Aliyun'">
              <el-input-number v-model="addRulesForm.priority" :min="1" :max="100" size="small" style="width: 85%" label="自定义优先级最小为1最大为100"></el-input-number>
            </el-form-item>
            <el-form-item label="申请原因:" :label-width="formLabelWidth" required>
              <el-input type="textarea" rows="3" v-model="addRulesForm.reason" style="width: 85%" placeholder="请输入申请原因"></el-input>
            </el-form-item>
  
            <el-form-item label="备注:" :label-width="formLabelWidth" required>
              <el-input v-model="addRulesForm.remark" type="textarea" :rows="3" placeholder="请使用英文备注，AWS云厂商不支持中文字符, Openstack可用中文字符" style="width: 85%"></el-input>
            </el-form-item>
          </el-form>
          <div class="demo-drawer__footer" style="margin-top: 60%;">
            <el-button @click="cancelForm" style="width: 50%">取 消</el-button>
            <el-button type="primary" @click="addCommit()" style="width: 50%">提交</el-button>
          </div>
        </div>
      </el-drawer>
  
      <el-dialog title="绑定业务线" :visible.sync="businessDialogVisable" width="45%">
          <el-form :model="sginfoData">
            <el-form-item label="安全组名称:" :label-width="formLabelWidth">
              <el-input v-model="sginfoData.firewall_name" placeholder="请输入安全组名称" style="width: 85%" disabled></el-input>
            </el-form-item><el-form-item label="安全组ID:" :label-width="formLabelWidth">
              <el-input v-model="sginfoData.id" placeholder="请输入安全组ID" style="width: 85%" disabled></el-input>
            </el-form-item>
            <el-form-item label="所属业务:" :label-width="formLabelWidth">
              <el-select v-model="sginfoData.business_name" filterable placeholder="请选择所属业务" style="width: 85%">
                <el-option v-for="item in business_options" :key="item.id" :label="item.business_name" :value="item.business_name">
                  <span style="float: left">{{ item.business_name }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">{{ item.owner.join(' / ') }}</span>
                </el-option>
              </el-select>
              <el-button type="text"  icon="el-icon-refresh" style="margin-left: 5px" @click="refreshBusinessName">刷新</el-button>
            </el-form-item>
            <el-form-item label="备注:" :label-width="formLabelWidth">
              <el-input type="textarea" rows="3" v-model="sginfoData.remark" style="width: 85%"></el-input>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer" style="text-align: center">
            <el-button @click="businessDialogVisable = false">取 消</el-button>
            <el-button type="primary" @click="updateSecurityGroupCommit">确 定</el-button>
          </div>
        </el-dialog>
  
      <div style="padding: 10px 16px;text-align: right;">
          <el-pagination background  layout="total, sizes, prev, pager, next, jumper"
                       :page-size="params.pagesize" :page-sizes="[10,20,50,100,500,1000]"
                       :total="params.total"
                       @current-change="currentChange"
                       @size-change="handleSizeChange">
          </el-pagination>
        </div>
    </el-container>
  </template>


<style>
.main {
    margin-top: 1px;
    width: 100%;
    height: 90%;
    margin-left: 15px;
}



.create-server-block {
    background-color: white;
    padding: 20px;
    padding-top: 15px;
    margin-top: 15px;
    width: 98%;
    margin-left: 20px;
    margin-right: 10px;
}

.create-server-block ::v-deep .el-table .cell {
    white-space: pre-line;
}

.demo-drawer__footer {
    margin-left: 10px;
    margin-right: 10px;
    display: flex;
}

</style>