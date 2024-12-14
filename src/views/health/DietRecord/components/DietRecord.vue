<template>
    <div class="diet-record">
      <div class="daily-diet">
        <div class="header">
          <el-date-picker
            v-model="selectedDate"
            type="date"
            placeholder="选择日期"
            :disabled-date="disabledDate"
            @change="loadDailyDiet"
          />
          <el-button type="primary" @click="showFoodSearch">
            <el-icon><Plus /></el-icon>添加食物
          </el-button>
        </div>
  
        <div class="meal-sections">
          <div v-for="type in mealTypes" :key="type.value" class="meal-section">
            <h3>{{ type.label }}</h3>
            <el-table :data="getMealsByType(type.value)" style="width: 100%">
              <el-table-column prop="foodName" label="食物" />
              <el-table-column label="份量" width="150">
                <template #default="scope">
                  {{ scope.row.servingAmount }}{{ scope.row.servingUnit }}
                </template>
              </el-table-column>
              <el-table-column prop="calories" label="热量(kcal)" width="120" />
              <el-table-column prop="protein" label="蛋白质(g)" width="120" />
              <el-table-column prop="carbs" label="碳水(g)" width="120" />
              <el-table-column prop="fat" label="脂肪(g)" width="120" />
              <el-table-column label="操作" width="100">
                <template #default="scope">
                  <el-button 
                    type="danger" 
                    size="small"
                    @click="deleteMealRecord(scope.row)"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
  
        <div class="daily-summary">
          <h3>今日营养摄入总计</h3>
          <el-descriptions :column="4" border>
            <el-descriptions-item label="热量">{{ dailyDiet.totalCalories }}千卡</el-descriptions-item>
            <el-descriptions-item label="碳水">{{ dailyDiet.totalCarbs }}克</el-descriptions-item>
            <el-descriptions-item label="蛋白质">{{ dailyDiet.totalProtein }}克</el-descriptions-item>
            <el-descriptions-item label="脂肪">{{ dailyDiet.totalFat }}克</el-descriptions-item>
          </el-descriptions>
        </div>
  
        <FoodSearchDialog
          v-model:visible="searchDialogVisible"
          @add-food="handleAddFood"
        />
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Plus } from '@element-plus/icons-vue'
  import FoodSearchDialog from './FoodSearchDialog.vue'
  import { getDailyDiet, addMealRecord, deleteMealRecord as deleteMeal } from '@/api/diet'
  
  const selectedDate = ref(new Date())
  const searchDialogVisible = ref(false)
  const dailyMeals = ref([])
  const dailyDiet = ref({
    totalCalories: 0,
    totalCarbs: 0,
    totalProtein: 0,
    totalFat: 0
  })
  
  const mealTypes = [
    { label: '早餐', value: 'BREAKFAST' },
    { label: '午餐', value: 'LUNCH' },
    { label: '晚餐', value: 'DINNER' },
    { label: '加餐', value: 'SNACK' }
  ]
  
  // 添加 showFoodSearch 方法
  const showFoodSearch = () => {
    searchDialogVisible.value = true
  }
  
  // 添加 handleAddFood 方法
  const handleAddFood = async (foodData) => {
    try {
      await addMealRecord(selectedDate.value, foodData)
      ElMessage.success('添加成功')
      searchDialogVisible.value = false
      loadDailyDiet()
    } catch (error) {
      ElMessage.error('添加失败')
    }
  }
  
  // 添加 deleteMealRecord 方法
  const deleteMealRecord = async (meal) => {
    try {
      await ElMessageBox.confirm('确定要删除这条记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      
      await deleteMeal(meal.id)
      ElMessage.success('删除成功')
      loadDailyDiet()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('删除失败')
      }
    }
  }
  
  // 添加 getMealsByType 方法
    const getMealsByType = (type) => {
    return dailyMeals.value.filter(meal => meal.mealType === type)
    }

    // 添加 loadDailyDiet 方法
    const loadDailyDiet = async () => {
    try {
        const response = await getDailyDiet(selectedDate.value)
        dailyMeals.value = response.data.meals || []
        dailyDiet.value = {
        totalCalories: response.data.totalCalories || 0,
        totalCarbs: response.data.totalCarbs || 0,
        totalProtein: response.data.totalProtein || 0,
        totalFat: response.data.totalFat || 0
        }
    } catch (error) {
        ElMessage.error('获取饮食记录失败')
    }
    }

    // 添加 disabledDate 方法
    const disabledDate = (time) => {
    return time > new Date()
    }

    onMounted(() => {
    loadDailyDiet()
    })
  
  </script>
  
  <style scoped>
  .diet-record {
    padding: 20px;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  
  .meal-section {
    margin-bottom: 30px;
  }
  
  .daily-summary {
    margin-top: 30px;
  }
  </style>