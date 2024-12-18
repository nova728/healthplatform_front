<template>
  <el-card class="metric-card">
    <template #header>
      <div class="card-header">
        <span>{{ title }}</span>
      </div>
    </template>
    
    <div class="metric-list">
      <div v-for="(item, index) in items" 
            :key="index"
            class="metric-item"
      >
        <div class="metric-label">{{ item.label }}</div>
        <div class="metric-value">{{ item.value || '-' }}</div>
        <div v-if="item.status" 
              class="metric-status"
              :class="getStatusClass(item.status)"
        >
          {{ item.status }}
        </div>
      </div>
    </div>
  </el-card>
</template>

<script>
export default {
  name: 'MetricCard',
  props: {
    title: {
      type: String,
      required: true
    },
    items: {
      type: Array,
      required: true
    }
  },
  setup() {
    const getStatusClass = (status) => {
      const statusMap = {
        '正常': 'status-normal',
        '偏高': 'status-warning',
        '偏低': 'status-warning',
        '超重': 'status-warning',
        '肥胖': 'status-danger',
        '偏瘦': 'status-warning'
      }
      return statusMap[status] || ''
    }

    return {
      getStatusClass
    }
  }
}
</script>

<style lang="scss" scoped>
.metric-card {
  .metric-list {
    .metric-item {
      margin-bottom: 15px;
      
      .metric-label {
        color: #666;
        font-size: 14px;
      }
      
      .metric-value {
        font-size: 24px;
        font-weight: bold;
        color: #333;
        margin: 5px 0;
      }
      
      .metric-status {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 10px;
        font-size: 12px;
        
        &.status-normal {
          background-color: #67C23A;
          color: white;
        }
        
        &.status-warning {
          background-color: #E6A23C;
          color: white;
        }
        
        &.status-danger {
          background-color: #F56C6C;
          color: white;
        }
      }
    }
  }
}
</style>