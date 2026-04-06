<template>
  <el-container class="eh-page">
    <div class="main">
      <div>
        <el-tabs v-model="activeName" @tab-change="onTabChange">
          <el-tab-pane label="基础静默" name="base-silence">
            <base-silence v-if="activeName === 'base-silence'" />
          </el-tab-pane>
          <el-tab-pane label="周期禁默" name="cycle-silence">
            <cycle-silence v-if="activeName === 'cycle-silence'" />
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </el-container>
</template>

<script>
import baseSilence from '@/views/base_silence.vue'
import cycleSilence from '@/views/cycle_silence.vue'

export default {
  name: 'silence_manage',
  components: { baseSilence, cycleSilence },
  data() {
    return {
      activeName: 'base-silence'
    }
  },
  methods: {
    onTabChange(name) {
      console.log(name)
    }
  }
}
</script>
