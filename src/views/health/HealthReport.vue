<template>
  <div class="health-report">
    <div class="report-header">
      <h2>健康报告</h2>
      <el-button type="primary" @click="generateReport">
        <el-icon><DocumentAdd /></el-icon>
        生成新报告
      </el-button>
    </div>

    <!-- 健康评分卡片 -->
    <el-card class="health-score-card">
      <div class="score-content">
        <div class="score-circle">
          <el-progress
              type="dashboard"
              :percentage="healthScore"
              :color="scoreColors"
              :width="120"
          >
            <template #default="{ percentage }">
              <div class="score-value">
                <span class="number">{{ percentage }}</span>
                <span class="label">健康评分</span>
              </div>
            </template>
          </el-progress>
        </div>
        <div class="score-details">
          <div class="detail-item" v-for="(score, index) in subScores" :key="index">
            <span class="label">{{ score.label }}</span>
            <el-progress
                :percentage="score.value"
                :color="score.color"
                :stroke-width="8"
                :format="(val) => `${val}分`"
            />
          </div>
        </div>
      </div>
    </el-card>

    <!-- 健康趋势图表 -->
    <div class="trends-section">
      <el-card class="trend-card">
        <template #header>
          <div class="card-header">
            <span>健康指标趋势</span>
            <el-radio-group v-model="selectedMetric" size="small">
              <el-radio-button value="weight">体重</el-radio-button>
              <el-radio-button value="sleep">睡眠</el-radio-button>
              <el-radio-button value="steps">步数</el-radio-button>
              <el-radio-button value="heartRate">心率</el-radio-button>
            </el-radio-group>
          </div>
        </template>
        <div class="chart-container" ref="trendChartRef"></div>
      </el-card>
    </div>

    <!-- 健康建议 -->
    <el-card class="suggestions-card">
      <template #header>
        <div class="card-header">
          <span>健康建议</span>
          <el-tag type="success">已更新</el-tag>
        </div>
      </template>
      <div class="suggestions-content">
        <div v-for="(suggestion, index) in healthSuggestions" :key="index" class="suggestion-item">
          <el-alert
              :title="suggestion.title"
              :type="suggestion.type"
              :description="suggestion.content"
              :closable="false"
              show-icon
          />
        </div>
      </div>
    </el-card>

    <!-- 生成报告对话框 -->
    <el-dialog
        v-model="dialogVisible"
        title="生成健康报告"
        width="500px"
    >
      <el-form :model="reportForm" label-width="100px">
        <el-form-item label="报告类型">
          <el-select v-model="reportForm.type" placeholder="请选择报告类型">
            <el-option label="周度报告" value="weekly" />
            <el-option label="月度报告" value="monthly" />
            <el-option label="年度报告" value="yearly" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
              v-model="reportForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
          />
        </el-form-item>
        <el-form-item label="包含指标">
          <el-checkbox-group v-model="reportForm.metrics">
            <el-checkbox label="weight">体重变化</el-checkbox>
            <el-checkbox label="sleep">睡眠质量</el-checkbox>
            <el-checkbox label="exercise">运动记录</el-checkbox>
            <el-checkbox label="diet">饮食分析</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleGenerateReport">
            生成报告
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { DocumentAdd } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import {ElMessage} from "element-plus";

// 健康评分
const healthScore = ref(85)
const scoreColors = [
  { color: '#f56c6c', percentage: 60 },
  { color: '#e6a23c', percentage: 75 },
  { color: '#67c23a', percentage: 90 }
]

// 子项评分
const subScores = ref([
  { label: '运动指数', value: 88, color: '#67c23a' },
  { label: '睡眠质量', value: 82, color: '#409eff' },
  { label: '饮食健康', value: 75, color: '#e6a23c' },
  { label: '身体状况', value: 90, color: '#67c23a' }
])

// 趋势图表
const trendChartRef = ref(null)
const selectedMetric = ref('weight')
let trendChart = null

// 健康建议
const healthSuggestions = ref([
  {
    title: '运动建议',
    type: 'success',
    content: '您的运动频率达标，建议继续保持每周4-5次的运动频率，可以适当增加有氧运动的强度。'
  },
  {
    title: '睡眠建议',
    type: 'warning',
    content: '您的平均睡眠时间略低于建议值，建议调整作息时间，保证每天7-8小时的睡眠时间。'
  },
  {
    title: '饮食建议',
    type: 'info',
    content: '根据您的饮食记录，蛋白质摄入略低，建议适当增加优质蛋白的摄入，如瘦肉、鱼类、蛋类等。'
  }
])

// 对话框控制
const dialogVisible = ref(false)
const reportForm = ref({
  type: 'weekly',
  dateRange: [],
  metrics: ['weight', 'sleep', 'exercise']
})

// 生成报告
const generateReport = () => {
  dialogVisible.value = true
}

const handleGenerateReport = () => {
  // 这里添加生成报告的逻辑
  dialogVisible.value = false
  ElMessage({
    type: 'success',
    message: '报告生成成功！'
  })
}

// 初始化趋势图表
const initTrendChart = () => {
  if (!trendChartRef.value) return

  trendChart = echarts.init(trendChartRef.value)
  const option = {
    grid: {
      top: 40,
      right: 20,
      bottom: 40,
      left: 50,
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      boundaryGap: false
    },
    yAxis: {
      type: 'value',
      name: '数值'
    },
    series: [{
      data: [68.5, 68.2, 68.3, 68.1, 67.9, 67.8, 67.7],
      type: 'line',
      smooth: true,
      lineStyle: {
        color: '#409EFF',
        width: 2
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0,
            color: 'rgba(64,158,255,0.2)'
          }, {
            offset: 1,
            color: 'rgba(64,158,255,0)'
          }]
        }
      }
    }]
  }
  trendChart.setOption(option)
}

// 监听窗口大小变化
const handleResize = () => {
  trendChart?.resize()
}

onMounted(() => {
  initTrendChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose()
})
</script>

<style scoped>
.health-report {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.health-score-card {
  margin-bottom: 20px;
}

.score-content {
  display: flex;
  align-items: center;
  gap: 40px;
  padding: 20px;
}

.score-circle {
  flex-shrink: 0;
}

.score-value {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.score-value .number {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.score-value .label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.score-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.detail-item .label {
  width: 80px;
  color: #606266;
}

.trends-section {
  margin-bottom: 20px;
}

.trend-card {
  margin-bottom: 20px;
}

.chart-container {
  height: 300px;
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.suggestions-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .score-content {
    flex-direction: column;
    align-items: center;
  }

  .score-details {
    width: 100%;
  }
}
</style>