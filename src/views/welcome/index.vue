<template>
  <div class="welcome">
    <el-row :gutter="16">
      <!-- Hero -->
      <el-col :span="24" class="mb-16">
        <el-card class="hero" shadow="never">
          <div class="hero__badge" aria-hidden="true">欢迎使用</div>
          <h1 class="hero__title">
            {{ greeting }}，企业控制台
          </h1>
          <p class="hero__subtitle">
            覆盖域名管理、解析记录、账号体系与操作审计的一体化平台。
          </p>
          <div class="hero__cta">
            <el-button type="primary" size="large">开始使用</el-button>
            <el-button size="large">查看文档</el-button>
          </div>
        </el-card>
      </el-col>

      <!-- Overview / Guide / Status -->
      <el-col :xs="24" :md="8" class="mb-16">
        <el-card class="pill-card" shadow="never">
          <div class="pill-card__title">关键概览</div>
          <ul class="pill-list">
            <li><span>域名总数</span><strong>-</strong></li>
            <li><span>解析记录</span><strong>-</strong></li>
            <li><span>账号数量</span><strong>-</strong></li>
          </ul>
          <el-divider />
          <div class="note">后续将接入实时数据，展示域名、解析与账号的核心指标。</div>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="8" class="mb-16">
        <el-card class="pill-card" shadow="never">
          <div class="pill-card__title">快速指引</div>
          <ol class="guide-list">
            <li>维护供应商与托管商账号，打通管理入口。</li>
            <li>新增域名并配置解析记录，保障业务可用。</li>
            <li>通过操作日志进行审计与追溯，确保合规。</li>
          </ol>
          <el-divider />
          <div class="note">建议结合权限与流程进行分工管理。</div>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="8" class="mb-16">
        <el-card class="pill-card" shadow="never">
          <div class="pill-card__title">系统状态</div>
          <div class="status-wrap">
            <div class="status-item">
              <span>可用性</span>
              <el-progress :percentage="100" :stroke-width="10" :show-text="false" />
            </div>
            <div class="status-item">
              <span>延迟</span>
              <el-tag type="success">正常</el-tag>
            </div>
            <div class="status-item">
              <span>告警</span>
              <el-tag type="info">无</el-tag>
            </div>
          </div>
          <el-divider />
          <div class="note">实时数据接入后将自动更新系统状态。</div>
        </el-card>
      </el-col>

      <!-- Announcements + Quick Actions -->
      <el-col :xs="24" :lg="16" class="mb-16">
        <el-card shadow="never" class="panel">
          <template #header>
            <div class="card-header"><span>平台公告</span></div>
          </template>
          <template v-if="timeline.length">
            <el-timeline>
              <el-timeline-item
                v-for="(tItem, i) in timeline"
                :key="i"
                :timestamp="tItem.time"
                placement="top"
              >
                <p class="timeline-text">{{ tItem.text }}</p>
              </el-timeline-item>
            </el-timeline>
          </template>
          <el-empty v-else description="暂无公告" />
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="8" class="mb-16">
        <el-card shadow="never" class="panel">
          <template #header>
            <div class="card-header"><span>快速操作</span></div>
          </template>
          <div class="quick-actions">
            <el-button v-for="(a, i) in quickActions"
              :key="i"
              :plain="a.plain"
              size="large"
              round
              class="qa-btn"
              :title="a.title"
            >
              {{ a.text }}
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>


<script setup lang="ts">
import { computed } from "vue";

/** Greeting based on time */
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

/** Quick actions - Chinese only */
const quickActions = [
  { text: "域名管理", plain: true, title: "域名管理" },
  { text: "解析记录", plain: true, title: "解析记录" },
  { text: "供应商账号", plain: true, title: "供应商账号" },
  { text: "托管商账号", plain: true, title: "托管商账号" }
];

/** Timeline - Already Chinese */
const timeline = [
  { time: "2025-09-20", text: "平台升级至 v2.5.0，提升可观测与告警联动能力。" },
  { time: "2025-09-15", text: "新增多云账号接入向导，支持更精细的权限模型。" },
  { time: "2025-09-01", text: "欢迎使用本平台，祝工作顺利。" }
];
</script>

<style lang="scss" scoped>
.welcome {
  padding-bottom: 8px;
}

.mb-16 {
  margin-bottom: 16px;
}

/* ---------- Hero ---------- */
.hero {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid var(--el-border-color);
  background:
    linear-gradient(135deg, var(--el-color-primary-light-9), transparent 60%),
    var(--el-bg-color);
  padding: 28px 24px;

  &__badge {
    display: inline-block;
    font-size: 12px;
    letter-spacing: 0.08em;
    padding: 4px 10px;
    border-radius: 999px;
    border: 1px solid var(--el-border-color);
    color: var(--el-color-primary);
    background: color-mix(in srgb, var(--el-color-primary) 10%, transparent);
    margin-bottom: 8px;
  }

  &__title {
    margin: 6px 0 4px;
    font-size: 22px;
    font-weight: 600;
    line-height: 1.35;
  }

  &__subtitle {
    margin: 0 0 16px;
    font-size: 14px;
    color: var(--el-text-color-regular);
  }

  &__cta {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
}

/* ---------- Card header ---------- */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 500;
}

/* ---------- Capsule cards ---------- */
.pill-card {
  border-radius: 12px;
  border: 1px solid var(--el-border-color);
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--el-color-primary) 6%, transparent), transparent 60%),
    var(--el-bg-color);

  &__title {
    font-weight: 600;
    margin-bottom: 10px;
  }
}

.pill-list {
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 0;

    span {
      color: var(--el-text-color-regular);
    }
    strong {
      font-weight: 600;
    }
  }
}

.guide-list {
  padding-left: 18px;
  margin: 0;

  li {
    padding: 6px 0;
  }
}

.note {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

/* ---------- Status ---------- */
.status-wrap {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  .status-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}

/* ---------- Panels ---------- */
.panel {
  border-radius: 12px;
  border: 1px solid var(--el-border-color);
}

.timeline-text {
  font-size: 13px;
  color: var(--el-text-color-regular);
}

.quick-actions {
  display: grid;
  // grid-template-columns: 1fr 1fr;
  gap: 12px;

  .qa-btn {
    width: 100%;
    justify-content: center;
  }
}

/* ---------- Global tweak ---------- */
:deep(.el-card) {
  --el-card-border-color: transparent;
}

/* Dark mode fine-tune */
@media (prefers-color-scheme: dark) {
  .hero {
    background:
      linear-gradient(135deg, color-mix(in srgb, var(--el-color-primary) 18%, transparent), transparent 60%),
      var(--el-bg-color);
  }
}
</style>

