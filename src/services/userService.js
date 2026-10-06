import apiClient from './apiClient'

export const getProfile = async () => {
  const response = await apiClient.get('/users/profile')
  return response.data
}

export const updateProfile = async (data) => {
  const response = await apiClient.put('/users/profile', data)
  return response.data
}

export const changePassword = async (data) => {
  await apiClient.put('/users/password', data)
}
