<template>
    <div class="health-metrics">
      <el-row :gutter="20">
        <el-col :span="8">
          <metric-card
            title="基础指标"
            :items="[
              { label: 'BMI', value: report.bmi, status: report.bmiStatus },
              { label: '体重(kg)', value: report.weight },
              { label: '身高(cm)', value: report.height }
            ]"
          />
        </el-col>
        
        <el-col :span="8">
          <metric-card
            title="血压心率"
            :items="[
              { label: '收缩压', value: report.systolic },
              { label: '舒张压', value: report.diastolic },
              { label: '心率', value: report.heartRate, status: report.heartRateStatus }
            ]"
          />
        </el-col>
        
        <el-col :span="8">
          <metric-card
            title="运动情况"
            :items="[
              { label: '周运动时长(分钟)', value: report.weeklyExerciseDuration },
              { label: '周运动次数', value: report.weeklyExerciseCount },
              { label: '周消耗卡路里', value: report.weeklyCaloriesBurned }
            ]"
          />
        </el-col>
      </el-row>
  
      <el-row :gutter="20" class="mt-20">
        <el-col :span="12">
          <metric-card
            title="步行数据"
            :items="[
              { label: '日均步数', value: report.dailySteps },
              { label: '日均距离(km)', value: report.dailyDistance }
            ]"
          />
        </el-col>
        
        <el-col :span="12">
          <metric-card
            title="睡眠情况"
            :items="[
              { label: '平均睡眠时长(小时)', value: report.averageSleepDuration },
              { label: '深睡比例(%)', value: report.deepSleepPercentage },
              { label: '浅睡比例(%)', value: report.lightSleepPercentage },
              { label: 'REM比例(%)', value: report.remSleepPercentage },
              { label: '睡眠质量', value: report.sleepQuality }
            ]"
          />
        </el-col>
      </el-row>
    </div>
  </template>
  
  <script>
  import MetricCard from './MetricCard.vue'
  
  export default {
    name: 'HealthMetrics',
    components: {
      MetricCard
    },
    props: {
      report: {
        type: Object,
        required: true
      }
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .health-metrics {
    padding: 20px;
    height: 100%;
    overflow-y: auto;

    // 美化滚动条
    &::-webkit-scrollbar {
      width: 8px;
    }
    
    &::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 4px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: #c0c4cc;
      border-radius: 4px;
      
      &:hover {
        background: #909399;
      }
    }

    .el-row {
      margin-bottom: 20px;
    }
  }
  </style>