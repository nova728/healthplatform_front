<template>
  <div>
    <el-radio-group v-model="isCollapse" style="margin-bottom: 20px">
      <el-radio-button :label="false">expand</el-radio-button>
      <el-radio-button :label="true">collapse</el-radio-button>
    </el-radio-group>
    <el-menu
        default-active="2"
        class="el-menu-vertical-demo"
        :collapse="isCollapse"
        @open="handleOpen"
        @close="handleClose"
    >
      <el-sub-menu index="1" class="full-height-submenu">
        <template #title>
          <el-icon><location /></el-icon>
          <span>Vue3 练习</span>
        </template>
        <el-menu-item-group>
          <template #title><span>主要知识点</span></template>
          <el-menu-item index="1-1">store</el-menu-item>
          <el-menu-item index="1-2">Router</el-menu-item>
        </el-menu-item-group>
        <el-menu-item-group title="次级知识点">
          <el-menu-item index="1-3">Elements Plus</el-menu-item>
        </el-menu-item-group>
        <el-sub-menu index="1-4">
          <template #title><span>打包</span></template>
          <el-menu-item index="1-4-1">Vite知识</el-menu-item>
        </el-sub-menu>
      </el-sub-menu>
      <el-menu-item index="2">
        <el-icon><icon-menu /></el-icon>
        <template #title>TypeScript</template>
      </el-menu-item>
      <el-menu-item index="3" disabled>
        <el-icon><document /></el-icon>
        <template #title>Vite</template>
      </el-menu-item>
      <el-menu-item index="4">
        <el-icon><setting /></el-icon>
        <template #title>Pina</template>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import {
  Document,
  Menu as IconMenu,
  Location,
  Setting,
} from '@element-plus/icons-vue'

const isCollapse = ref(true)
const handleOpen = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
const handleClose = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
</script>

<style>
.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
  min-height: 400px;
}

.el-menu-vertical-demo {
  /*height: 100%; !* 父容器高度 100% *!*/
}

.full-height-submenu{
  height: 100%; /* 子菜单占满高度 */
  display: flex;
  flex-direction: column;
}
</style>