<template>
    <div class="nutrition-calendar">
      <h3>营养日历</h3>
      <el-calendar>
        <template #dateCell="{ data }">
          <div class="calendar-cell">
            <span>{{ data.day.split('-').slice(2).join('') }}</span>
            <div class="nutrition-indicator" :class="getNutritionStatus(data)"></div>
          </div>
        </template>
      </el-calendar>
    </div>
  </template>
  
  <script setup>
  const getNutritionStatus = (date) => {
    // 这里添加逻辑来确定每天的营养状态
    return 'good' // 可能的值: good, warning, bad
  }
  </script>
  
  <style scoped>
  .nutrition-calendar {
    height: 100%;
  }
  
  .calendar-cell {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
  }
  
  .nutrition-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-top: 4px;
  }
  
  .nutrition-indicator.good {
    background-color: #67C23A;
  }
  
  .nutrition-indicator.warning {
    background-color: #E6A23C;
  }
  
  .nutrition-indicator.bad {
    background-color: #F56C6C;
  }
  </style>