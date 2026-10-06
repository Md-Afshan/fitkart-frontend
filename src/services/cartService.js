import apiClient from './apiClient'

const notifyCartUpdated = () => {
  window.dispatchEvent(new Event('fitkart-cart-updated'))
}

export const getCart = async () => {
  const response = await apiClient.get('/cart')
  return response.data
}

export const addCartItem = async (data) => {
  const response = await apiClient.post('/cart/items', data)
  notifyCartUpdated()
  return response.data
}

export const updateCartItem = async (itemId, data) => {
  const response = await apiClient.put(
    '/cart/items/' + itemId,
    data
  )

  notifyCartUpdated()
  return response.data
}

export const removeCartItem = async (itemId) => {
  await apiClient.delete('/cart/items/' + itemId)
  notifyCartUpdated()
}

export const clearCart = async () => {
  await apiClient.delete('/cart')
  notifyCartUpdated()
}
