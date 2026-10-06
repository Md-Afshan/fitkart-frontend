import apiClient from './apiClient'

export const getProductImages = async (productId) => {
  const response = await apiClient.get(
    '/product-images/product/' + productId
  )

  return response.data
}

export const getProductImageById = async (id) => {
  const response = await apiClient.get(
    '/product-images/' + id
  )

  return response.data
}

export const addProductImage = async ({
  file,
  productId,
  isPrimary = false,
}) => {
  const formData = new FormData()

  formData.append('file', file)
  formData.append('productId', productId)
  formData.append('isPrimary', isPrimary)

  const response = await apiClient.post(
    '/product-images',
    formData
  )

  return response.data
}

export const deleteProductImage = async (id) => {
  await apiClient.delete(
    '/product-images/' + id
  )
}
