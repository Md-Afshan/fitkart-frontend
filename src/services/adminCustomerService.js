import apiClient from './apiClient'

export const getCustomers = async (params = {}) => {
  const response = await apiClient.get(
    '/admin/customers',
    { params }
  )

  return response.data
}
