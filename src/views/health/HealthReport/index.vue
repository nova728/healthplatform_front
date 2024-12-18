<template>
  <div class="health-report-container">
    <el-tabs v-model="activeTab" class="demo-tabs">
      <el-tab-pane label="健康概览" name="overview">
        <health-overview :report="latestReport" @refresh="fetchLatestReport"/>
      </el-tab-pane>
      <el-tab-pane label="详细指标" name="details">
        <health-metrics :report="latestReport"/>
      </el-tab-pane>
      <el-tab-pane label="历史报告" name="history">
        <health-report-history/>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import { getLatestReport } from '@/api/healthReport'
import HealthOverview from './components/HealthOverview.vue'
import HealthMetrics from './components/HealthMetrics.vue'
import HealthReportHistory from './components/HealthReportHistory.vue'

const store = useStore()
const activeTab = ref('overview')
const loading = ref(false)
const currentUserId = computed(() => store.state.user?.id)
const latestReport = ref({})
const historyRef = ref(null)

// 添加刷新处理方法
const handleRefresh = async () => {
  await fetchLatestReport()
  // 如果历史记录组件存在，则刷新历史记录
  if (historyRef.value) {
    historyRef.value.refresh()
  }
}

const fetchLatestReport = async () => {
  if (!currentUserId.value) {
    ElMessage.error('用户未登录')
    return
  }
  
  loading.value = true
  try {
    const response = await getLatestReport(currentUserId.value)
    if (response?.data) {
      latestReport.value = response.data
    } else {
      latestReport.value = {}
      ElMessage.warning('暂无报告数据')
    }
  } catch (error) {
    console.error('获取最新报告失败:', error)
    ElMessage.error('获取报告失败')
    latestReport.value = {}
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchLatestReport()
})
</script>

<style lang="scss" scoped>
.health-report-container {
  padding: 20px;
}
</style>