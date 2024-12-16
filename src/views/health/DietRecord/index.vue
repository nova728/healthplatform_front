<template>
  <div class="diet-page">
    <!-- 固定在顶部的营养概览 -->
    <div class="daily-overview">
      <DailyNutrition 
        ref="dailyNutritionRef"
        :userId="store.state.user?.id" 
        :date="selectedDate"
      />
    </div>
    
    <!-- 可滚动的主内容区域 -->
    <div class="scrollable-content">
      <!-- 左侧饮食记录 -->
      <div class="diet-record-section">
        <DietRecord 
          @nutrition-updated="handleNutritionUpdate"
          @date-change="handleDateChange"
        />
      </div>
      
      <!-- 右侧日历 -->
      <div class="right-section">
        <div class="calendar-section">
          <NutritionCalendar />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import DailyNutrition from './components/DailyNutrition.vue'
import DietRecord from './components/DietRecord.vue'
import NutritionCalendar from './components/NutritionCalendar.vue'

const store = useStore()
const dailyNutritionRef = ref(null)
const selectedDate = ref(new Date().toISOString().split('T')[0])

const emit = defineEmits(['date-change', 'nutrition-updated'])

// 处理日期变化
const handleDateChange = (date) => {
  selectedDate.value = date
  emit('date-change', date)
  handleNutritionUpdate()
}

// 处理营养数据更新
const handleNutritionUpdate = async () => {
  try {
    if (dailyNutritionRef.value?.fetchNutritionData) {
      await dailyNutritionRef.value.fetchNutritionData()
    }
  } catch (error) {
    console.error('更新营养数据失败:', error)
  }
}

onMounted(() => {
  // 组件挂载后初始化数据
  handleNutritionUpdate()
})
</script>

<style scoped>
.diet-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.daily-overview {
  flex-shrink: 0;
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.scrollable-content {
  flex: 1;
  display: flex;
  gap: 20px;
  overflow: hidden;
  min-height: 0; /* 重要：允许flex子项收缩 */
}

.diet-record-section {
  flex: 2;
  overflow-y: auto;
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.right-section {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.calendar-section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
  height: 100%;
  overflow-y: auto;
}
</style>