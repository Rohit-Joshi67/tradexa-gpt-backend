import api, { unwrap } from './client'

export function uploadCsv(file, broker = 'GENERIC') {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('broker', broker)
  return unwrap(
    api.post('/api/v1/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  )
}

