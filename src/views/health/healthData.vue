<template>
  <div class="health-data">
    <h2>健康数据</h2>
    <div class="data-grid">
      <!-- 心率模块 -->
      <div class="data-card large" @click="navigateTo('heart-rate')">
        <div class="card-header">
          <HeartPulseIcon class="card-icon" />
          <span>心率</span>
        </div>
        <div class="card-content">
          <div class="current-value">{{latestHealthData.heartRate}}</div>
          <div class="unit">BPM</div>
          <div class="chart">
            <div ref="chartRef" style="width: 100%; height: 100%"></div>
          </div>
        </div>
      </div>

      <!-- 睡眠模块 -->
      <div class="data-card medium" @click="navigateTo('sleep')">
        <div class="card-header">
          <MoonIcon class="card-icon" />
          <span>睡眠</span>
        </div>
        <div class="card-content">
          <div class="sleep-stats">
            <div class="sleep-duration">{{ formatSleepDuration }}</div>
            <div class="sleep-quality">{{latestHealthData.sleepQuality}}</div>
          </div>
          <div class="sleep-chart">
            <div class="sleep-phases">
              <div class="deep" style="width: 30%"></div>
              <div class="light" style="width: 45%"></div>
              <div class="rem" style="width: 25%"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 步数模块 -->
      <div class="data-card medium" @click="navigateTo('steps')">
        <div class="card-header">
          <FootprintsIcon class="card-icon" />
          <span>步数</span>
        </div>
        <div class="card-content">
          <div class="steps-count">{{latestHealthData.steps}}</div>
          <div class="steps-progress">
            <el-progress
                :percentage="71"
                :format="() => '目标 12,000'"
                :stroke-width="10"
            />
          </div>
        </div>
      </div>

      <!-- 血压模块 -->
      <div class="data-card medium" @click="navigateTo('blood-pressure')">
        <div class="card-header">
          <ActivityIcon class="card-icon" />
          <span>血压</span>
        </div>
        <div class="card-content">
          <div class="bp-values">
            <span class="systolic">{{latestHealthData.bloodPressureSystolic}}</span>
            <span class="separator">/</span>
            <span class="diastolic">{{latestHealthData.bloodPressureDiastolic}}</span>
            <span class="unit">mmHg</span>
          </div>
          <div class="status normal">正常</div>
        </div>
      </div>

      <!-- 体重模块 -->
      <div class="data-card small" @click="navigateTo('weight')">
        <div class="card-header">
          <ScaleIcon class="card-icon" />
          <span>体重</span>
        </div>
        <div class="card-content">
          <!-- 体重模块 -->
          <div class="weight-value">{{ latestHealthData.weight }}</div>
          <div class="unit">kg</div>
        </div>
      </div>

      <!-- BMI模块 -->
      <div class="data-card small" @click="navigateTo('bmi')">
        <div class="card-header">
          <ActivitySquareIcon class="card-icon" />
          <span>BMI</span>
        </div>
        <div class="card-content">
          <div class="bmi-value">{{latestHealthData.bmi}}</div>
          <div class="status normal">正常</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick , computed} from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import axios from 'axios'
import { useStore } from 'vuex'

import {
  HeartPulse as HeartPulseIcon,
  Moon as MoonIcon,
  Footprints as FootprintsIcon,
  Activity as ActivityIcon,
  Scale as ScaleIcon,
  ActivitySquare as ActivitySquareIcon
} from 'lucide-vue-next'

const store = useStore()
const router = useRouter()
const healthDataHistory = ref([])
const loading = ref(false)
const error = ref(null)
const chartRef = ref(null)
let myChart = null
let resizeHandler = null
const healthData = ref({
  heartRate: 0,
  sleepDuration: 0,
  sleepQuality: '-',
  steps: 0,
  bloodPressureSystolic: 0,
  bloodPressureDiastolic: 0,
  weight: 0,
  bmi: 0
})

//睡眠时间小数->小时制
const formatSleepDuration = computed(() => {
  const duration = latestHealthData.value.sleepDuration
  if (!duration) return '0小时0分'

  const hours = Math.floor(duration)
  const minutes = Math.round((duration - hours) * 60)

  return `${hours}小时${minutes}分`
})

// 计算最新的健康数据
const latestHealthData = computed(() => {
  if (healthDataHistory.value && healthDataHistory.value.length > 0) {
    return healthDataHistory.value[0] // 最新的数据
  }
  return {
    heartRate: 0,
    sleepDuration: 0,
    sleepQuality: '-',
    steps: 0,
    bloodPressureSystolic: 0,
    bloodPressureDiastolic: 0,
    weight: 0,
    bmi: 0
  }
})

const fetchHealthData = async () => {
  loading.value = true
  error.value = null
  try {
    const userId = store.state.user.id
    console.log('Fetching data for user:', userId)
    const response = await axios.get(`http://localhost:8088/api/health/${userId}/history`)
    console.log('Response:', response)
    if (response.data && Array.isArray(response.data)) {
      healthDataHistory.value = response.data
      console.log('Health data:', healthDataHistory.value)
    } else {
      console.warn('Received empty or invalid data:', response.data)
      healthDataHistory.value = []
    }
  } catch (err) {
    console.error('Error details:', err)
    error.value = '获取健康数据失败: ' + (err.response?.data?.message || err.message)
  } finally {
    loading.value = false
  }
}

// 图表数据
const chartData = [
  { time: '00:00', value: 72 },
  { time: '04:00', value: 68 },
  { time: '08:00', value: 74 },
  { time: '12:00', value: 77 },
  { time: '16:00', value: 75 },
  { time: '20:00', value: 73 }
]

onMounted(async () => {
  await fetchHealthData()
  await nextTick()
  const chartDom = chartRef.value
  console.log('chartDom:', chartDom)
  console.log('echarts:', echarts)
  if (chartDom) {
    console.log('容器尺寸:', chartDom.offsetWidth, chartDom.offsetHeight)
    myChart = echarts.init(chartDom)

    const option = {
      grid: {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10,
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: chartData.map(item => item.time),
        show: false
      },
      yAxis: {
        type: 'value',
        show: false
      },
      series: [{
        data: chartData.map(item => item.value),
        type: 'line',
        smooth: true,
        symbolSize: 0,
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

    // 在这里设置 option
    myChart.setOption(option)

    // 处理窗口大小变化
    resizeHandler = () => {
      myChart?.resize()
    }
    window.addEventListener('resize', resizeHandler)
  }
})

// onUnmounted 钩子移到这里，与 onMounted 同级
onUnmounted(() => {
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler)
  }
  if (myChart) {
    myChart.dispose()
    myChart = null
  }
})
// 处理错误的方法
const handleRetry = () => {
  fetchHealthData()
}


const navigateTo = (route) => {
  router.push(`/healthCenter/${route}`)
}
</script>
<style scoped>
.health-data {
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
  padding-right: 8px;
}

.data-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  padding: 20px;
  min-height: min-content;
}

.health-data::-webkit-scrollbar {
  width: 6px;
}

.data-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
}

.data-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

.data-card.large {
  grid-column: span 2;
  grid-row: span 2;
}

.data-card.medium {
  grid-column: span 1;
  grid-row: span 2;
}

.data-card.small {
  grid-column: span 1;
  grid-row: span 1;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  color: #606266;
}

.card-content {
  height: calc(100% - 40px);
  display: flex;
  flex-direction: column;
}

/* 心率模块样式 */
.current-value {
  font-size: 48px;
  font-weight: 600;
  color: #303133;
}

.unit {
  color: #909399;
  margin-top: 4px;
}

.chart {
  flex: 1;
  margin-top: 20px;
}

/* 睡眠模块样式 */
.sleep-stats {
  text-align: center;
}

.sleep-duration {
  font-size: 32px;
  font-weight: 600;
  color: #303133;
}

.sleep-quality {
  color: #67c23a;
  margin-top: 8px;
}

.sleep-phases {
  display: flex;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 20px;
}

.deep { background: #409EFF; }
.light { background: #67c23a; }
.rem { background: #e6a23c; }

/* 步数模块样式 */
.steps-count {
  font-size: 36px;
  font-weight: 600;
  color: #303133;
  text-align: center;
  margin-bottom: 20px;
}

/* 血压模块样式 */
.bp-values {
  font-size: 32px;
  font-weight: 600;
  color: #303133;
  text-align: center;
}

.separator {
  color: #909399;
  margin: 0 8px;
}

.status {
  text-align: center;
  margin-top: 12px;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 14px;
}

.status.normal {
  background: #f0f9eb;
  color: #67c23a;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  color: #606266;
}

.card-icon {
  width: 24px;
  height: 24px;
  stroke-width: 2;
}

.data-card:hover .card-icon {
  color: #409EFF;
}

.chart {
  flex: 1;
  margin-top: 20px;
  min-height: 200px;
  position: relative; /* 添加这行 */
}

.card-content {
  height: calc(100% - 40px);
  display: flex;
  flex-direction: column;
  min-height: 300px;
}

.data-card.large {
  grid-column: span 2;
  grid-row: span 2;
  min-height: 400px;
}

/* 响应式布局 */
@media (max-width: 1200px) {
  .data-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .data-grid {
    grid-template-columns: 1fr;
  }

  .data-card.large,
  .data-card.medium,
  .data-card.small {
    grid-column: span 1;
    grid-row: span 1;
  }
}
</style>