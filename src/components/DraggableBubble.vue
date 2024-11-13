<template>
  <div
      ref="bubbleRef"
      class="floating-bubble"
      :style="{
      left: `${position.x}px`,
      top: `${position.y}px`
    }"
      @mousedown.prevent="startDrag"
      @click.stop="navigateToCompetition"
  >
    <el-icon class="bubble-icon"><Trophy /></el-icon>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, onBeforeUnmount } from 'vue'
import { Trophy } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const bubbleRef = ref(null)
const position = ref({
  x: 20,
  y: Math.max(60, (window.innerHeight - 60) / 2)
})

let isDragging = false
let startPos = { x: 0, y: 0 }
let startOffset = { x: 0, y: 0 }

// 开始拖动
const startDrag = (e) => {
  if (e.button !== 0) return // 只响应左键点击
  e.preventDefault() // 阻止默认事件
  isDragging = true
  startPos = {
    x: e.clientX,
    y: e.clientY
  }
  startOffset = {
    x: position.value.x,
    y: position.value.y
  }

  document.addEventListener('mousemove', handleDrag)
  document.addEventListener('mouseup', stopDrag)
}

// 处理拖动
const handleDrag = (e) => {
  if (!isDragging) return

  let newX = startOffset.x + (e.clientX - startPos.x)
  let newY = startOffset.y + (e.clientY - startPos.y)

  // 获取窗口尺寸
  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight
  const bubbleSize = 60 // 气泡的大小

  // 限制在窗口范围内
  newX = Math.max(0, Math.min(windowWidth - bubbleSize, newX))
  newY = Math.max(0, Math.min(windowHeight - bubbleSize, newY))

  position.value = {
    x: newX,
    y: newY
  }
}

// 停止拖动
const stopDrag = () => {
  if (!isDragging) return

  isDragging = false
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)

  // 贴边吸附
  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight
  const bubbleSize = 60
  const threshold = 50 // 吸附阈值

  const newPosition = { ...position.value }

  if (newPosition.x < threshold) {
    newPosition.x = 0 // 左边
  } else if (newPosition.x > windowWidth - bubbleSize - threshold) {
    newPosition.x = windowWidth - bubbleSize // 右边
  }

  if (newPosition.y < threshold) {
    newPosition.y = 0 // 上边
  } else if (newPosition.y > windowHeight - bubbleSize - threshold) {
    newPosition.y = windowHeight - bubbleSize // 下边
  }

  position.value = newPosition
}

// 导航到竞赛页面
const navigateToCompetition = (e) => {
  e.preventDefault()
  if (!isDragging) {
    router.push('/healthCenter/health-competition')
  }
}

// 处理窗口大小变化
const handleResize = () => {
  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight
  const bubbleSize = 60

  position.value = {
    x: Math.min(position.value.x, windowWidth - bubbleSize),
    y: Math.min(position.value.y, windowHeight - bubbleSize)
  }
}

// 清理函数
const cleanup = () => {
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
  window.removeEventListener('resize', handleResize)
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  cleanup()
})

onUnmounted(() => {
  cleanup()
})
</script>

<style scoped>
.floating-bubble {
  position: fixed;
  width: 60px;
  height: 60px;
  background-color: #409EFF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  z-index: 2000;
  user-select: none;
  touch-action: none;
}

.floating-bubble:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  background-color: #66b1ff;
  transform: scale(1.05);
}

.bubble-icon {
  font-size: 24px;
  color: white;
}

.floating-bubble:active {
  cursor: grabbing;
  transform: scale(0.95);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
</style>