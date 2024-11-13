<template>
  <div class="exercise-record">
    <h2>运动记录</h2>

    <!-- 运动数据概览 -->
    <div class="overview-cards">
      <el-card class="stat-card">
        <template #header>
          <div class="card-header">
            <span>本周运动时长</span>
            <el-tag type="success" size="small">已达标</el-tag>
          </div>
        </template>
        <div class="stat-value">
          <span class="number">5.5</span>
          <span class="unit">小时</span>
        </div>
        <div class="stat-progress">
          <el-progress :percentage="78" :format="format" />
        </div>
        <div class="stat-target">目标：7小时/周</div>
      </el-card>

      <el-card class="stat-card">
        <template #header>
          <div class="card-header">
            <span>本周消耗</span>
            <el-tag type="warning" size="small">加油</el-tag>
          </div>
        </template>
        <div class="stat-value">
          <span class="number">2,450</span>
          <span class="unit">千卡</span>
        </div>
        <div class="stat-progress">
          <el-progress :percentage="65" :format="format" />
        </div>
        <div class="stat-target">目标：3,500千卡/周</div>
      </el-card>

      <el-card class="stat-card">
        <template #header>
          <div class="card-header">
            <span>运动次数</span>
            <el-tag type="success" size="small">不错</el-tag>
          </div>
        </template>
        <div class="stat-value">
          <span class="number">4</span>
          <span class="unit">次</span>
        </div>
        <div class="stat-progress">
          <el-progress :percentage="80" :format="format" />
        </div>
        <div class="stat-target">目标：5次/周</div>
      </el-card>
    </div>

    <!-- 运动记录列表 -->
    <div class="record-section">
      <div class="section-header">
        <h3>最近运动记录</h3>
        <el-button type="primary" @click="addRecord">
          <el-icon><Plus /></el-icon>添加记录
        </el-button>
      </div>

      <el-table :data="exerciseRecords" style="width: 100%">
        <el-table-column prop="date" label="日期" width="150">
          <template #default="scope">
            {{ formatDate(scope.row.date) }}
          </template>
        </el-table-column>
        <el-table-column prop="type" label="运动类型" width="120">
          <template #default="scope">
            <el-tag
                :type="getExerciseTypeTag(scope.row.type)"
                size="small"
            >
              {{ scope.row.type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="时长" width="120">
          <template #default="scope">
            {{ scope.row.duration }} 分钟
          </template>
        </el-table-column>
        <el-table-column prop="calories" label="消耗" width="120">
          <template #default="scope">
            {{ scope.row.calories }} 千卡
          </template>
        </el-table-column>
        <el-table-column prop="intensity" label="强度" width="120">
          <template #default="scope">
            <el-rate
                v-model="scope.row.intensity"
                disabled
                :max="3"
                :colors="['#67C23A', '#E6A23C', '#F56C6C']"
            />
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
        :title="dialogType === 'add' ? '添加运动记录' : '编辑运动记录'"
        width="500px"
        @close="handleDialogClose"
    >
      <el-form
          ref="recordFormRef"
          :model="recordForm"
          :rules="rules"
          label-width="100px"
      >
        <el-form-item label="运动类型" prop="type">
          <el-select v-model="recordForm.type" placeholder="请选择运动类型">
            <el-option label="跑步" value="跑步" />
            <el-option label="游泳" value="游泳" />
            <el-option label="骑行" value="骑行" />
            <el-option label="健身" value="健身" />
            <el-option label="瑜伽" value="瑜伽" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>

        <el-form-item label="日期" prop="date">
          <el-date-picker
              v-model="recordForm.date"
              type="date"
              placeholder="选择日期"
          />
        </el-form-item>

        <el-form-item label="时长(分钟)" prop="duration">
          <el-input-number
              v-model="recordForm.duration"
              :min="1"
              :max="999"
          />
        </el-form-item>

        <el-form-item label="消耗(千卡)" prop="calories">
          <el-input-number
              v-model="recordForm.calories"
              :min="1"
              :max="9999"
          />
        </el-form-item>

        <el-form-item label="运动强度" prop="intensity">
          <el-rate
              v-model="recordForm.intensity"
              :max="3"
              :colors="['#67C23A', '#E6A23C', '#F56C6C']"
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

// 格式化日期
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 获取运动类型对应的标签类型
const getExerciseTypeTag = (type) => {
  const typeMap = {
    '跑步': 'success',
    '游泳': 'info',
    '骑行': 'warning',
    '健身': 'danger',
    '瑜伽': ''
  }
  return typeMap[type] || ''
}

// 运动记录数据
const exerciseRecords = ref([
  {
    date: new Date('2024-01-10'),
    type: '跑步',
    duration: 45,
    calories: 450,
    intensity: 2,
    notes: '晚上沿着江边跑步，感觉不错'
  },
  {
    date: new Date('2024-01-12'),
    type: '游泳',
    duration: 60,
    calories: 500,
    intensity: 3,
    notes: '自由泳 1000米'
  }
])

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref('add')
const recordFormRef = ref(null)

// 表单数据
const recordForm = reactive({
  type: '',
  date: new Date(),
  duration: 30,
  calories: 300,
  intensity: 2,
  notes: ''
})

// 表单验证规则
const rules = {
  type: [{ required: true, message: '请选择运动类型', trigger: 'change' }],
  date: [{ required: true, message: '请选择日期', trigger: 'change' }],
  duration: [{ required: true, message: '请输入运动时长', trigger: 'blur' }],
  calories: [{ required: true, message: '请输入消耗热量', trigger: 'blur' }],
  intensity: [{ required: true, message: '请选择运动强度', trigger: 'change' }]
}

// 重置表单状态
const resetFormState = () => {
  Object.assign(recordForm, {
    type: '',
    date: new Date(),
    duration: 30,
    calories: 300,
    intensity: 2,
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
    date: new Date(row.date)
  })
  dialogVisible.value = true
}

// 删除记录
const deleteRecord = (row) => {
  ElMessageBox.confirm(
      '确定要删除这条运动记录吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    const index = exerciseRecords.value.indexOf(row)
    exerciseRecords.value.splice(index, 1)
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
        date: new Date(recordForm.date)
      }

      if (dialogType.value === 'add') {
        exerciseRecords.value.unshift(formData)
        ElMessage({
          type: 'success',
          message: '添加成功'
        })
      } else {
        const index = exerciseRecords.value.findIndex(record =>
            record.date.getTime() === formData.date.getTime() &&
            record.type === formData.type
        )
        if (index !== -1) {
          exerciseRecords.value[index] = formData
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
.exercise-record {
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

@media (max-width: 1200px) {
  .overview-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .overview-cards {
    grid-template-columns: 1fr;
  }
}
</style>