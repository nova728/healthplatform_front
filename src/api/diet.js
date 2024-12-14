import request from '@/utils/request'

export function getDailyDiet(date) {
  return request({
    url: `/${userId}/diet/daily`,
    method: 'get',
    params: {
      date: date.toISOString().split('T')[0]
    }
  })
}

export function searchFood(query, page = 1, pageSize = 20) {
  const token = localStorage.getItem('token')
  return request({
    url: `/foods/search`,
    method: 'get',
    headers: {
      Authorization: `Bearer ${token}`
    },
    params: {
      query,
      page,
      size: pageSize
    }
  }).then(response => response.data)
}

export function addMealRecord(date, foodData) {
  return request({
    url: `/${userId}/diet/meals`,
    method: 'post',
    data: {
      date: date.toISOString().split('T')[0],
      ...foodData
    }
  })
}

export function deleteMealRecord(id) {
  return request({
    url: `/${userId}/diet/meals/${mealId}`,
    method: 'delete'
  })
}