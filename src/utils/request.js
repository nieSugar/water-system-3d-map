import axios from 'axios';

// 创建 axios 实例
const service = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  }
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 在这里可以添加 token 等认证信息
    const token = localStorage.getItem('token');
    if (config.headers) {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      config.headers['x-userid-header'] = '77800';
      config.headers['x-tenantid-header'] = '654100';
    } 
    return config;
  },
  (error) => {
    console.error('请求错误：', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const { data } = response;
    // 这里可以根据后端的响应结构进行自定义处理
    if (data.code === '100000') {
      return data;
    }
    // 处理其他状态码
    console.error('响应错误：', data.message);
    return Promise.reject(new Error(data.message || '请求失败'));
  },
  (error) => {
    // 处理 HTTP 状态码错误
    let message = '请求失败';
    if (error.response) {
      switch (error.response.status) {
        case 401:
          message = '未授权，请重新登录';
          // 这里可以处理登出逻辑
          break;
        case 403:
          message = '拒绝访问';
          break;
        case 404:
          message = '请求错误，未找到该资源';
          break;
        case 500:
          message = '服务器错误';
          break;
        default:
          message = `连接错误 ${error.response.status}`;
      }
    }
    console.error('响应错误：', message);
    return Promise.reject(error);
  }
);

// 封装 GET 请求
export const get = (url, params) => {
  return service.get(url, { params });
};

// 封装 POST 请求
export const post = (url, data) => {
  return service.post(url, data);
};

// 封装 PUT 请求
export const put = (url, data) => {
  return service.put(url, data);
};

// 封装 DELETE 请求
export const del = (url) => {
  return service.delete(url);
};

export default service;
