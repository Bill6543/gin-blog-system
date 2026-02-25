/**
 * 路径工具函数 - 统一处理静态资源路径
 * 专门解决 /static//static/ 和 /static/static/ 等重复路径问题
 */

export const normalizeStaticPath = (path: string | undefined | null): string => {
  if (!path) return '/static/default_cover.png';
  
  // 如果已经是完整URL，直接返回
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // 清理路径：移除所有开头的斜杠和static前缀
  let normalized = path;
  
  // 移除开头的所有斜杠（包括多个连续斜杠）
  normalized = normalized.replace(/^\/+/, '');
  
  // 移除任何 static/ 前缀（包括可能的多个）
  normalized = normalized.replace(/^static\//, '');
  
  // 移除可能存在的多余路径分隔符
  normalized = normalized.replace(/\/+/g, '/');
  
  // 确保以 static/ 开头
  if (!normalized.startsWith('static/')) {
    normalized = 'static/' + normalized;
  }
  
  // 添加开头斜杠，并确保没有双斜杠
  let result = '/' + normalized;
  // 关键修复：彻底清理双斜杠
  while (result.includes('//')) {
    result = result.replace('//', '/');
  }
  
  return result;
};

/**
 * 专门用于封面图片的路径标准化
 */
export const normalizeCoverUrl = (cover: string | undefined | null): string => {
  return normalizeStaticPath(cover);
};

/**
 * 专门用于用户头像的路径标准化
 */
export const normalizeAvatarUrl = (avatar: string | undefined | null): string => {
  return normalizeStaticPath(avatar);
};