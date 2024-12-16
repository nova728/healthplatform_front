<template>
  <div class="daily-nutrition" v-loading="loading">
    <h3>今日营养摄入概览</h3>
    <div class="nutrition-grid" v-if="nutritionData">
      <div class="nutrition-item">
        <span class="label">热量</span>
        <span class="value">{{ totalCalories }}kcal</span>
        <el-progress 
          :percentage="nutritionData.caloriesPercentage" 
          :color="getProgressColor(nutritionData.caloriesPercentage)"
        />
        <span class="recommended">目标: {{ nutritionData.recommendedCalories }}kcal</span>
      </div>
      
      <div class="nutrition-item">
        <span class="label">碳水化合物</span>
        <span class="value">{{ totalCarbs }}g</span>
        <el-progress 
          :percentage="nutritionData.carbsPercentage"
          :color="getProgressColor(nutritionData.carbsPercentage)"
        />
        <span class="recommended">目标: {{ nutritionData.recommendedCarbs }}g</span>
      </div>
      
      <div class="nutrition-item">
        <span class="label">蛋白质</span>
        <span class="value">{{ totalProtein }}g</span>
        <el-progress 
          :percentage="nutritionData.proteinPercentage"
          :color="getProgressColor(nutritionData.proteinPercentage)"
        />
        <span class="recommended">目标: {{ nutritionData.recommendedProtein }}g</span>
      </div>
      
      <div class="nutrition-item">
        <span class="label">脂肪</span>
        <span class="value">{{ totalFat }}g</span>
        <el-progress 
          :percentage="nutritionData.fatPercentage"
          :color="getProgressColor(nutritionData.fatPercentage)"
        />
        <span class="recommended">目标: {{ nutritionData.recommendedFat }}g</span>
      </div>
    </div>
    <div v-else class="no-data">暂无数据</div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { getDailyNutrition } from '@/api/diet'
import { ElMessage } from 'element-plus'

const props = defineProps({
  userId: {
    type: [Number, String],
    required: true
  },
  date: {
    type: String,
    default: () => new Date().toISOString().split('T')[0]
  }
})

// 先声明所有响应式变量
const loading = ref(false)
const mounted = ref(false)
const nutritionData = ref(null)
const totalCalories = ref(0)
const totalCarbs = ref(0)
const totalProtein = ref(0)
const totalFat = ref(0)

// 工具函数
const getProgressColor = (percentage) => {
  if (percentage < 80) return '#67C23A'
  if (percentage < 100) return '#E6A23C'
  return '#F56C6C'
}

// 数据获取函数
const fetchNutritionData = async () => {
  if (!props.userId) {
    console.warn('No userId provided')
    return
  }
  
  loading.value = true
  try {
    const { data } = await getDailyNutrition(props.userId, props.date)
    
    if (data) {
      nutritionData.value = data
      // 确保数据格式化和默认值处理
      totalCalories.value = data.totalCalories ? Number(data.totalCalories).toFixed(1) : '0.0'
      totalCarbs.value = data.totalCarbs ? Number(data.totalCarbs).toFixed(1) : '0.0'
      totalProtein.value = data.totalProtein ? Number(data.totalProtein).toFixed(1) : '0.0'
      totalFat.value = data.totalFat ? Number(data.totalFat).toFixed(1) : '0.0'
    } else {
      // 重置数据
      nutritionData.value = null
      totalCalories.value = '0.0'
      totalCarbs.value = '0.0'
      totalProtein.value = '0.0'
      totalFat.value = '0.0'
    }
  } catch (error) {
    console.error('获取营养摄入数据失败:', error)
    ElMessage.error('获取营养摄入数据失败')
  } finally {
    loading.value = false
  }
}


// 生命周期钩子
onMounted(() => {
  mounted.value = true
  fetchNutritionData()
})

onUnmounted(() => {
  mounted.value = false
})

// 暴露方法供父组件调用
defineExpose({
  fetchNutritionData
})

// 监听日期变化
watch(() => props.date, (newDate) => {
  if (newDate && mounted.value) {
    fetchNutritionData()
  }
})
</script>

<style scoped>
.daily-nutrition {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.nutrition-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-top: 20px;
}

.nutrition-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.label {
  color: #606266;
  font-size: 14px;
}

.value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.recommended {
  color: #909399;
  font-size: 12px;
}

:deep(.el-progress) {
  width: 100%;
}
</style>