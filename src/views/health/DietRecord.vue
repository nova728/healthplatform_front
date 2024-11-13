<template>
  <div class="diet-record">
    <h2>饮食记录</h2>

    <!-- 饮食数据概览 -->
    <div class="overview-cards">
      <el-card class="stat-card">
        <template #header>
          <div class="card-header">
            <span>今日摄入热量</span>
            <el-tag type="success" size="small">已达标</el-tag>
          </div>
        </template>
        <div class="stat-value">
          <span class="number">1,850</span>
          <span class="unit">千卡</span>
        </div>
        <div class="stat-progress">
          <el-progress :percentage="85" :format="format" />
        </div>
        <div class="stat-target">目标：2,200千卡/天</div>
      </el-card>

      <el-card class="stat-card">
        <template #header>
          <div class="card-header">
            <span>蛋白质摄入</span>
            <el-tag type="warning" size="small">需补充</el-tag>
          </div>
        </template>
        <div class="stat-value">
          <span class="number">45</span>
          <span class="unit">克</span>
        </div>
        <div class="stat-progress">
          <el-progress :percentage="60" :format="format" />
        </div>
        <div class="stat-target">目标：75克/天</div>
      </el-card>

      <el-card class="stat-card">
        <template #header>
          <div class="card-header">
            <span>饮水量</span>
            <el-tag type="success" size="small">不错</el-tag>
          </div>
        </template>
        <div class="stat-value">
          <span class="number">1.8</span>
          <span class="unit">升</span>
        </div>
        <div class="stat-progress">
          <el-progress :percentage="90" :format="format" />
        </div>
        <div class="stat-target">目标：2升/天</div>
      </el-card>
    </div>

    <!-- 饮食记录列表 -->
    <div class="record-section">
      <div class="section-header">
        <h3>今日饮食记录</h3>
        <el-button type="primary" @click="addRecord">
          <el-icon><Plus /></el-icon>添加记录
        </el-button>
      </div>

      <el-table :data="dietRecords" style="width: 100%">
        <el-table-column prop="time" label="时间" width="150">
          <template #default="scope">
            {{ formatTime(scope.row.time) }}
          </template>
        </el-table-column>
        <el-table-column prop="mealType" label="用餐类型" width="120">
          <template #default="scope">
            <el-tag
                :type="getMealTypeTag(scope.row.mealType)"
                size="small"
            >
              {{ scope.row.mealType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="foodName" label="食物名称" width="150" />
        <el-table-column prop="portion" label="份量" width="120">
          <template #default="scope">
            {{ scope.row.portion }} {{ scope.row.unit }}
          </template>
        </el-table-column>
        <el-table-column prop="calories" label="热量" width="120">
          <template #default="scope">
            {{ scope.row.calories }} 千卡
          </template>
        </el-table-column>
        <el-table-column prop="protein" label="蛋白质" width="120">
          <template #default="scope">
            {{ scope.row.protein }}克
          </template>
        </el-table-column>
        <el-table-column prop="notes" label="备注" />
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button-group>
              <el-button size="small" @click="editRecord(scope.row)">
                编辑
              </el-button>
              <el-button
                  size="small"
                  type="danger"
                  @click="deleteRecord(scope.row)"
              >
                删除
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 添加/编辑记录对话框 -->
    <el-dialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '添加饮食记录' : '编辑饮食记录'"
        width="500px"
        @close="handleDialogClose"
    >
      <el-form
          ref="recordFormRef"
          :model="recordForm"
          :rules="rules"
          label-width="100px"
      >
        <el-form-item label="用餐类型" prop="mealType">
          <el-select v-model="recordForm.mealType" placeholder="请选择用餐类型">
            <el-option label="早餐" value="早餐" />
            <el-option label="午餐" value="午餐" />
            <el-option label="晚餐" value="晚餐" />
            <el-option label="加餐" value="加餐" />
          </el-select>
        </el-form-item>

        <el-form-item label="时间" prop="time">
          <el-time-picker
              v-model="recordForm.time"
              format="HH:mm"
              placeholder="选择时间"
          />
        </el-form-item>

        <el-form-item label="食物名称" prop="foodName">
          <el-input v-model="recordForm.foodName" placeholder="请输入食物名称" />
        </el-form-item>

        <el-form-item label="份量" prop="portion">
          <el-input-number
              v-model="recordForm.portion"
              :min="0.1"
              :max="1000"
              :precision="1"
          />
          <el-select v-model="recordForm.unit" placeholder="单位" style="margin-left: 10px">
            <el-option label="克" value="克" />
            <el-option label="份" value="份" />
            <el-option label="碗" value="碗" />
            <el-option label="个" value="个" />
          </el-select>
        </el-form-item>

        <el-form-item label="热量(千卡)" prop="calories">
          <el-input-number
              v-model="recordForm.calories"
              :min="0"
              :max="3000"
          />
        </el-form-item>

        <el-form-item label="蛋白质(克)" prop="protein">
          <el-input-number
              v-model="recordForm.protein"
              :min="0"
              :max="200"
              :precision="1"
          />
        </el-form-item>

        <el-form-item label="备注" prop="notes">
          <el-input
              v-model="recordForm.notes"
              type="textarea"
              :rows="2"
              placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

// 格式化进度条
const format = (percentage) => `${percentage}%`

// 格式化时间
const formatTime = (time) => {
  if (time instanceof Date) {
    return time.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  return ''
}

// 获取用餐类型对应的标签类型
const getMealTypeTag = (type) => {
  const typeMap = {
    '早餐': 'success',
    '午餐': 'warning',
    '晚餐': 'danger',
    '加餐': 'info'
  }
  return typeMap[type] || ''
}

// 饮食记录数据
const dietRecords = ref([
  {
    time: new Date('2024-01-15T08:00:00'),
    mealType: '早餐',
    foodName: '全麦面包',
    portion: 2,
    unit: '片',
    calories: 160,
    protein: 8,
    notes: '搭配了一杯牛奶'
  },
  {
    time: new Date('2024-01-15T12:30:00'),
    mealType: '午餐',
    foodName: '鸡胸肉沙拉',
    portion: 1,
    unit: '份',
    calories: 350,
    protein: 25,
    notes: '减少了沙拉酱的用量'
  }
])

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref('add')
const recordFormRef = ref(null)

// 表单数据
const recordForm = reactive({
  mealType: '',
  time: new Date(),
  foodName: '',
  portion: 1,
  unit: '份',
  calories: 0,
  protein: 0,
  notes: ''
})

// 表单验证规则
const rules = {
  mealType: [{ required: true, message: '请选择用餐类型', trigger: 'change' }],
  time: [{ required: true, message: '请选择时间', trigger: 'change' }],
  foodName: [{ required: true, message: '请输入食物名称', trigger: 'blur' }],
  portion: [{ required: true, message: '请输入份量', trigger: 'blur' }],
  calories: [{ required: true, message: '请输入热量', trigger: 'blur' }],
  protein: [{ required: true, message: '请输入蛋白质含量', trigger: 'blur' }]
}

// 重置表单状态
const resetFormState = () => {
  Object.assign(recordForm, {
    mealType: '',
    time: new Date(),
    foodName: '',
    portion: 1,
    unit: '份',
    calories: 0,
    protein: 0,
    notes: ''
  })
}

// 添加记录
const addRecord = () => {
  dialogType.value = 'add'
  resetFormState()
  dialogVisible.value = true
}

// 编辑记录
const editRecord = (row) => {
  dialogType.value = 'edit'
  Object.assign(recordForm, {
    ...row,
    time: new Date(row.time)
  })
  dialogVisible.value = true
}

// 删除记录
const deleteRecord = (row) => {
  ElMessageBox.confirm(
      '确定要删除这条饮食记录吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    const index = dietRecords.value.indexOf(row)
    dietRecords.value.splice(index, 1)
    ElMessage({
      type: 'success',
      message: '删除成功'
    })
  }).catch(() => {})
}

// 提交表单
const submitForm = async () => {
  if (!recordFormRef.value) return

  await recordFormRef.value.validate((valid) => {
    if (valid) {
      const formData = {
        ...recordForm,
        time: new Date(recordForm.time)
      }

      if (dialogType.value === 'add') {
        dietRecords.value.unshift(formData)
        ElMessage({
          type: 'success',
          message: '添加成功'
        })
      } else {
        const index = dietRecords.value.findIndex(record =>
            record.time.getTime() === formData.time.getTime() &&
            record.foodName === formData.foodName
        )
        if (index !== -1) {
          dietRecords.value[index] = formData
          ElMessage({
            type: 'success',
            message: '修改成功'
          })
        }
      }
      dialogVisible.value = false
    }
  })
}

// 监听对话框关闭
const handleDialogClose = () => {
  if (recordFormRef.value) {
    recordFormRef.value.resetFields()
  }
  resetFormState()
}
</script>

<style scoped>
 .diet-record {
   padding: 20px;
   height: 100%;
   overflow-y: auto;
 }

.overview-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-value {
  text-align: center;
  margin: 15px 0;
}

.stat-value .number {
  font-size: 36px;
  font-weight: 600;
  color: #303133;
}

.stat-value .unit {
  font-size: 14px;
  color: #909399;
  margin-left: 5px;
}

.stat-progress {
  margin: 15px 0;
}

.stat-target {
  text-align: center;
  font-size: 12px;
  color: #909399;
}

.record-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-top: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

:deep(.el-tag) {
  text-align: center;
  min-width: 60px;
}

:deep(.el-button-group) {
  display: flex;
  gap: 8px;
}

:deep(.el-dialog__body) {
  padding-top: 20px;
}

:deep(.el-input-number) {
  width: 130px;
}

:deep(.el-select) {
  width: 100%;
}

:deep(.el-time-picker) {
  width: 100%;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .overview-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .overview-cards {
    grid-template-columns: 1fr;
  }

  .diet-record {
    padding: 10px;
  }

  .record-section {
    padding: 15px;
  }

  :deep(.el-table) {
    font-size: 14px;
  }

  :deep(.el-button) {
    padding: 8px 15px;
  }
}
</style>