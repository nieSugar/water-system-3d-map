import { get, post } from '../utils/request';

// 接口返回数据类型定义
interface WaterOutageNotice {
  id: number;
  title: string;
  content: string;
  startTime: string;
  endTime: string;
  area: string;
}

interface CallTrafficData {
  id: number;
  customerService: string;
  callCount: number;
  satisfactionRate: number;
}

// 获取停水公告列表
export const getWaterOutageNotices = () => {
  return get<WaterOutageNotice[]>('/water/notices');
};

// 获取话务量数据
export const getCallTrafficData = () => {
  return get<CallTrafficData[]>('/water/call-traffic');
};

// 提交工单
export const submitWorkOrder = (data: {
  type: string;
  description: string;
  address: string;
  contact: string;
}) => {
  return post('/water/work-orders', data);
};