<template>
  <el-dialog
    v-model="dialogVisible"
    title="搜索食物"
    width="70%"
    @close="handleClose"
  >
    <div class="search-container">
      <el-input
        v-model="searchQuery"
        placeholder="请输入食物名称"
        @keyup.enter="handleSearch"
      >
        <template #append>
          <el-button @click="handleSearch" :loading="loading">
            搜索
          </el-button>
        </template>
      </el-input>
    </div>

    <div v-loading="loading">
      <el-table :data="foodList" style="width: 100%">
        <el-table-column prop="foodName" label="食物名称" />
        <el-table-column label="营养成分(每100g)">
          <el-table-column prop="calories" label="热量(kcal)" width="120" />
          <el-table-column prop="protein" label="蛋白质(g)" width="120" />
          <el-table-column prop="carbs" label="碳水(g)" width="120" />
          <el-table-column prop="fat" label="脂肪(g)" width="120" />
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              @click="showFoodDetail(scope.row)"
            >
              添加
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          @current-change="handlePageChange"
          layout="prev, pager, next"
        />
      </div>
    </div>

    <FoodDetailDialog
      v-if="selectedFood"
      v-model:visible="detailDialogVisible"
      :food="selectedFood"
      @confirm="handleAddFood"
    />
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import FoodDetailDialog from './FoodDetailDialog.vue'
import { searchFood } from '@/api/diet'

const props = defineProps({
  visible: Boolean
})

const emit = defineEmits(['update:visible', 'add-food'])

const dialogVisible = ref(props.visible)
const searchQuery = ref('')
const loading = ref(false)
const foodList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const selectedFood = ref(null)
const detailDialogVisible = ref(false)

watch(() => props.visible, (val) => {
  dialogVisible.value = val
})

watch(dialogVisible, (val) => {
  emit('update:visible', val)
  if (!val) {
    searchQuery.value = ''
    foodList.value = []
    currentPage.value = 1
    selectedFood.value = null
  }
})

const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }
  
  loading.value = true
  try {
    const result = await searchFood(
      searchQuery.value.trim(), 
      currentPage.value, 
      pageSize.value
    )
    
    console.log('API返回原始数据:', result)
    
    if (!result) {
      throw new Error('API返回数据为空')
    }

    if (result.foods_search?.results?.food) {
      // 处理返回的数据
    } else {
      foodList.value = []
      total.value = 0
      ElMessage.info('未找到相关食物')
    }
  } catch (error) {
    console.error('搜索失败:', error)
    ElMessage.error(error.message || '搜索失败，请稍后重试')
    foodList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

const showFoodDetail = (food) => {
  selectedFood.value = food
  detailDialogVisible.value = true
}

const handleAddFood = (foodData) => {
  emit('add-food', foodData)
  detailDialogVisible.value = false
  dialogVisible.value = false
}

const handleClose = () => {
  dialogVisible.value = false
}

const handlePageChange = (page) => {
  currentPage.value = page
  handleSearch()
}
</script>

<style scoped>
.search-container {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

:deep(.el-dialog__body) {
  padding-top: 10px;
}
</style>