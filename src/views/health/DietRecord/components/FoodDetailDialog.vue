<template>
  <el-dialog
    v-model="dialogVisible"
    :title="food?.foodName"
    width="40%"
  >
    <div class="food-info">
      <div class="nutrition-info">
        <h4>营养成分（每100{{ food?.servingUnit }}）:</h4>
        <el-descriptions :column="2">
          <el-descriptions-item label="热量">{{ food?.calories }}千卡</el-descriptions-item>
          <el-descriptions-item label="碳水">{{ food?.carbs }}克</el-descriptions-item>
          <el-descriptions-item label="蛋白质">{{ food?.protein }}克</el-descriptions-item>
          <el-descriptions-item label="脂肪">{{ food?.fat }}克</el-descriptions-item>
        </el-descriptions>
      </div>

      <div class="serving-input">
        <h4>设置份量：</h4>
        <el-form :model="form" label-width="100px">
          <el-form-item label="餐次">
            <el-select v-model="form.mealType">
              <el-option label="早餐" value="BREAKFAST" />
              <el-option label="午餐" value="LUNCH" />
              <el-option label="晚餐" value="DINNER" />
              <el-option label="加餐" value="SNACK" />
            </el-select>
          </el-form-item>
          <el-form-item label="份量">
            <el-input-number 
              v-model="form.amount" 
              :min="0" 
              :precision="1"
            />
            <span class="unit">{{ food?.servingUnit }}</span>
          </el-form-item>
        </el-form>
      </div>

      <div class="calculated-nutrition">
        <h4>当前份量营养成分：</h4>
        <el-descriptions :column="2">
          <el-descriptions-item label="热量">{{ calculatedNutrition.calories }}千卡</el-descriptions-item>
          <el-descriptions-item label="碳水">{{ calculatedNutrition.carbs }}克</el-descriptions-item>
          <el-descriptions-item label="蛋白质">{{ calculatedNutrition.protein }}克</el-descriptions-item>
          <el-descriptions-item label="脂肪">{{ calculatedNutrition.fat }}克</el-descriptions-item>
        </el-descriptions>
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirm">添加</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'

defineOptions({
  name: 'FoodDetailDialog'
})

const props = defineProps({
  visible: Boolean,
  food: Object
})

const emit = defineEmits(['update:visible', 'confirm'])

const dialogVisible = ref(false)
const form = ref({
  mealType: 'BREAKFAST',
  amount: 100
})

const calculatedNutrition = computed(() => {
  if (!props.food) return { calories: 0, carbs: 0, protein: 0, fat: 0 }
  const ratio = form.value.amount / 100
  return {
    calories: (props.food.calories * ratio).toFixed(1),
    carbs: (props.food.carbs * ratio).toFixed(1),
    protein: (props.food.protein * ratio).toFixed(1),
    fat: (props.food.fat * ratio).toFixed(1)
  }
})

watch(() => props.visible, (val) => {
  dialogVisible.value = val
})

watch(dialogVisible, (val) => {
  emit('update:visible', val)
})

const handleConfirm = () => {
  if (form.value.amount <= 0) {
    ElMessage.warning('请输入有效的份量')
    return
  }

  emit('confirm', {
    foodId: props.food.id,
    foodName: props.food.foodName,
    mealType: form.value.mealType,
    servingAmount: form.value.amount,
    servingUnit: props.food.servingUnit,
    calories: Number(calculatedNutrition.value.calories),
    carbs: Number(calculatedNutrition.value.carbs),
    protein: Number(calculatedNutrition.value.protein),
    fat: Number(calculatedNutrition.value.fat)
  })
}
</script>

<style scoped>
.food-info {
  padding: 20px;
}
.nutrition-info, .serving-input, .calculated-nutrition {
  margin-bottom: 20px;
}
.unit {
  margin-left: 10px;
}
</style>