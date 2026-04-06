<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const greeting = computed(() => {
  const h = new Date().getHours();
  if (h < 6) return "凌晨好";
  if (h < 9) return "早上好";
  if (h < 12) return "上午好";
  if (h < 14) return "中午好";
  if (h < 18) return "下午好";
  if (h < 21) return "傍晚好";
  return "晚上好";
});

function goApp() {
  router.replace("/index/log");
}
</script>

<template>
  <div class="welcome">
    <el-card class="hero" shadow="never">
      <div class="hero__badge">{{ greeting }}</div>
      <h1 class="hero__title">Ehmonitor 告警监控</h1>
      <p class="hero__subtitle">统一查看告警概览、规则与静默配置</p>
      <el-button type="primary" size="large" round @click="goApp">进入监控</el-button>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.welcome {
  max-width: 640px;
  margin: 0 auto;
  padding: 24px 16px 32px;
}

.hero {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid var(--el-border-color);
  background:
    linear-gradient(135deg, var(--el-color-primary-light-9), transparent 60%),
    var(--el-bg-color);
  text-align: center;
  padding: 28px 20px 32px;
}

.hero__badge {
  display: inline-block;
  font-size: 12px;
  letter-spacing: 0.08em;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid var(--el-border-color);
  color: var(--el-color-primary);
  background: color-mix(in srgb, var(--el-color-primary) 10%, transparent);
  margin-bottom: 12px;
}

.hero__title {
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 600;
  line-height: 1.35;
}

.hero__subtitle {
  margin: 0 0 20px;
  font-size: 14px;
  color: var(--el-text-color-regular);
}
</style>
