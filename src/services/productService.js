import apiClient from './apiClient'

export const getProducts = async (params = {}) => {
  const response = await apiClient.get('/products', { params })
  return response.data
}

export const getProductById = async (id) => {
  const response = await apiClient.get('/products/' + id)
  return response.data
}

export const createProduct = async (data) => {
  const response = await apiClient.post('/products', data)
  return response.data
}

export const updateProduct = async (id, data) => {
  const response = await apiClient.put('/products/' + id, data)
  return response.data
}

export const deleteProduct = async (id) => {
  await apiClient.delete('/products/' + id)
}
