import { createRouter, createWebHistory } from 'vue-router'
import ArticleDetail from "@/views/forum/ArticleDetail.vue";

const routes = [
    {
        path: '/',
        name: 'index',
        component: () => import('../views/Home.vue')
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('../views/Login.vue')
    },
    {
        path: '/register',
        name: 'Register',
        component: () => import('../views/Register.vue')
    },
    {
      path: '/home',
      name: 'Home',
      component: () => import('../views/Home.vue')
    },
    {
        path:'/editInformation',
        name:'EditInformation',
        component: () => import('../views/UserInformation.vue')
    },
    {
        path: '/forum',
        name: 'Forum',
        component: () => import('../views/forum.vue')
    },
    {
        path: '/article/editor',
        name: 'ArticleEditor',
        component: () => import('../views/forum/ArticleEditor.vue')
    },
    {
      path: '/setting',
      name: 'Setting',
      component: () => import('../views/setting.vue')
    },
    {
        path: '/healthCenter',
        name: 'HealthCenter',
        component: () => import('../views/healthCenter.vue'),
        children: [
            {
                path: 'health-data',
                name: 'HealthData',
                component: () => import('../views/health/healthData.vue')
            },
            {
                path: 'exercise-record',
                name: 'ExerciseRecord',
                component: () => import('../views/health/ExerciseRecord.vue')
            },
            {
                path: 'diet-record',
                name: 'DietRecord',
                component: () => import('../views/health/DietRecord.vue')
            },
            {
                path: 'health-report',
                name: 'HealthReport',
                component: () => import('../views/health/HealthReport.vue')
            },
            {
                path: 'health-competition',
                name: 'HealthCompetition',
                component: () => import('../views/health/HealthCompetition.vue')
            },
            {
                path: 'heart-rate',
                name: 'HeartRateDetail',
                component: () => import('../views/health/detail/HeartRate.vue')
            },
            {
                path: 'sleep',
                name: 'SleepDetail',
                component: () => import('../views/health/detail/Sleep.vue')
            },
            {
                path: 'steps',
                name: 'StepsDetail',
                component: () => import('../views/health/detail/Steps.vue')
            },
            {
                path: 'blood-pressure',
                name: 'BloodPressureDetail',
                component: () => import('../views/health/detail/BloodPressure.vue')
            },
            {
                path: 'weight',
                name: 'WeightDetail',
                component: () => import('../views/health/detail/Weight.vue')
            },
            {
                path: 'bmi',
                name: 'BMIDetail',
                component: () => import('../views/health/detail/BMI.vue')
            },
            {
                path:'height',
                name: 'HeightDetail',
                component: () => import('../views/health/detail/Height.vue')
            }
        ]
    },
    {
        path: '/article/detail/:id',
        name: 'ArticleDetail',
        component: () => import('../views/forum/ArticleDetail.vue'),
        props: true
    },
    {
        path: '/my-articles',
        name: 'MyArticles',
        component:()=>import ('../views/MyArticles.vue'),
    }
]

const router = createRouter({
    // history: createWebHistory(process.env.BASE_URL),
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})

export default router