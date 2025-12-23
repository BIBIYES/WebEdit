import axios from 'axios'
const AUTH_STORAGE_KEY = 'sandbox_auth_key'
const request = axios.create({
  baseURL: import.meta.env.VITE_PROXY_BASE_URL || 'https://bytecourt.cn-hongkong.kitasoda.com',
  timeout: 20000,
})

// Add a request interceptor
request.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    const authKey = localStorage.getItem(AUTH_STORAGE_KEY)
    if (authKey) {
      config.headers['x-auth'] = authKey
    }
    return config
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error)
  },
)

// Add a response interceptor
request.interceptors.response.use(
  function onFulfilled(response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response
  },
  function onRejected(error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return Promise.reject(error)
  },
)

export default request
