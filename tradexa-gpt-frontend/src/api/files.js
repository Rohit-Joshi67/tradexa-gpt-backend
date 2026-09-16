import api, { unwrap } from './client'

export function uploadCsv(file) {
  const formData = new FormData()
  formData.append('file', file)
  return unwrap(
    api.post('/api/v1/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  )
}
