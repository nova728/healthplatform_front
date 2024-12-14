<template>
  <div class="diet-page">
    <!-- 今日营养摄入概览 -->
    <div class="daily-overview">
      <DailyNutrition />
    </div>
    
    <!-- 下半部分内容 -->
    <div class="main-content">
      <!-- 左侧饮食记录 -->
      <div class="diet-record-section">
        <DietRecord />
      </div>
      
      <!-- 右侧日历和计划 -->
      <div class="right-section">
        <!-- 日历组件 -->
        <div class="calendar-section">
          <NutritionCalendar />
        </div>
        
        <!-- 计划板块 -->
        <div class="plan-section">
          <DietPlan />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import DietRecord from './components/DietRecord.vue'
import DailyNutrition from './components/DailyNutrition.vue'
import NutritionCalendar from './components/NutritionCalendar.vue'
import DietPlan from './components/DietPlan.vue'

const activeTab = ref('record')
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