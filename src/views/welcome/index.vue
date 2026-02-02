<template>
  <div class="welcome">
    <el-row :gutter="16">
      <!-- Hero -->
      <el-col :span="24" class="mb-16">
        <el-card class="hero" shadow="never">
          <div class="hero__badge" aria-hidden="true">{{ greeting }}</div>
          <h1 class="hero__title">
           欢迎使用新域名系统
          </h1>
          <p class="hero__subtitle">
            海量域名与 DNS 统一治理平台
          </p>
        </el-card>
      </el-col>

      <!-- Charts -->
      <el-col :xs="24" :md="12" class="mb-16">
        <el-card shadow="never" class="panel panel-hero chart-card">
          <div class="chart-wrap chart-wrap--single">
            <div ref="domainChartRef" class="chart-canvas" aria-label="域名资产分布统计图"></div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="12" class="mb-16">
        <el-card shadow="never" class="panel panel-hero chart-card">
          <div class="chart-wrap chart-wrap--single">
            <div ref="dnsChartRef" class="chart-canvas" aria-label="DNS托管商分布统计图"></div>
          </div>
        </el-card>
      </el-col>

      <!-- Todos + Quick Actions -->
      <el-col :xs="24" :lg="16" class="mb-16">
        <el-card shadow="never" class="panel panel-hero " style="min-height: 245px;">
          <div class="card-header"><span>待处理事项</span></div>
          <el-divider style="margin: 10px 0;" />
          <el-table :data="pendingTasks" size="small" class="todo-table" :show-header="false" >
            <el-table-column prop="text" label="事项" />
            <el-table-column label="操作" width="120" align="center">
              <template #default="{ row }">
                  <el-icon style="cursor: pointer;" @click="goTo(row.path)"><ArrowRight /></el-icon>

              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="8" class="mb-16">
        <el-card shadow="never" class="panel panel-hero">
          <template #header>
            <div class="card-header"><span>快捷操作</span></div>
          </template>
          <div class="quick-actions">
            <el-button v-for="(a, i) in quickActions"
              :key="i"
              :plain="a.plain"
              size="large"
              round
              class="qa-btn"
              :title="a.title"
              @click="goTo(a.path)"
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
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import echarts from "@/plugins/echarts";
import type { EChartsType } from "echarts/core";
import { useRouter } from "vue-router";
import { ArrowRight } from "@element-plus/icons-vue";
import { getIndexData } from "@/api/index";
import { ElMessage } from "element-plus";

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
  { text: "添加账号", plain: true, title: "添加账号", path: "/account/supplier" },
  { text: "域名管理", plain: true, title: "域名管理", path: "/domain" },
  { text: "操作日志", plain: true, title: "操作日志", path: "/auditlog/list" },
];

const router = useRouter();

const domainChartRef = ref<HTMLDivElement | null>(null);
const dnsChartRef = ref<HTMLDivElement | null>(null);
let domainChart: EChartsType | null = null;
let dnsChart: EChartsType | null = null;

const goTo = (path: string) => {
  if (!path) return;
  router.push(path);
};

const domainAssets = ref([
  { name: "godaddy账号1", count: 1},
  { name: "godaddy账号2", count: 2},
  { name: "godaddy账号3", count: 3},
  { name: "Name账号1", count: 1},
  { name: "Name账号2", count: 1},
  { name: "Name账号3", count: 3},
]);

const dnsProviders = ref([
  { name: "阿里云", count: 1, },
  { name: "Cloudflare", count: 1 },
  { name: "dns.com", count: 1},
]);

const pendingTasks = ref([
  { text: "example.com 将于14天过期", path: "/domain" },
  { text: "spencer.com 将于30天过期", path: "/domain" },
  { text: "test.com 将于30天过期", path: "/domain" },
  { text: "test.com 将于30天过期", path: "/domain" },
  { text: "test.com 将于30天过期", path: "/domain" },
  { text: "test.com 将于30天过期", path: "/domain" },
  { text: "test.com 将于30天过期", path: "/domain" },
  { text: "test.com 将于30天过期", path: "/domain" },
  { text: "test.com 将于30天过期", path: "/domain" },
  { text: "test.com 将于30天过期", path: "/domain" },
  { text: "test.com 将于30天过期", path: "/domain" },
  { text: "test.com 将于30天过期", path: "/domain" },
]);

const getHeroBackground = () => {
  const styles = getComputedStyle(document.documentElement);
  const primaryLight = styles.getPropertyValue("--el-color-primary-light-9").trim() || "#edf4ff";
  const bgColor = styles.getPropertyValue("--el-bg-color").trim() || "#ffffff";
  return new echarts.graphic.LinearGradient(0, 0, 1, 1, [
    { offset: 0, color: primaryLight },
    { offset: 0.6, color: bgColor },
    { offset: 1, color: bgColor }
  ]);
};

const resolveColor = (value: string) => {
  if (!value) return value;
  const match = value.match(/var\((--[^)]+)\)/);
  if (!match) return value;
  return getComputedStyle(document.documentElement).getPropertyValue(match[1]).trim() || value;
};

const getTextColor = () => {
  const styles = getComputedStyle(document.documentElement);
  return styles.getPropertyValue("--el-text-color-regular").trim() || "#606266";
};

const getPieOption = (title: string, items: { name: string; count: number}[]) => ({
  tooltip: { trigger: "item" },
  backgroundColor: "rgba(0, 0, 0, 0)",
  legend: { left: 'left',orient: 'vertical', top: 20,textStyle: { color: getTextColor() }},
  toolbox: {
    show: true,
    feature: {
      mark: {show:true},
      dataView: {show: true, readOnly: false},
      restore: {show: true},
      saveAsImage: {show: true}
    }
  },
  title: {
    text: title,
    left: 'center',
    top: 20,
    textStyle: { color: getTextColor() }
  },
  series: [
    {
      name: title,
      type: 'pie',
      radius: '55%',
      center: ['60%', '60%'],
      data: items.map(item => ({ value: item.count, name: item.name })),
      roseType: 'radius',
      label: {
        show: true,
        formatter: '{b}: {c}',
        color: getTextColor(),
        textStyle: { color: getTextColor() }
      },
      labelLine: {
        lineStyle: {
          color: getTextColor()
        },
        smooth: 0.2,
        length: 10,
        length2: 20
      },
      animationType: 'scale',
      animationEasing: 'elasticOut',
      animationDelay: function (idx) {
        return Math.random() * 200;
      }
    }
  ]
});



const resizeCharts = () => {
  domainChart?.resize();
  dnsChart?.resize();
};

onMounted(() => {
  fetchData();
  
  window.addEventListener("resize", resizeCharts);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", resizeCharts);
  domainChart?.dispose();
  dnsChart?.dispose();
  domainChart = null;
  dnsChart = null;
});

const initCharts = () => {
  if (domainChartRef.value) {
    domainChart = echarts.init(domainChartRef.value);
    domainChart.setOption(getPieOption("域名资产分布", domainAssets.value));
  }
  if (dnsChartRef.value) {
    dnsChart = echarts.init(dnsChartRef.value);
    dnsChart.setOption(getPieOption("DNS托管商分布", dnsProviders.value));
  }
};

function fetchData() {
  getIndexData()
    .then((resp: any) => {
      if (resp.code === 200) {
        pendingTasks.value = [];
        resp.padding_task_data.forEach(item => {
          pendingTasks.value.push({
            text: item.domain + " 将于 " + item.available_days + " 天后过期",
            path: "/domain"
          });
        });
        domainAssets.value = [];
        resp.supplier_data.forEach(item => {
          domainAssets.value.push({
            name: item.supplier_account,
            count: item.count
          });
        });
        dnsProviders.value = [];
        resp.custodian_data.forEach(item => {
          dnsProviders.value.push({
            name: item.custodian_account,
            count: item.count
          });
        });
        initCharts();
      } else {
        ElMessage({ type: "error", message: resp.msg || "获取首页数据失败" });
      }
    })
    .catch((error) => {
      console.error("Error fetching domain data:", error);
      ElMessage({ type: "error", message: "获取首页数据失败" });
    })
}

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
    font-size: 20px;
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
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 6px 0;
  }

  strong {
    margin-left: auto;
    font-weight: 600;
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

.panel-hero {
  background:
    linear-gradient(135deg, var(--el-color-primary-light-9), transparent 60%),
    var(--el-bg-color);
}

.quick-actions {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;

  .qa-btn {
    width: 100%;
    justify-content: center;
  }

  .qa-btn + .qa-btn {
    margin-left: 0;
  }
}

/* ---------- Charts ---------- */
.card-header--center {
  justify-content: center;
}

.chart-card {
  min-height: 300px;
}

.chart-wrap {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 20px;
  min-height: 280px;
}

.chart-wrap--single {
  grid-template-columns: 1fr;
  gap: 0;
}

.chart-legend {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 8px;

  li {
    display: grid;
    grid-template-columns: 12px 1fr auto;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    border-radius: 8px;
    border: 1px solid var(--el-border-color);
    background: var(--el-bg-color);
  }
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.legend-text {
  font-size: 13px;
  color: var(--el-text-color-regular);
}

.legend-count {
  font-weight: 600;
}

.chart-canvas {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
  background: transparent;
}

/* ---------- Todo ---------- */
.todo-table {
  width: 100%;
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: transparent;
}

.todo-btn {
  border-radius: 8px;
}

:deep(.todo-table .el-table__inner-wrapper),
:deep(.todo-table .el-table__body-wrapper),
:deep(.todo-table .el-table__header-wrapper),
:deep(.todo-table .el-table__body),
:deep(.todo-table .el-table__header) {
  background: transparent;
}

:deep(.todo-table .el-table__row),
:deep(.todo-table .el-table__cell) {
  background: transparent;
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

