<template>
  <div class="diet-page">
    <!-- 今日营养摄入概览 -->
    <div class="daily-overview">
      <DailyNutrition 
        ref="dailyNutritionRef"
        :userId="store.state.user?.id" 
        :date="selectedDate"
      />
    </div>
    
    <!-- 下半部分内容 -->
    <div class="main-content">
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

// 处理日期变化
const handleDateChange = (date) => {
  selectedDate.value = date
  // 确保DailyNutrition组件更新
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
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.daily-overview {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.main-content {
  display: flex;
  gap: 20px;
  flex: 1;
  min-height: 0; /* 防止内容溢出 */
}

.diet-record-section {
  flex: 2;
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
  overflow: auto;
}

.right-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.calendar-section,
.plan-section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.calendar-section {
  flex: 1;
}

.plan-section {
  flex: 1;
}
</style>