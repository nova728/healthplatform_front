<script>
import Footer from './components/Footer.vue';
import { RouterView } from 'vue-router';
import Header from '@/components/header.vue'
import { ref, provide, watch,computed,onMounted} from 'vue';
import {useRoute} from "vue-router";
import { useStore } from 'vuex';
import DraggableBubble from "@/components/DraggableBubble.vue";
import { defineComponent } from 'vue'
import { ElConfigProvider } from 'element-plus'


export default {
  name: 'App',
  components: {
    DraggableBubble,
    Footer,
    RouterView,
    Header,
    ElConfigProvider
  },
  setup() {
    const store = useStore();
    const route = useRoute();
    const zIndex = 3000
    const size = 'default'

    // 计算是否显示气泡
    const showBubble = computed(() => {
      return route.path.startsWith('/healthCenter')
    })

    const user = JSON.parse(localStorage.getItem("user"));
    console.log(user)
    const token = localStorage.getItem("token");
    console.log(token)

    // 定义 isLoggedIn 和 isAuthPage 状态
    const isLoggedIn = computed(() => store.state.user !== null);
    provide('isLoggedIn', isLoggedIn);

    const isAuthPage = ref(route.path === '/login' || route.path === '/register');

    // 初始化时恢复用户信息到store
    onMounted(() => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (storedUser && !store.state.user) {
        console.log('Restoring user from localStorage:', storedUser);
        store.commit('setUser', storedUser);
      }
    })

    // 监听路由路径的变化，更新 isAuthPage 的值
    watch(
        () => route.path,
        (newPath) => {
          isAuthPage.value = newPath === '/login' || newPath === '/register';
          console.log('isAuthPage:', isAuthPage.value);
        }
    );

    watch(
        () => store.state.user,
        (newUser) => {
          console.log('User state changed:', newUser);
        }
    );

    return {
      isLoggedIn,
      isAuthPage,
      showBubble,
      zIndex,
      size
    };
  },
};

</script>

<template>
  <el-config-provider :locale="locale" :size="size">
    <div class="common-layout">
      <!-- 非登录/注册页面的布局 -->
      <template v-if="!isAuthPage">
        <Header />
        <main class="main-content">
          <router-view />
        </main>
        <Footer />
      </template>

      <!-- 登录/注册页面的布局 -->
      <template v-else>
        <router-view />
      </template>

      <DraggableBubble v-if="showBubble" />
    </div>
  </el-config-provider>
</template>

<style scoped>
*{
  margin: 0;
  padding: 0;
  text-align:left;
  box-sizing: border-box;
  /* background: rgba(191,191,191,1); */
}

body {
  overflow-y: auto;
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

.common-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}


.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px 0;
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

/* 针对 Webkit 浏览器（Chrome、Safari等）隐藏滚动条 */
.main-content::-webkit-scrollbar {
  display: none;
}

.common-layout::-webkit-scrollbar {
  display: none;
}

.container {
  padding: 5px 0 0 15px;
}

.main-content {
  flex-grow: 1; /* 使 main-content 占据中间的自适应空间 */
  overflow: hidden;
  position: relative;
  //box-sizing: border-box;
}

.input {
  display: inline;
  margin: 20px 30px;
}

.button {
  width: 90px;
}
</style>