import apiClient from './apiClient'

export const placeOrder = async () => {
  const response = await apiClient.post('/orders')
  return response.data
}

export const getMyOrders = async () => {
  const response = await apiClient.get('/orders')
  return response.data
}

export const getOrderById = async (orderId) => {
  const response = await apiClient.get('/orders/' + orderId)
  return response.data
}
