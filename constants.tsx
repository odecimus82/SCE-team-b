
import React from 'react';

// 品牌颜色配置
export const COLORS = {
  primary: '#0ea5e9', // Corsair Blue
  secondary: '#111827', // Black
  accent: '#38bdf8',
};

// 现在的 21 仅作为进度条的一个参考目标值，不再限制报名
export const MAX_CAPACITY_TARGET = 28; 

// 报名截止时间：2025年12月26日 18:00
export const REGISTRATION_DEADLINE = new Date('2025-12-26T18:00:00').getTime();

export const EVENT_DETAILS = {
  date: '2026-01-10',
  location: '东莞松山湖 · 华为溪流背坡村 F区南一门',
  address: '广东省东莞市环湖路9号',
  meetingTime: '09:30',
  itinerary: '09:30 集合大合照 -> 自由游玩 -> 园内午餐 -> 结束返程',
};

// PDF 中的区域列表
export const CAMPUS_ZONES = [
  { id: 'A', name: '牛津' }, { id: 'B', name: '布鲁日' }, { id: 'C', name: '卢森堡' },
  { id: 'D', name: '温德米尔' }, { id: 'E', name: '格拉纳达' }, { id: 'F', name: '巴黎' },
  { id: 'G', name: '维罗纳' }, { id: 'H', name: '克伦诺夫' }, { id: 'J', name: '弗里堡' },
  { id: 'K', name: '勃艮第' }, { id: 'L', name: '海德堡' }, { id: 'M', name: '博洛尼' }
];

// PDF 中的火车线路
export const TRAIN_LINES = [
  { id: '1', route: 'FGHJKLM' },
  { id: '2', route: 'BCDEFGHJKLM' },
  { id: '3', route: 'ABCDEFGHJKLM' }
];

export const CAMPUS_DATA = [
  {
    title: '12大组团：108栋欧式办公楼',
    description: '华为斥资100亿打造的溪流背坡村，完美复刻了12个欧洲经典城市的建筑精髓。从牛津到博洛尼，每一处细节都堪比实景拍摄大片。',
    image: 'https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/349479b1285e49f59261895697723984~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp',
    items: ['复刻12个欧洲名城', '108座办公楼', '科技与艺术交融']
  },
  {
    title: '红色小火车：7.8公里的奇幻轨道',
    description: '园区内运行着复古的红色窄轨小火车。系统设计灵感源自瑞士。小火车穿行于森林与石桥之间，是环游整个“溪村”的最佳方式。',
    image: 'https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0b777a83422a4667a43f888566a505b8~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp', 
    items: ['8:00~18:30 运行', '10分钟一趟', '12座风格站台']
  }
];

export const TEAM_LOGO_SVG = (
  <svg viewBox="0 0 24 24" className="w-10 h-10 fill-sky-500">
    <path d="M4 18c2-1 4-2 4-5 0-3-2-6-2-6s4 1 5 6c0 3-2 4-4 5zm6 0c2-1 4-2 4-5 0-3-2-6-2-6s4 1 5 6c0 3-2 4-4 5zm6 0c2-1 4-2 4-5 0-3-2-6-2-6s4 1 5 6c0 3-2 4-4 5z" />
  </svg>
);
