<template>
  <div class="daily-nutrition">
    <h3>今日营养摄入</h3>
    <div class="nutrition-grid">
      <div class="nutrition-item">
        <span class="label">已摄入量</span>
        <span class="value">{{ totalCalories }}千卡</span>
      </div>
      <div class="nutrition-item">
        <span class="label">碳水化合物</span>
        <span class="value">{{ totalCarbs }}g</span>
      </div>
      <div class="nutrition-item">
        <span class="label">蛋白质</span>
        <span class="value">{{ totalProtein }}g</span>
      </div>
      <div class="nutrition-item">
        <span class="label">脂肪</span>
        <span class="value">{{ totalFat }}g</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const totalCalories = ref(0)
const totalCarbs = ref(0)
const totalProtein = ref(0)
const totalFat = ref(0)
</script>

<style scoped>
.daily-nutrition {
  padding: 15px;
}

.nutrition-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-top: 15px;
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
</style>