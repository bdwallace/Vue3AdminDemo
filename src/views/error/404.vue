<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

function goHome() {
  router.replace("/index/log");
}
</script>

<template>
  <div class="not-found">
    <el-card class="panel" shadow="never">
      <div class="code">404</div>
      <h1 class="title">页面不存在</h1>
      <p class="desc">请检查地址是否正确，或返回告警概览</p>
      <el-button type="primary" round @click="goHome">返回概览</el-button>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px 16px;
  box-sizing: border-box;
}

.panel {
  max-width: 420px;
  width: 100%;
  text-align: center;
  border-radius: 12px;
  border: 1px solid var(--el-border-color);
  background:
    linear-gradient(135deg, var(--el-color-primary-light-9), transparent 55%),
    var(--el-bg-color);
  padding: 32px 24px;
}

.code {
  font-size: 56px;
  font-weight: 700;
  line-height: 1;
  color: var(--el-color-primary);
  margin-bottom: 12px;
}

.title {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
}

.desc {
  margin: 0 0 20px;
  font-size: 14px;
  color: var(--el-text-color-regular);
}
</style>
