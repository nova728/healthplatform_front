<template>
  <div class="nutrition-calendar">
    <h3>营养摄入日历</h3>
    <el-calendar v-model="currentDate">
      <template #dateCell="{ data }">
        <div class="calendar-cell" @click="showDayDetail(data)">
          <!-- 日期显示 -->
          <span class="date-number">{{ data.day.split('-').slice(2).join('') }}</span>
          
          <!-- 营养进度指示器 -->
          <div class="nutrition-indicators" v-if="getDayNutrition(data)">
            <el-tooltip 
              :content="`热量完成度: ${getNutritionPercentage(data, 'calories')}%`" 
              placement="top"
            >
              <div class="indicator-ring">
                <el-progress 
                  type="circle" 
                  :percentage="getNutritionPercentage(data, 'calories')"
                  :width="20"
                  :stroke-width="3"
                  :show-text="false"
                  :color="getProgressColor"
                />
              </div>
            </el-tooltip>
          </div>
        </div>
      </template>
    </el-calendar>

    <!-- 日详情对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="selectedDate"
      width="30%"
    >
      <div v-if="selectedDayNutrition" class="day-detail">
        <div class="nutrition-item">
          <span class="label">热量</span>
          <el-progress 
            :percentage="selectedDayNutrition.caloriesPercentage" 
            :color="getProgressColor"
          />
          <span class="value">{{ selectedDayNutrition.totalCalories }}kcal</span>
        </div>
        
        <div class="nutrition-item">
          <span class="label">碳水</span>
          <el-progress 
            :percentage="selectedDayNutrition.carbsPercentage"
            :color="getProgressColor"
          />
          <span class="value">{{ selectedDayNutrition.totalCarbs }}g</span>
        </div>
        
        <div class="nutrition-item">
          <span class="label">蛋白质</span>
          <el-progress 
            :percentage="selectedDayNutrition.proteinPercentage"
            :color="getProgressColor"
          />
          <span class="value">{{ selectedDayNutrition.totalProtein }}g</span>
        </div>
        
        <div class="nutrition-item">
          <span class="label">脂肪</span>
          <el-progress 
            :percentage="selectedDayNutrition.fatPercentage"
            :color="getProgressColor"
          />
          <span class="value">{{ selectedDayNutrition.totalFat }}g</span>
        </div>
      </div>
      <div v-else class="no-data">
        暂无数据
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { getDailyNutrition } from '@/api/diet'
import { ElMessage } from 'element-plus'

const store = useStore()
const currentDate = ref(new Date())
const dialogVisible = ref(false)
const selectedDate = ref('')
const selectedDayNutrition = ref(null)
const nutritionCache = ref({}) // 缓存营养数据

// 获取进度条颜色
const getProgressColor = (percentage) => {
  if (percentage < 80) return '#67C23A'
  if (percentage < 100) return '#E6A23C'
  return '#F56C6C'
}

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

// 获取营养完成百分比
const getNutritionPercentage = (dateData, type) => {
  const nutrition = nutritionCache.value[dateData.day]
  if (!nutrition) return 0
  
  switch(type) {
    case 'calories':
      return Math.round(nutrition.caloriesPercentage || 0)
    case 'carbs':
      return Math.round(nutrition.carbsPercentage || 0)
    case 'protein':
      return Math.round(nutrition.proteinPercentage || 0)
    case 'fat':
      return Math.round(nutrition.fatPercentage || 0)
    default:
      return 0
  }
}

// 显示日详情
const showDayDetail = async (dateData) => {
  selectedDate.value = dateData.day
  selectedDayNutrition.value = await getDayNutrition(dateData)
  dialogVisible.value = true
}
</script>

<style scoped>
.nutrition-calendar {
  height: 100%;
  overflow: auto;
}

.calendar-cell {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  padding: 4px;
}

.date-number {
  margin-bottom: 4px;
}

.nutrition-indicators {
  display: flex;
  gap: 4px;
}

.indicator-ring {
  width: 20px;
  height: 20px;
}

.day-detail {
  padding: 10px;
}

.nutrition-item {
  margin-bottom: 16px;
}

.nutrition-item .label {
  display: inline-block;
  width: 60px;
  margin-right: 10px;
}

.nutrition-item .value {
  margin-left: 10px;
  color: #606266;
}

.no-data {
  text-align: center;
  color: #909399;
  padding: 20px;
}

:deep(.el-calendar-day) {
  height: 80px;
  padding: 4px;
}

:deep(.el-progress-circle) {
  width: 100% !important;
  height: 100% !important;
}
</style>