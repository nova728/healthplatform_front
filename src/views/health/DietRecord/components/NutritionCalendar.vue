<template>
  <div class="nutrition-statistics">
    <!-- 视图切换和时间范围选择 -->
    <div class="controls-section">
      <el-radio-group v-model="currentView" class="view-toggle">
        <el-radio-button label="statistics">统计图表</el-radio-button>
        <el-radio-button label="calendar">日历视图</el-radio-button>
      </el-radio-group>

      <div v-if="currentView === 'statistics'" class="range-selector">
        <el-radio-group v-model="dateRange" size="small">
          <el-radio-button label="week">近一周</el-radio-button>
          <el-radio-button label="month">近一月</el-radio-button>
          <el-radio-button label="halfYear">近半年</el-radio-button>
          <el-radio-button label="year">近一年</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <!-- 统计视图 -->
    <div v-show="currentView === 'statistics'" class="statistics-view">
      <el-tabs v-model="activeNutrient">
        <el-tab-pane label="热量" name="calories">
          <div class="chart">
            <NutritionChart 
              :chart-data="processedChartData"
              :loading="loading"
              unit="kcal"
            />
          </div>
        </el-tab-pane>
        <el-tab-pane label="碳水" name="carbs">
          <div class="chart">
            <NutritionChart 
              :chart-data="carbsChartData"
              :loading="loading"
              unit="g"
            />
          </div>
        </el-tab-pane>
        <el-tab-pane label="蛋白质" name="protein">
          <div class="chart">
            <NutritionChart 
              :chart-data="proteinChartData"
              :loading="loading"
              unit="g"
            />
          </div>
        </el-tab-pane>
        <el-tab-pane label="脂肪" name="fat">
          <div class="chart">
            <NutritionChart 
              :chart-data="fatChartData"
              :loading="loading"
              unit="g"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 日历视图 -->
    <div v-show="currentView === 'calendar'" class="calendar-view">
      <div class="calendar-wrapper">
        <el-calendar v-model="currentDate">
          <template #dateCell="{ data }">
            <div class="calendar-cell">
              <span class="date-number">{{ data.day.split('-').slice(-1)[0] }}</span>
              <div class="nutrition-bars" v-if="nutritionCache[data.day]">
                <div class="nutrition-bar">
                  <span class="label">卡</span>
                  <div class="progress-bar">
                    <div class="progress-fill" 
                      :style="getProgressStyle(nutritionCache[data.day].caloriesPercentage, '#409EFF')">
                    </div>
                  </div>
                </div>
                <div class="nutrition-bar">
                  <span class="label">碳</span>
                  <div class="progress-bar">
                    <div class="progress-fill" 
                      :style="getProgressStyle(nutritionCache[data.day].carbsPercentage, '#67C23A')">
                    </div>
                  </div>
                </div>
                <div class="nutrition-bar">
                  <span class="label">蛋</span>
                  <div class="progress-bar">
                    <div class="progress-fill" 
                      :style="getProgressStyle(nutritionCache[data.day].proteinPercentage, '#E6A23C')">
                    </div>
                  </div>
                </div>
                <div class="nutrition-bar">
                  <span class="label">脂</span>
                  <div class="progress-bar">
                    <div class="progress-fill" 
                      :style="getProgressStyle(nutritionCache[data.day].fatPercentage, '#F56C6C')">
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </el-calendar>
      </div>
    </div>

    <!-- 日详情对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="selectedDate"
      width="30%"
    >
      <DayDetailContent 
        v-if="selectedDayNutrition"
        :nutrition-data="selectedDayNutrition"
      />
      <div v-else class="no-data">
        暂无数据
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useStore } from 'vuex'
import { getDailyNutrition, getNutritionStats } from '@/api/diet'
import NutritionChart from './NutritionChart.vue'
import DayDetailContent from './DayDetailContent.vue'
import { ElMessage } from 'element-plus'

const store = useStore()
const statsData = ref({
  dates: [],
  calories: [],
  carbs: [],
  protein: [],
  fat: [],
  recommendedCalories: [],
  recommendedCarbs: [],
  recommendedProtein: [],
  recommendedFat: []
})
const currentView = ref('statistics')
const dateRange = ref('week')
const activeNutrient = ref('calories')
const currentDate = ref(new Date())
const dialogVisible = ref(false)
const selectedDate = ref('')
const selectedDayNutrition = ref(null)
const nutritionCache = ref({})
const loading = ref(false)

// 获取某天的营养数据
const getDayNutrition = async (dateData) => {
  const dateStr = dateData.day
  if (nutritionCache.value[dateStr]) {
    return nutritionCache.value[dateStr]
  }

  try {
    const userId = store.state.user?.id
    if (!userId) return null

    const response = await getDailyNutrition(userId, dateStr)
    if (response.data) {
      nutritionCache.value[dateStr] = response.data
      return response.data
    }
    return null
  } catch (error) {
    console.error('获取营养数据失败:', error)
    return null
  }
}

// 获取统计数据
const fetchStatisticsData = async () => {
  loading.value = true
  try {
    const userId = store.state.user?.id
    if (!userId) return

    const response = await getNutritionStats(userId, dateRange.value)
    if (response.data) {
      statsData.value = response.data
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
    ElMessage.error('获取统计数据失败')
  } finally {
    loading.value = false
  }
}

// 获取营养完成百分比
const getDayNutritionPercentage = (date, type) => {
  const nutrition = nutritionCache.value[date]
  if (!nutrition) return 0
  
  const percentage = (() => {
    switch(type) {
      case 'calories':
        return (nutrition.totalCalories / nutrition.recommendedCalories) * 100
      case 'carbs':
        return (nutrition.totalCarbs / nutrition.recommendedCarbs) * 100
      case 'protein':
        return (nutrition.totalProtein / nutrition.recommendedProtein) * 100
      case 'fat':
        return (nutrition.totalFat / nutrition.recommendedFat) * 100
      default:
        return 0
    }
  })()
  
  return Math.min(Math.round(percentage), 100)
}

// 缓存每日营养数据
const loadMonthNutrition = async (year, month) => {
  try {
    const userId = store.state.user?.id
    if (!userId) return

    const response = await getNutritionData(userId, year, month)
    
    // 添加数据验证
    if (!response?.data || !Array.isArray(response.data)) {
      console.warn('营养数据格式不正确:', response)
      return
    }

    const monthlyMap = new Map()
    
    // 使用普通循环替代 reduce
    response.data.forEach(item => {
      const monthKey = item.date.substring(0, 7) // YYYY-MM
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, {
          actualSum: 0,
          recommendedSum: 0,
          count: 0
        })
      }
      
      const monthData = monthlyMap.get(monthKey)
      monthData.actualSum += (item.actual || 0)
      monthData.recommendedSum += (item.recommended || 0)
      monthData.count++
    })

    // 转换数据格式
    const processedData = {
      dates: [],
      actual: [],
      recommended: []
    }

    monthlyMap.forEach((value, key) => {
      processedData.dates.push(key)
      processedData.actual.push(value.actualSum / value.count)
      processedData.recommended.push(value.recommendedSum / value.count)
    })

    nutritionData.value = processedData
    
  } catch (error) {
    console.error('加载月度营养数据失败:', error)
    ElMessage.error('加载月度营养数据失败')
  }
}

// 修改图表数据计算
const caloriesChartData = computed(() => ({
  dates: statsData.value.dates || [],
  actual: statsData.value.calories || [],
  recommended: statsData.value.recommendedCalories || []
}))

const carbsChartData = computed(() => ({
  dates: statsData.value.dates || [],
  actual: statsData.value.carbs || [],
  recommended: statsData.value.recommendedCarbs || []
}))

const proteinChartData = computed(() => ({
  dates: statsData.value.dates || [],
  actual: statsData.value.protein || [],
  recommended: statsData.value.recommendedProtein || []
}))

const fatChartData = computed(() => ({
  dates: statsData.value.dates || [],
  actual: statsData.value.fat || [],
  recommended: statsData.value.recommendedFat || []
}))

// 监听日期范围变化
watch(dateRange, () => {
  fetchStatisticsData()
})

// 监听日期变化，加载对应月份的数据
watch(() => currentDate.value, (newDate) => {
  const year = newDate.getFullYear()
  const month = newDate.getMonth() + 1
  loadMonthNutrition(year, month)
})

// 显示日详情
const showDayDetail = async (dateData) => {
  selectedDate.value = dateData.day
  selectedDayNutrition.value = await getDayNutrition(dateData)
  dialogVisible.value = true
}


// 组件挂载时获取数据
onMounted(() => {
  fetchStatisticsData()
})

onMounted(() => {
  const now = new Date()
  loadMonthNutrition(now.getFullYear(), now.getMonth() + 1)
})

// 添加数据处理函数
const processChartData = (data) => {
  if (!data || !data.dates || !data.dates.length) return data

  let processedData = { ...data }
  
  // 根据不同时间范围处理数据
  if (dateRange.value === 'year') {
    // 按月聚合数据
    const monthlyData = aggregateDataByMonth(data)
    processedData = {
      dates: monthlyData.dates,
      actual: monthlyData.actual,
      recommended: monthlyData.recommended
    }
  } else if (dateRange.value === 'halfYear') {
    // 每两周取一个点
    processedData = sampleData(data, 14)
  } else if (dateRange.value === 'month') {
    // 每3天取一个点
    processedData = sampleData(data, 3)
  }
  
  return processedData
}

// 按月聚合数据
const aggregateDataByMonth = (data) => {
  const monthlyMap = new Map()
  
  data.dates.forEach((date, index) => {
    const monthKey = date.substring(0, 7) // 获取年月 (YYYY-MM)
    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, {
        actualSum: 0,
        recommendedSum: 0,
        count: 0
      })
    }
    
    const monthly = monthlyMap.get(monthKey)
    monthly.actualSum += data.actual[index] || 0
    monthly.recommendedSum += data.recommended[index] || 0
    monthly.count++
  })
  
  const sortedMonths = Array.from(monthlyMap.entries()).sort()
  
  return {
    dates: sortedMonths.map(([month]) => month),
    actual: sortedMonths.map(([_, data]) => +(data.actualSum / data.count).toFixed(1)),
    recommended: sortedMonths.map(([_, data]) => +(data.recommendedSum / data.count).toFixed(1))
  }
}

// 数据采样
const sampleData = (data, interval) => {
  const sampled = {
    dates: [],
    actual: [],
    recommended: []
  }
  
  for (let i = 0; i < data.dates.length; i += interval) {
    sampled.dates.push(data.dates[i])
    sampled.actual.push(data.actual[i])
    sampled.recommended.push(data.recommended[i])
  }
  
  return sampled
}

// 处理后的图表数据
const processedChartData = computed(() => {
  return processChartData({
    dates: statsData.value.dates || [],
    actual: statsData.value[activeNutrient.value] || [],
    recommended: statsData.value[`recommended${activeNutrient.value.charAt(0).toUpperCase() + activeNutrient.value.slice(1)}`] || []
  })
})

const getProgressStyle = (percentage, color) => {
  return {
    width: `${Math.min(percentage, 100)}%`,
    backgroundColor: color,
    background: percentage > 100 ? 
      `repeating-linear-gradient(45deg, ${color} 0%, ${color} 10%, ${color}88 10%, ${color}88 20%)` : 
      color
  }
}
</script>

<style scoped>
.nutrition-statistics {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.controls-section {
  padding: 16px;
  border-bottom: 1px solid #EBEEF5;
  flex-shrink: 0;
}

.view-toggle,
.range-selector {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.statistics-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 0 16px;
  min-height: 0;
}

.chart-container {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

:deep(.el-tabs) {
  display: flex;
  flex-direction: column;
  height: 100%;
}

:deep(.el-tabs__header) {
  margin-bottom: 16px;
  flex-shrink: 0; /* 防止压缩 */
}

:deep(.el-tabs__content) {
  flex: 1;
  overflow: hidden;
}

:deep(.el-tab-pane) {
  height: 100%;
}

.chart {
  height: 100%;
  min-height: 0;
}

.calendar-view {
  height: 100%;
}

.date-number {
  font-size: 14px;
  color: #606266;
}

.bar-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.progress-bar-container {
  flex: 1;
  height: 4px;
  position: relative;
}

.progress-bar-background {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: #EBEEF5;
}

.progress-bar-fill {
  position: absolute;
  height: 100%;
  background-color: #409EFF;
  transition: width 0.3s ease;
}

.progress-bar-fill.exceeded {
  background-image: linear-gradient(45deg, #F56C6C 25%, #fab6b6 25%, #fab6b6 50%, #F56C6C 50%, #F56C6C 75%, #fab6b6 75%, #fab6b6);
  background-size: 10px 10px;
}

.calendar-cell {
  height: 100%;
  padding: 4px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.date-number {
  font-size: 12px;
  color: #606266;
}

.nutrition-bars {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nutrition-bar {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 16px;
}

.bar-label {
  width: 16px;
  font-size: 12px;
  color: #909399;
  text-align: center;
}

.bar-wrapper {
  flex: 1;
  height: 4px;
  position: relative;
}

.bar-bg {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: #EBEEF5;
  border-radius: 2px;
}

.bar-fill {
  position: absolute;
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s ease;
}

/* 超出100%时的样式 */
.bar-fill.exceeded {
  background-image: linear-gradient(45deg, 
    rgba(245, 108, 108, 1) 25%, 
    rgba(245, 108, 108, 0.7) 25%, 
    rgba(245, 108, 108, 0.7) 50%, 
    rgba(245, 108, 108, 1) 50%, 
    rgba(245, 108, 108, 1) 75%, 
    rgba(245, 108, 108, 0.7) 75%, 
    rgba(245, 108, 108, 0.7));
  background-size: 10px 10px;
}
</style>