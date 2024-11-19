<template>
  <div class="forum-container">
    <div class="forum">
      <!-- 顶部搜索和发帖区域 -->
      <div class="forum-header">
        <el-input
            v-model="searchText"
            placeholder="搜索帖子..."
            class="search-input"
            :prefix-icon="Search"
        >
        </el-input>
        <el-button type="primary" @click="createPost">
          <el-icon><Plus /></el-icon>发帖
        </el-button>
      </div>

      <!-- 主要内容区域 -->
      <div class="forum-content">
        <!-- 左侧分类列表 -->
        <div class="forum-categories">
          <div class="category-title">板块分类</div>
          <el-menu
              :default-active="activeCategory"
              @select="handleCategorySelect">
            <el-menu-item index="1">
              <el-icon><ChatDotRound /></el-icon>
              <span>健康讨论</span>
            </el-menu-item>
            <el-menu-item index="2">
              <el-icon><Sunny /></el-icon>
              <span>生活分享</span>
            </el-menu-item>
            <el-menu-item index="3">
              <el-icon><QuestionFilled /></el-icon>
              <span>问题解答</span>
            </el-menu-item>
            <el-menu-item index="4">
              <el-icon><Medal /></el-icon>
              <span>经验交流</span>
            </el-menu-item>
          </el-menu>
        </div>

        <!-- 右侧帖子列表 -->
        <div class="posts-list">
          <el-card v-for="post in posts" :key="post.id" class="post-card">
            <div class="post-header">
              <el-avatar :size="40" :src="post.avatar" />
              <div class="post-info">
                <div class="post-title">{{ post.title }}</div>
                <div class="post-meta">
                  <span>{{ post.author }}</span>
                  <span>{{ post.date }}</span>
                  <span>{{ post.category }}</span>
                </div>
              </div>
            </div>
            <div class="post-content">{{ post.content }}</div>
            <div class="post-footer">
              <span><el-icon><View /></el-icon> {{ post.views }}</span>
              <span><el-icon><ChatRound /></el-icon> {{ post.comments }}</span>
              <span><el-icon><Star /></el-icon> {{ post.likes }}</span>
            </div>
          </el-card>

          <!-- 分页 -->
          <div class="pagination">
            <el-pagination
                background
                layout="prev, pager, next"
                :total="100"
                :page-size="10"
                @current-change="handlePageChange"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
  <CreatePostDialog ref="createPostDialogRef" />
</template>

<script setup>
import { ref } from 'vue'
import { Search, Plus, ChatDotRound, Sunny, QuestionFilled, Medal, View, ChatRound, Star } from '@element-plus/icons-vue'
import CreatePostDialog from "@/views/forum/CreatePostDialog.vue";

const searchText = ref('')
const activeCategory = ref('1')
const createPostDialogRef = ref(null)

const createPost = () => {
  createPostDialogRef.value.dialogVisible = true
}

// 模拟的帖子数据
const posts = ref([
  {
    id: 1,
    title: '每天坚持运动的好处',
    author: '健康达人',
    avatar: '/src/assets/images/avatar.png',
    date: '2024-03-15',
    category: '健康讨论',
    content: '坚持运动不仅能保持身体健康，还能提高生活质量...',
    views: 1200,
    comments: 25,
    likes: 88
  },
  {
    id: 2,
    title: '健康饮食小技巧分享',
    author: '营养师小李',
    avatar: '/src/assets/images/avatar.png',
    date: '2024-03-14',
    category: '生活分享',
    content: '合理的饮食搭配对身体健康非常重要...',
    views: 980,
    comments: 18,
    likes: 65
  }
])

const handleCategorySelect = (key) => {
  activeCategory.value = key
  // 根据分类加载帖子
}

const handlePageChange = (page) => {
  // 处理分页
}
</script>

<style scoped>
.forum-container {
  padding: 20px 40px;
  height: calc(100% - 40px);
  background-color: #f5f7fa;
}

.forum {
  height: 100%;
  width: 100%;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
}

.forum-header {
  padding: 20px;
  display: flex;
  gap: 16px;
  border-bottom: 1px solid #e6e6e6;
}

.search-input {
  max-width: 300px;
}

.forum-content {
  flex: 1;
  display: flex;
  height: calc(100% - 80px);  /* 减去header高度 */
  overflow: hidden;
}

.forum-categories {
  width: 200px;
  border-right: 1px solid #e6e6e6;
  background-color: white;
}

.category-title {
  padding: 16px;
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  border-bottom: 1px solid #e6e6e6;
}

.posts-list {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.post-card {
  margin-bottom: 16px;
}

.post-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.post-info {
  flex: 1;
}

.post-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 4px;
}

.post-meta {
  font-size: 12px;
  color: #909399;
  display: flex;
  gap: 12px;
}

.post-content {
  color: #606266;
  margin-bottom: 12px;
  line-height: 1.5;
}

.post-footer {
  display: flex;
  gap: 16px;
  color: #909399;
  font-size: 14px;
}

.post-footer span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* 确保图标垂直居中 */
.el-icon {
  vertical-align: middle;
}

/* 菜单项样式 */
.el-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 滚动条样式优化 */
.posts-list::-webkit-scrollbar {
  width: 6px;
}

.posts-list::-webkit-scrollbar-thumb {
  background-color: #dcdfe6;
  border-radius: 3px;
}

.posts-list::-webkit-scrollbar-track {
  background-color: #f5f7fa;
}
</style>