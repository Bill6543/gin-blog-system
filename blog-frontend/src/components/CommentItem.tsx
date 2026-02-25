import { useState } from 'react';
import { normalizeCoverUrl } from '../utils/pathUtils';
import { CommentResponse } from '../types';

interface CommentItemProps {
  comment: CommentResponse;
  depth?: number;
  onReply?: (parentId: number) => void;
}

const CommentItem = ({ comment, depth = 0, onReply }: CommentItemProps) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  // 计算缩进距离（每级24px）
  const indentStyle = { paddingLeft: `${depth * 24}px` };
  
  // 生成连接线标识（简化版：统一使用 '└─'，确保稳定显示）
  const getConnectionLine = () => {
    if (depth === 0) return '';
    // 根据深度生成连接线
    const lines = [];
    for (let i = 0; i < depth - 1; i++) {
      lines.push('│');
    }
    lines.push('└─');
    return lines.join('');
  };

  // 格式化时间（保持绝对时间格式）
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyContent.trim() && onReply) {
      onReply(comment.id, replyContent);
      // 这里可以触发父组件的回复逻辑
      setReplyContent('');
      setShowReplyForm(false);
    }
  };

  return (
    <div className="comment-item" style={indentStyle}>
      {/* 评论头部：头像 + 用户名 + 时间 */}
      <div className="comment-header">
        {comment.user?.avatar && (
          <img 
            src={normalizeCoverUrl(comment.user.avatar)} 
            alt="评论者头像" 
            className="comment-avatar"
          />
        )}
        <div className="comment-author-info">
          <div className="comment-author-line">
            {/* 连接线标识 */}
            {depth > 0 && (
              <span className="connection-line">{getConnectionLine()}</span>
            )}
            {/* 回复前缀：如果存在父评论 */}
            {comment.parent && (
              <span className="reply-prefix">
                {comment.user?.nickname || comment.user?.username || '匿名用户'}
                {' 回复 @'}{comment.parent.user?.nickname || comment.parent.user?.username}
                {comment.parent.content && ` 的评论 "${comment.parent.content.substring(0, 20)}${comment.parent.content.length > 20 ? '...' : ''}"`}
                :
              </span>
            )}
            {comment.parent ? null : (
              <span className="comment-author-name">
                {comment.user?.nickname || comment.user?.username || '匿名用户'}
              </span>
            )}
            <span className="comment-date">{formatDate(comment.created_at)}</span>
          </div>
        </div>
      </div>

      {/* 评论内容 */}
      <div className="comment-content">
        {comment.parent ? comment.content : comment.content}
      </div>

      {/* 操作按钮区域 */}
      <div className="comment-actions">
        <button 
          className="reply-btn"
          onClick={() => setShowReplyForm(!showReplyForm)}
        >
          回复
        </button>
      </div>

      {/* 回复输入框（可选） */}
      {showReplyForm && (
        <div className="reply-form">
          <form onSubmit={handleReplySubmit}>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="写下你的回复..."
              rows={2}
              className="reply-textarea"
            />
            <div className="reply-buttons">
              <button type="submit" className="reply-submit-btn">
                发送
              </button>
              <button 
                type="button" 
                className="reply-cancel-btn"
                onClick={() => setShowReplyForm(false)}
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 子评论递归渲染 */}
      {comment.children && comment.children.length > 0 && (
        <div className="sub-comments">
          {comment.children.map(child => (
            <CommentItem 
              key={child.id} 
              comment={child} 
              depth={depth + 1}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentItem;