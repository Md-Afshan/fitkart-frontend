import apiClient from './apiClient'

export const getCategories = async () => {
  const response = await apiClient.get('/categories')
  return response.data
}

export const createCategory = async (data) => {
  const response = await apiClient.post('/categories', data)
  return response.data
}

export const updateCategory = async (id, data) => {
  const response = await apiClient.put('/categories/' + id, data)
  return response.data
}

export const deleteCategory = async (id) => {
  await apiClient.delete('/categories/' + id)
}
