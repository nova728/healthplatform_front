<template>
  <div class="health-overview">
    <div class="overview-content">
      <el-card class="overview-card">
        <div class="score-section">
          <div class="score">{{ report.overallScore || 0 }}</div>
          <div class="score-text">健康评分</div>
        </div>
        
        <div class="scrollable-content">
          <div class="warning-section" v-if="report.abnormalIndicators?.length">
            <h3>异常指标提示</h3>
            <el-tag 
              v-for="indicator in report.abnormalIndicators" 
              :key="indicator"
              type="warning"
              class="indicator-tag"
            >
              {{ indicator }}
            </el-tag>
          </div>
    
          <div class="suggestion-section">
            <h3>健康建议</h3>
            <div class="suggestion-list">
              <div v-for="(suggestion, index) in report.healthSuggestions" 
                   :key="index" 
                   class="suggestion-item"
              >
                <el-icon><InfoFilled /></el-icon>
                <span>{{ suggestion }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="action-buttons">
          <el-button type="primary" @click="generateNewReport">
            生成新报告
          </el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>
  
  <script setup>
  import { ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import { generateReport} from '@/api/healthReport'
  import { defineProps } from 'vue'  
  
  const props = defineProps({
    report: {
      type: Object,
      required: true
    }
  })

  const emit = defineEmits(['refresh'])
  const loading = ref(false)

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
    .overview-card {
      .score-section {
        text-align: center;
        margin-bottom: 30px;
        
        .score {
          font-size: 48px;
          color: #409EFF;
          font-weight: bold;
        }
        
        .score-text {
          font-size: 16px;
          color: #666;
        }
      }
  
      .warning-section,
      .suggestion-section {
        margin-bottom: 20px;
        
        h3 {
          margin-bottom: 15px;
          color: #333;
        }
      }
  
      .indicator-tag {
        margin-right: 10px;
        margin-bottom: 10px;
      }
  
      .suggestion-item {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
        
        .el-icon {
          color: #409EFF;
          margin-right: 10px;
        }
      }
  
      .action-buttons {
        text-align: center;
        margin-top: 30px;
      }
    }
  }
  </style>