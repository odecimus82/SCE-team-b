
import React from 'react';

// 品牌颜色配置
export const COLORS = {
  primary: '#0ea5e9', // Corsair Blue
  secondary: '#111827', // Black
  accent: '#38bdf8',
};

export const MAX_CAPACITY = 21; 

// 报名截止时间：2025年12月26日 18:00
export const REGISTRATION_DEADLINE = new Date('2025-12-26T18:00:00').getTime();

export const EVENT_DETAILS = {
  date: '2026-01-10',
  location: '东莞松山湖 · 华为溪流背坡村 (Ox Horn Village)',
  itinerary: '上午 9:00 - 下午 2:00',
};

/**
 * 图片优化加速器
 * 优先使用国内高速 CDN 节点，并进行 WebP 压缩处理
 */
const optimizeImage = (url: string, width: number = 1000) => 
  `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=${width}&output=webp&q=80&fit=cover`;

export const TOWNS_LIST = [
  { name: '牛津区', style: '学院哥特式', description: '参考牛津大学建筑，尽显学术氛围与古朴之美。' },
  { name: '布鲁日区', style: '比利时水城风格', description: '标志性的阶梯式山墙，如同童话世界中的巧克力小镇。' },
  { name: '海德堡区', style: '德国大学城', description: '经典的红砂岩城堡风格，是园区内最显眼的地标。' },
  { name: '巴黎区', style: '法国奥斯曼风格', description: '参考巴黎大改造时期的建筑，充满都市的现代感与奢华。' },
  { name: '维罗纳区', style: '意大利浪漫古城', description: '以圆形剧场与古城墙为特色，洋溢着浪漫气息。' },
  { name: '博洛尼亚区', style: '意大利连续拱廊', description: '漫长的步行拱廊，展现了意大利北部的建筑逻辑。' },
  { name: '克伦洛夫区', style: '捷克波西米亚', description: '橙红色的屋顶与圆塔，还原了东欧古城的梦幻色彩。' },
  { name: '卢森堡区', style: '欧洲堡垒建筑', description: '拥有坚固的石质外墙，充满中世纪防御工事的威严感。' },
  { name: '勃艮第区', style: '法国红酒文化', description: '以法国勃艮第地区的酒庄建筑为灵感，色彩温暖且充满质感。' },
  { name: '温德米尔区', style: '英国湖区田园', description: '复刻英国最大的湖泊区风情，石墙与自然景观交织。' },
  { name: '弗里堡区', style: '瑞士中世纪', description: '展现瑞士古城的错落有致，以木质结构与石材结合为特色。' },
  { name: '格拉纳达区', style: '西班牙风情', description: '伊斯兰风格与欧洲审美交汇，装饰极其精美。' }
];

export const CAMPUS_DATA = [
  {
    title: '12大组团：108栋欧式办公楼',
    description: '华为斥资100亿打造的溪流背坡村（Ox Horn Village），完美复刻了12个欧洲经典城市的建筑精髓。108栋办公楼在松山湖的湖光山色间交错，每一处细节都堪比实景拍摄大片，是科技与艺术交织的巅峰之作。',
    image: 'https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/349479b1285e49f59261895697723984~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp',
    items: ['占地约1900亩', '复刻12个欧洲名城', '108座精美办公楼', '科技与艺术的交融']
  },
  {
    title: '红色小火车：7.8公里的奇幻轨道',
    description: '园区内运行着复古的红色窄轨小火车，系统设计灵感源自瑞士。小火车穿行于森林、石桥与古老的欧洲建筑群之间，不仅是内部交通工具，更是环游整个“溪村”的最佳摄影机位。',
    // 使用与用户上传图片一致的华为园区小火车实景图，来自高速 ByteDance CDN
    image: 'https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0b777a83422a4667a43f888566a505b8~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp', 
    items: ['全长7.8公里', '12座风格站台', '瑞士窄轨技术', '30分钟环园一周']
  },
  {
    title: '餐饮体验：海德堡与巴黎餐厅',
    description: '园区内的餐厅极具仪式感。无论是海德堡区的宏大中庭，还是巴黎区的法式优雅，这里的餐饮环境达到了国际五星级标准。在松山湖畔享用午宴，是团建中最具仪式感的环节。',
    image: 'https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/22d5b62e49c14811905814036f019050~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp',
    items: ['五星级餐饮标准', '全球美食体验', '湖景景观位', '浓郁艺术氛围']
  }
];

// Corsair (SCE) Logo - 优化 SVG 结构，确保直接渲染
export const TEAM_LOGO_SVG = (
  <svg viewBox="0 0 24 24" className="w-10 h-10 fill-sky-500">
    <path d="M4 18c2-1 4-2 4-5 0-3-2-6-2-6s4 1 5 6c0 3-2 4-4 5zm6 0c2-1 4-2 4-5 0-3-2-6-2-6s4 1 5 6c0 3-2 4-4 5zm6 0c2-1 4-2 4-5 0-3-2-6-2-6s4 1 5 6c0 3-2 4-4 5z" />
  </svg>
);
