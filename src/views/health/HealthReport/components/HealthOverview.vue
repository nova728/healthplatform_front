<template>
  <div class="health-overview">
    <el-row :gutter="20">
      <!-- 左侧健康评分区域 -->
      <el-col :xs="24" :sm="12" :md="8">
        <el-card class="score-card" :body-style="{ padding: '0' }">
          <div class="score-container">
            <div class="score-circle" :style="scoreCircleStyle">
              <div class="score-content">
                <div class="score">{{ report.overallScore || 0 }}</div>
                <div class="score-text">健康评分</div>
              </div>
            </div>
            <div class="score-status">
              {{ getScoreStatus(report.overallScore) }}
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧异常指标和建议区域 -->
      <el-col :xs="24" :sm="12" :md="16">
        <el-card class="info-card">
          <div class="warning-section" v-if="report.abnormalIndicators?.length">
            <div class="section-header">
              <el-icon class="warning-icon"><WarningFilled /></el-icon>
              <h3>异常指标提示</h3>
            </div>
            <transition-group name="tag-fade" tag="div" class="tag-container">
              <el-tag 
                v-for="indicator in report.abnormalIndicators" 
                :key="indicator"
                type="warning"
                class="indicator-tag"
                effect="dark"
              >
                <el-icon><Warning /></el-icon>
                {{ indicator }}
              </el-tag>
            </transition-group>
          </div>

          <div class="suggestion-section">
            <div class="section-header">
              <el-icon class="suggestion-icon"><Sunny /></el-icon>
              <h3>健康建议</h3>
            </div>
            <transition-group name="list-fade" tag="div" class="suggestion-list">
              <div v-for="(suggestion, index) in report.healthSuggestions" 
                   :key="index" 
                   class="suggestion-item"
              >
                <el-icon><Check /></el-icon>
                <span>{{ suggestion }}</span>
              </div>
            </transition-group>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <div class="action-section">
      <el-button 
        type="primary" 
        :loading="loading"
        @click="generateNewReport"
        class="generate-btn"
      >
        <el-icon><Refresh /></el-icon>
        生成新报告
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { generateReport } from '@/api/healthReport'
import { 
  WarningFilled, 
  Warning, 
  Sunny, 
  Check, 
  Refresh 
} from '@element-plus/icons-vue'

const props = defineProps({
  report: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['refresh'])
const loading = ref(false)

// 计算健康评分圆环的样式
const scoreCircleStyle = computed(() => {
  const score = props.report.overallScore || 0
  const degree = (score / 100) * 360
  const color = getScoreColor(score)
  
  return {
    background: `conic-gradient(${color} ${degree}deg, #f5f7fa ${degree}deg)`
  }
})

// 根据分数获取状态文本
const getScoreStatus = (score) => {
  if (score >= 90) return '健康状况优秀'
  if (score >= 75) return '健康状况良好'
  if (score >= 60) return '需要注意'
  return '需要改善'
}

// 根据分数获取颜色
const getScoreColor = (score) => {
  if (score >= 90) return '#67C23A'
  if (score >= 75) return '#409EFF'
  if (score >= 60) return '#E6A23C'
  return '#F56C6C'
}

// 生成新报告方法保持不变
const generateNewReport = async () => {
  if (!props.report.userId) {
    ElMessage.error('用户ID不存在')
    return
  }
  
  loading.value = true
  try {
    await generateReport(props.report.userId)
    ElMessage.success('新报告生成成功')
    emit('refresh')
  } catch (error) {
    ElMessage.error('生成报告失败')
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.health-overview {
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

  .score-card {
    height: 100%;
    transition: transform 0.3s;

    &:hover {
      transform: translateY(-5px);
    }

    .score-container {
      padding: 30px;
      text-align: center;

      .score-circle {
        width: 200px;
        height: 200px;
        border-radius: 50%;
        margin: 0 auto;
        position: relative;
        transition: transform 0.3s;

        &:hover {
          transform: scale(1.05);
        }

        .score-content {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          
          .score {
            font-size: 48px;
            font-weight: bold;
            color: #303133;
          }

          .score-text {
            font-size: 16px;
            color: #909399;
            margin-top: 8px;
          }
        }
      }

      .score-status {
        margin-top: 20px;
        font-size: 18px;
        color: #606266;
      }
    }
  }

  .info-card {
    height: auto;
    min-height: 400px;
    margin-bottom: 20px;
    
    .scrollable-content {
      max-height: calc(100vh - 400px);
      overflow-y: auto;
      padding-right: 10px;
      
      // 美化内部滚动条
      &::-webkit-scrollbar {
        width: 6px;
      }
      
      &::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 3px;
      }
      
      &::-webkit-scrollbar-thumb {
        background: #c0c4cc;
        border-radius: 3px;
        
        &:hover {
          background: #909399;
        }
      }
    }

    .section-header {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
      
      .el-icon {
        margin-right: 10px;
        font-size: 24px;
      }

      &.warning-icon {
        color: #E6A23C;
      }

      &.suggestion-icon {
        color: #409EFF;
      }

      h3 {
        margin: 0;
        color: #303133;
      }
    }

    .tag-container {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 30px;

      .indicator-tag {
        display: flex;
        align-items: center;
        padding: 8px 12px;
        
        .el-icon {
          margin-right: 5px;
        }
      }
    }

    .suggestion-list {
      .suggestion-item {
        display: flex;
        align-items: center;
        padding: 12px;
        margin-bottom: 10px;
        background: #f5f7fa;
        border-radius: 8px;
        transition: all 0.3s;

        &:hover {
          background: #ecf5ff;
          transform: translateX(5px);
        }

        .el-icon {
          color: #67C23A;
          margin-right: 10px;
        }
      }
    }
  }

  .action-section {
    margin-top: 30px;
    text-align: center;

    .generate-btn {
      padding: 12px 30px;
      font-size: 16px;
      
      .el-icon {
        margin-right: 5px;
      }
    }
  }
}

// 动画效果
.tag-fade-enter-active,
.tag-fade-leave-active {
  transition: all 0.3s ease;
}

.tag-fade-enter-from,
.tag-fade-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.list-fade-enter-active,
.list-fade-leave-active {
  transition: all 0.3s ease;
}

.list-fade-enter-from,
.list-fade-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

// 响应式布局
@media (max-width: 768px) {
  .health-overview {
    .score-card {
      margin-bottom: 20px;
    }
  }
}
</style>