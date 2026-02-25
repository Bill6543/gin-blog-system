import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { articleApi, commentApi } from '../api'
import { Article, CommentResponse } from '../types'
import { generateTestData } from '../utils/testData'
import './ArticleDetail.css'
import { useAuth } from '../hooks/useAuth'

import { normalizeCoverUrl } from '../utils/pathUtils';
import CommentItem from '../components/CommentItem';

// 已移至 utils/pathUtils.ts

const ArticleDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()  // 确保 navigate 被正确声明
  
  // 强制验证文章ID
  useEffect(() => {
    if (!id || isNaN(Number(id)) || Number(id) <= 0) {
      console.error('无效的文章ID:', id);
      // 如果ID无效，重定向到文章列表
      navigate('/', { replace: true });
    }
  }, [id, navigate]);
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [comments, setComments] = useState<CommentResponse[]>([])
  const [commentText, setCommentText] = useState('')
  // 新增：用户点赞状态管理
  const [userLiked, setUserLiked] = useState(false)
  const { isAuthenticated, user } = useAuth()

  // 固定间隔状态同步钩子 - 每10秒检查一次
  useEffect(() => {
    if (article && isAuthenticated && user) {
      let intervalId: NodeJS.Timeout | null = null;
      
      // 状态检查核心函数
      const checkAndSyncStatus = async () => {
        try {
          console.log(`[${new Date().toLocaleTimeString()}] 执行点赞状态检查 (固定间隔: 10000ms)`);
          if (!article?.id) return;
          const response = await articleApi.checkUserLiked(article.id);
          if (response.data.code === 200) {
            const serverStatus = response.data.data.is_liked;
            // 只有状态真正改变时才更新UI
            if (serverStatus !== userLiked) {
              console.log(`状态变更: ${userLiked} -> ${serverStatus}`);
              setUserLiked(serverStatus);
            }
          }
        } catch (err) {
          console.warn('状态同步失败，使用保守策略:', err);
          // 容错处理：根据文章数据和用户信息智能推断
          const inferredStatus = article.like_count > 0 && article.user_id === user.id;
          if (inferredStatus !== userLiked) {
            setUserLiked(inferredStatus);
          }
        }
      };
      
      // 立即执行首次检查
      checkAndSyncStatus();
      
      // 设置固定10秒间隔的定时器
      intervalId = setInterval(checkAndSyncStatus, 10000);
      
      // 清理函数
      return () => {
        if (intervalId) {
          clearInterval(intervalId);
        }
      };
    }
  }, [article, isAuthenticated, user]);

  // 确保 handleBack 函数被正确定义
  const handleBack = () => {
    navigate('/')
  }

  useEffect(() => {
    if (id && !isNaN(Number(id))) {
      // 使用防抖避免 Strict Mode 的重复调用
      const timer = setTimeout(() => {
        fetchArticle(Number(id));
      }, 0);
      
      return () => clearTimeout(timer);
    } else {
      setError('无效的文章ID');
      setLoading(false);
    }
  }, [id])

  const fetchArticle = async (articleId: number | string) => {
    // 确保 articleId 是有效数字
    const validId = typeof articleId === 'string' ? Number(articleId) : articleId;
    if (isNaN(validId) || validId <= 0) {
      setError('无效的文章ID');
      setLoading(false);
      return;
    }
    setLoading(true)
    setError('')
    
    try {
      // 先尝试调用真实API
      const response = await articleApi.getArticleById(articleId)
      
      if (response.data.code === 200) {
        const fetchedArticle = response.data.data
        setArticle(fetchedArticle)
        
        // 加载评论列表
        try {
          const commentsResponse = await commentApi.getArticleComments(fetchedArticle.id);
          if (commentsResponse.data.code === 200) {
            const flatComments = commentsResponse.data.data.comments || [];
            // 转换为树形结构
            const treeComments = buildCommentTree(flatComments);
            setComments(treeComments);
          } else {
            console.warn('获取评论列表失败:', commentsResponse.data.msg);
            setComments([]);
          }
        } catch (commentsErr) {
          console.error('加载评论列表异常:', commentsErr);
          setComments([]);
        }
        
        // 检查当前用户是否已点赞（仅在用户登录时检查）
        if (isAuthenticated && user && fetchedArticle.id) {
          try {
            // 尝试调用检查点赞状态的API
            if (!fetchedArticle?.id) return;
        const likeStatusResponse = await articleApi.checkUserLiked(fetchedArticle.id)
            if (likeStatusResponse.data.code === 200) {
              setUserLiked(likeStatusResponse.data.data.is_liked)
            }
          } catch (err) {
            console.warn('检查点赞状态失败，采用智能容错策略')
            // 容错策略：根据文章数据和用户信息智能推断状态
            // 如果文章有赞数且当前用户存在，先假设为未点赞，但添加重试机制
            const shouldAssumeLiked = fetchedArticle.like_count > 0 && 
                                 user && 
                                 fetchedArticle.user_id === user.id;
            setUserLiked(shouldAssumeLiked);
                    
            // 添加1秒后重试机制
            setTimeout(async () => {
              try {
                const retryResponse = await articleApi.checkUserLiked(fetchedArticle.id)
                if (retryResponse.data.code === 200) {
                  setUserLiked(retryResponse.data.data.is_liked)
                }
              } catch (retryErr) {
                console.error('重试状态检查仍失败:', retryErr)
              }
            }, 1000)
          }
        }
      } else {
        throw new Error(response.data.msg || '获取文章详情失败')
      }
    } catch (err: any) {
      console.log('API调用失败，使用测试数据:', err.message)
      // 使用测试数据
      const { testArticles } = generateTestData()
      const foundArticle = testArticles.find(a => a.id === articleId)
      if (foundArticle) {
        setArticle(foundArticle)
        // 测试数据中默认不设置点赞状态
        setUserLiked(false)
      } else {
        setError('文章不存在')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    console.log('[handleLike] 开始执行点赞操作');
    console.log('[handleLike] 当前文章数据:', article);
    console.log('[handleLike] 当前点赞状态:', userLiked);
    console.log('[handleLike] 文章ID:', article?.id);
    
    if (!article || !article.id) {
      console.error('[handleLike] 文章数据无效，无法执行点赞操作');
      return;
    }
    
    try {
      // 在执行操作前，先强制检查当前状态
      if (isAuthenticated && user && article.id) {
        try {
          if (!article?.id) return;
        const likeStatusResponse = await articleApi.checkUserLiked(article.id)
          if (likeStatusResponse.data.code === 200) {
            const isLiked = likeStatusResponse.data.data.is_liked;
            // 如果状态不一致，自动修正
            if (isLiked !== userLiked) {
              console.log('状态不一致，自动修正:', { expected: isLiked, current: userLiked });
              setUserLiked(isLiked);
              // 如果是已点赞状态，但按钮显示为点赞，说明需要重新渲染
              if (isLiked && !userLiked) {
                // 强制重新获取文章数据以同步状态
                if (!article?.id) return;
        const freshArticle = await articleApi.getArticleById(article.id);
                if (freshArticle.data.code === 200) {
                  setArticle(freshArticle.data.data);
                }
              }
            }
          }
        } catch (checkErr) {
          console.warn('强制状态检查失败:', checkErr);
        }
      }

      if (userLiked) {
        // 取消点赞：调用 DELETE 接口
        const response = await articleApi.unlikeArticle(article.id)
        if (response.data.code === 200) {
          console.log('[handleLike] 取消点赞成功，返回数据:', response.data.data);
          // 确保正确更新文章数据
          const updatedArticle = {
            ...article,
            like_count: response.data.data.like_count || (article.like_count - 1),
            ...(response.data.data || {})
          };
          setArticle(updatedArticle);
          setUserLiked(false); // 更新状态为未点赞
          console.log('[handleLike] 更新后文章数据:', updatedArticle);
        }
      } else {
        // 点赞：调用 POST 接口
        const response = await articleApi.likeArticle(article.id)
        if (response.data.code === 200) {
          console.log('[handleLike] 点赞成功，返回数据:', response.data.data);
          // 确保正确更新文章数据
          const updatedArticle = {
            ...article,
            like_count: response.data.data.like_count || (article.like_count + 1),
            ...(response.data.data || {})
          };
          setArticle(updatedArticle);
          setUserLiked(true); // 更新状态为已点赞
          console.log('[handleLike] 更新后文章数据:', updatedArticle);
        }
      }
    } catch (err: any) {
      console.error('操作失败:', err)
      // 错误处理：恢复之前的状态
      if (userLiked) {
        setUserLiked(true) // 如果取消点赞失败，保持已点赞状态
      } else {
        setUserLiked(false) // 如果点赞失败，保持未点赞状态
      }
    }
  }

  // 构建评论树形结构并按时间倒序排序
  const buildCommentTree = (flatComments: CommentResponse[]): CommentResponse[] => {
    const commentMap = new Map<number, CommentResponse>();
    const rootComments: CommentResponse[] = [];
    
    // 首先建立映射关系
    flatComments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, children: [] });
    });
    
    // 构建父子关系
    flatComments.forEach(comment => {
      const commentNode = commentMap.get(comment.id)!;
      if (comment.parent_id && commentMap.has(comment.parent_id)) {
        // 是子评论，添加到父评论的children中
        const parent = commentMap.get(comment.parent_id)!;
        parent.children = parent.children || [];
        parent.children.push(commentNode);
      } else {
        // 是根评论
        rootComments.push(commentNode);
      }
    });
    
    // 对根评论按时间倒序排序
    rootComments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    // 递归对子评论排序
    const sortChildren = (comments: CommentResponse[]) => {
      comments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      comments.forEach(comment => {
        if (comment.children && comment.children.length > 0) {
          sortChildren(comment.children);
        }
      });
    };
    
    sortChildren(rootComments);
    
    return rootComments;
  };

  // 处理添加评论
  const handleAddComment = async (parentId?: number) => {
    if (!article || !commentText.trim()) return
    
    try {
      // 调用后端API创建评论
      const response = await commentApi.createComment({
        content: commentText,
        article_id: article.id,
        parent_id: parentId
      })
      
      if (response.data.code === 200) {
        // 创建评论成功后，重新获取文章详情以更新评论计数
        const articleResponse = await articleApi.getArticleById(article.id)
        if (articleResponse && articleResponse.data && articleResponse.data.code === 200) {
          setArticle(articleResponse.data.data)
        }
        
        // 重新加载评论列表
        const commentsResponse = await commentApi.getArticleComments(article.id)
        if (commentsResponse.data.code === 200) {
          const flatComments = commentsResponse.data.data.comments || [];
          const treeComments = buildCommentTree(flatComments);
          setComments(treeComments);
        }
        
        // 清空输入框
        setCommentText('')
      } else {
        throw new Error(response.data.msg || '创建评论失败')
      }
    } catch (err: any) {
      console.error('添加评论失败:', err)
      alert('添加评论失败: ' + (err.message || '未知错误'))
    }
  }

  // 处理回复评论
  const handleReplyComment = async (parentId: number, content: string) => {
    if (!article) return;
    
    try {
      const response = await commentApi.createComment({
        content: content,
        article_id: article.id,
        parent_id: parentId
      });
      
      if (response.data.code === 200) {
        // 重新加载评论列表以显示新回复
        const commentsResponse = await commentApi.getArticleComments(article.id);
        if (commentsResponse.data.code === 200) {
          const flatComments = commentsResponse.data.data.comments || [];
          const treeComments = buildCommentTree(flatComments);
          setComments(treeComments);
        }
      } else {
        throw new Error(response.data.msg || '回复评论失败');
      }
    } catch (err: any) {
      console.error('回复评论失败:', err);
      alert('回复评论失败: ' + (err.message || '未知错误'));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="article-detail-container">
        <button onClick={handleBack} className="back-button" style={{ position: 'fixed', top: '20px', left: '20px', zIndex: 1000 }}>
          ← 返回文章列表
        </button>
        <div className="loading">加载文章中...</div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="article-detail-container">
        <button onClick={handleBack} className="back-button" style={{ position: 'fixed', top: '20px', left: '20px', zIndex: 1000 }}>
          ← 返回文章列表
        </button>
        <div className="error-message">
          {error || '文章不存在'}
          <button onClick={handleBack} className="back-button">
            返回文章列表
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="article-detail-container" style={{
      minHeight: '100vh',
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch',
      position: 'relative',
      paddingTop: '100px',
      height: '100vh'
    }}>
      {/* 添加固定位置的返回按钮，确保始终可见 */}
      <button 
        onClick={handleBack} 
        className="back-button"
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          zIndex: 1000,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: '500',
          fontSize: '14px',
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
        }}
      >
        ← 返回文章列表
      </button>

      <article className="article-detail">
        <header className="article-header">
          <h1 className="article-title">{article.title}</h1>
          
          {article.cover && (
            <div className="article-cover">
              <img src={normalizeCoverUrl(article.cover)} alt={article.title} />
            </div>
          )}
          
          <div className="article-meta">
            <div className="author-info">
              <span className="author-name">
                作者：{article?.user?.nickname || article?.user?.username || '未知用户'}
              </span>
              {article?.user?.avatar && (
                <img 
                  src={normalizeCoverUrl(article.user.avatar)} 
                  alt="作者头像" 
                  className="author-avatar"
                />
              )}
            </div>
            
            <div className="publish-info">
              <span className="publish-date">
                发布时间：{formatDate(article.created_at)}
              </span>
              {article.category && (
                <span className="category">
                  分类：{article.category.name}
                </span>
              )}
            </div>
          </div>
        </header>

        <div className="article-content">
          <div 
            className="markdown-content"
            dangerouslySetInnerHTML={{ __html: formatMarkdown(article.content) }}
          />
        </div>

        <footer className="article-footer">
          {article.tags && article.tags.length > 0 && (
            <div className="article-tags">
              <h3>标签：</h3>
              <div className="tags-list">
                {article.tags.map(tag => (
                  <span 
                    key={tag.id} 
                    className="tag"
                    style={{ backgroundColor: tag.color }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="article-stats">
            <div className="stat-item">
              <span className="stat-label">浏览量</span>
              <span className="stat-value">{article.view_count}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">点赞数</span>
              <span className="stat-value">{article.like_count}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">评论数</span>
              <span className="stat-value">{article.comment_count}</span>
            </div>
          </div>

          <div className="article-actions">
            <button 
              onClick={handleLike}
              className={`like-button ${userLiked ? 'liked' : ''}`}
              disabled={loading || !isAuthenticated}
            >
              {userLiked ? (
                <>
                  ❤️ 已点赞 ({article?.like_count ?? 0})
                </>
              ) : (
                <>
                  ❤️ 点赞 ({article?.like_count ?? 0})
                </>
              )}
            </button>

          </div>

          {/* 评论区域 */}
          <div className="comments-section">
            <h3>评论 ({comments.length})</h3>
            <div className="comment-form">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="写下你的评论..."
                rows={3}
                className="comment-textarea"
              />
              <button 
                onClick={() => handleAddComment()} 
                disabled={!commentText.trim()}
                className="comment-submit-btn"
              >
                发表评论
              </button>
            </div>
            <div className="comments-list">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  depth={0}
                  onReply={handleReplyComment}
                  currentUser={user}
                />
              ))}
            </div>
          </div>
        </footer>
      </article>
    </div>
  )
}

// 简单的Markdown格式化函数
const formatMarkdown = (content: string | undefined | null) => {
  if (!content) return '';
  return content
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^\*\*(.*)\*\*/gm, '<strong>$1</strong>')
    .replace(/^\*(.*)\*/gm, '<em>$1</em>')
    .replace(/`(.*?)`/gm, '<code>$1</code>')
    .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
    .replace(/^\- (.*$)/gm, '<li>$1</li>')
    .replace(/<li>(.*)<\/li>/gs, '<ul>$&</ul>')
    .replace(/\n/g, '<br>')
}

export default ArticleDetail