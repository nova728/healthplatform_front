import { ref } from 'vue'
import { searchFood } from '@/api/diet'

export function useFoodSearch() {
  const searchResults = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  const search = async (query) => {
    if (!query) {
      searchResults.value = []
      return
    }

    try {
      isLoading.value = true
      error.value = null
      const data = await searchFood(query)
      searchResults.value = data.foods
    } catch (err) {
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  return {
    searchResults,
    isLoading,
    error,
    search
  }
}