<template>
  <div class="report-history">
    <div class="filter-section">
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        :shortcuts="shortcuts"
        @change="handleDateChange"
      />
    </div>

    <el-table
      v-loading="loading"
      :data="reports"
      style="width: 100%"
    >
      <el-table-column prop="reportTime" label="报告时间" width="180">
        <template #default="scope">
          {{ formatDateTime(scope.row.reportTime) }}
        </template>
      </el-table-column>
      <el-table-column prop="overallScore" label="健康评分" width="100">
        <template #default="scope">
          <el-tag :type="getScoreType(scope.row.overallScore)">
            {{ scope.row.overallScore }}分
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="bmiStatus" label="BMI状态" width="120">
        <template #default="scope">
          <el-tag :type="getBmiStatusType(scope.row.bmiStatus)">
            {{ scope.row.bmiStatus }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="bloodPressureStatus" label="血压状态" width="120">
        <template #default="scope">
          <el-tag :type="getBloodPressureType(scope.row.bloodPressureStatus)">
            {{ scope.row.bloodPressureStatus }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="heartRateStatus" label="心率状态" width="120">
        <template #default="scope">
          <el-tag :type="getHeartRateType(scope.row.heartRateStatus)">
            {{ scope.row.heartRateStatus }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="sleepQuality" label="睡眠质量" width="120">
        <template #default="scope">
          <el-tag :type="getSleepQualityType(scope.row.sleepQuality)">
            {{ scope.row.sleepQuality }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120">
        <template #default="scope">
          <el-button type="primary" link @click="viewReport(scope.row)">
            查看详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="dialogVisible"
      title="健康报告详情"
      width="70%"
    >
      <report-detail v-if="selectedReport" :report="selectedReport" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useStore } from 'vuex'
import { getReportHistory } from '@/api/healthReport'
import { formatDateTime } from '@/utils/date'
import ReportDetail from './ReportDetail.vue'

const store = useStore()
const reports = ref([])
const loading = ref(false)
const dateRange = ref(null)
const dialogVisible = ref(false)
const selectedReport = ref(null)
const currentUserId = computed(() => store.state.user?.id)

// 添加 refresh 方法
const refresh = () => {
  fetchReports()
}

// 暴露方法给父组件
defineExpose({
  refresh
})

// 获取报告历史
const fetchReports = async () => {
  if (!currentUserId.value) {
    ElMessage.error('用户未登录')
    return
  }
  
  loading.value = true
  try {
    const [startDate, endDate] = dateRange.value || [
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      new Date()
    ]
    
    const response = await getReportHistory(
      currentUserId.value,
      startDate.toISOString(),
      endDate.toISOString()
    )
    
    if (response?.data) {
      reports.value = response.data
    }
  } catch (error) {
    console.error('获取报告历史失败:', error)
    ElMessage.error('获取报告历史失败')
  } finally {
    loading.value = false
  }
}

const handleDateChange = () => {
  fetchReports()
}

const viewReport = (report) => {
  selectedReport.value = report
  dialogVisible.value = true
}

// 状态类型判断函数
const getScoreType = (score) => {
  if (score >= 90) return 'success'
  if (score >= 75) return 'warning'
  return 'danger'
}

const getBmiStatusType = (status) => {
  switch (status) {
    case '正常': return 'success'
    case '偏瘦': return 'warning'
    case '超重':
    case '肥胖': return 'danger'
    default: return 'info'
  }
}

const getBloodPressureType = (status) => {
  switch (status) {
    case '正常': return 'success'
    case '低血压':
    case '高血压': return 'danger'
    default: return 'warning'
  }
}

const getHeartRateType = (status) => {
  switch (status) {
    case '正常': return 'success'
    case '偏高':
    case '偏低': return 'warning'
    default: return 'info'
  }
}

const getSleepQualityType = (quality) => {
  switch (quality) {
    case '优': return 'success'
    case '良': return ''
    case '中': return 'warning'
    case '差': return 'danger'
    default: return 'info'
  }
}

const shortcuts = [
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
    text: '最近一月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  }
]

onMounted(() => {
  fetchReports()
})
</script>

<style lang="scss" scoped>
.report-history {
  .filter-section {
    margin-bottom: 20px;
  }
  
  .el-tag {
    margin-right: 5px;
  }
}
</style>