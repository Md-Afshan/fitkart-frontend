import apiClient from './apiClient'

export const getAllOrders = async (params = {}) => {
  const response = await apiClient.get('/admin/orders', { params })
  return response.data
}

export const updateOrderStatus = async (orderId, data) => {
  const response = await apiClient.put('/admin/orders/' + orderId + '/status', data)
  return response.data
}
