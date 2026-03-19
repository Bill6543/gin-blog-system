import { useState, useEffect } from 'react'
import { articleApi } from '../api'
import { Article } from '../../types'
import './ArticleManager.css'

interface ArticleManagerProps {
  onEdit?: (article: Article) => void
  onCreate?: () => void
}

const ArticleManager = ({ onEdit, onCreate }: ArticleManagerProps) => {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 10

  useEffect(() => {
    fetchArticles()
    
    // 监听文章更新事件
    const handleArticleUpdated = () => {
      fetchArticles()
    }
    
    window.addEventListener('articleUpdated', handleArticleUpdated)
    
    // 清理事件监听器
    return () => {
      window.removeEventListener('articleUpdated', handleArticleUpdated)
    }
  }, [page])

  const fetchArticles = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await articleApi.getArticles({ page, page_size: pageSize })
      
      if (response.data.code === 200) {
        setArticles(response.data.data.articles)
        setTotal(response.data.data.total)
      } else {
        throw new Error(response.data.msg || '获取文章列表失败')
      }
    } catch (err: any) {
      console.error('获取文章失败:', err)
      setError('获取文章列表失败: ' + (err.message || '网络错误'))
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (articleId: number) => {
    if (!window.confirm('确定要删除这篇文章吗？')) {
      return
    }

    try {
      const response = await articleApi.deleteArticle(articleId)
      if (response.data.code === 200) {
        // 成功后刷新列表
        fetchArticles()
        alert('文章删除成功')
      } else {
        throw new Error(response.data.msg || '删除失败')
      }
    } catch (err: any) {
      console.error('删除文章失败:', err)
      alert('删除失败: ' + (err.message || '未知错误'))
    }
  }

  const handleStatusChange = async (articleId: number, currentStatus: number) => {
    try {
      // 计算新的状态值：如果当前是已发布(1)，则设为草稿(0)；如果当前是草稿(0)，则设为发布(1)
      const newStatus = currentStatus === 1 ? 0 : 1;
      
      // 调用更新文章API，只更新状态字段
      const response = await articleApi.updateArticle(articleId, { status: newStatus });
      
      if (response.data.code === 200) {
        // 成功后刷新列表
        fetchArticles();
        alert(`文章状态已更新为: ${newStatus === 1 ? '已发布' : '草稿'}`);
      } else {
        throw new Error(response.data.msg || '状态更新失败');
      }
    } catch (err: any) {
      console.error('更新状态失败:', err);
      alert('状态更新失败: ' + (err.message || '未知错误'));
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusText = (status: number) => {
    return status === 1 ? '已发布' : '草稿'
  }

  const getStatusClass = (status: number) => {
    return status === 1 ? 'status-published' : 'status-draft'
  }

  if (loading && articles.length === 0) {
    return (
      <div className="article-manager">
        <div className="loading">加载中...</div>
      </div>
    )
  }

  if (error && articles.length === 0) {
    return (
      <div className="article-manager">
        <div className="error-message">{error}</div>
      </div>
    )
  }

  return (
    <div className="article-manager">
      {/* 操作栏 */}
      <div className="manager-header">
        <h2>文章管理</h2>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={onCreate}
          >
            ✨ 新建文章
          </button>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-number">{total}</span>
          <span className="stat-label">总文章数</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {articles.filter(a => a.status === 1 || a.status == null).length}
          </span>
          <span className="stat-label">已发布</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {articles.filter(a => a.status === 0).length}
          </span>
          <span className="stat-label">草稿</span>
        </div>
      </div>

      {/* 文章表格 */}
      <div className="table-container">
        <table className="articles-table">
          <thead>
            <tr>
              <th>标题</th>
              <th>作者</th>
              <th>分类</th>
              <th>标签</th>
              <th>浏览量</th>
              <th>点赞数</th>
              <th>评论数</th>
              <th>状态</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {articles.map(article => (
              <tr key={article.id}>
                <td className="title-cell">
                  <div className="article-title-preview">
                    {article.title}
                  </div>
                  {article.summary && (
                    <div className="article-summary">
                      {article.summary.substring(0, 50)}...
                    </div>
                  )}
                </td>
                <td>{article.user?.nickname || article.user?.username || '-'}</td>
                <td>{article.category?.name || '-'}</td>
                <td>
                  <div className="tags-cell">
                    {article.tags?.slice(0, 3).map(tag => (
                      <span 
                        key={tag.id} 
                        className="tag-badge"
                        style={{ backgroundColor: tag.color }}
                      >
                        {tag.name}
                      </span>
                    ))}
                    {article.tags && article.tags.length > 3 && (
                      <span className="more-tags">+{article.tags.length - 3}</span>
                    )}
                  </div>
                </td>
                <td>{article.view_count}</td>
                <td>{article.like_count}</td>
                <td>{article.comment_count}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(article.status)}`}>
                    {getStatusText(article.status)}
                  </span>
                </td>
                <td>{formatDate(article.created_at)}</td>
                <td style={{ width: '180px', minWidth: '180px', paddingRight: '20px' }}>
                  <div className="action-buttons" style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => onEdit && onEdit(article)}
                      style={{ flex: '1', minWidth: '50px' }}
                    >
                      编辑
                    </button>
                    <button
                      className="btn btn-sm btn-warning"
                      onClick={() => handleStatusChange(article.id, article.status)}
                      style={{ flex: '1', minWidth: '70px' }}
                    >
                      {article.status === 1 || article.status == null ? '设为草稿' : '发布'}
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(article.id)}
                      style={{ flex: '1', minWidth: '50px' }}
                    >
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      {total > pageSize && (
        <div className="pagination-controls">
          <button 
            className="btn btn-secondary"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            上一页
          </button>
          <span className="page-info">
            第 {page} 页，共 {Math.ceil(total / pageSize)} 页
          </span>
          <button 
            className="btn btn-secondary"
            onClick={() => setPage(p => Math.min(Math.ceil(total / pageSize), p + 1))}
            disabled={page === Math.ceil(total / pageSize)}
          >
            下一页
          </button>
        </div>
      )}
    </div>
  )
}

export default ArticleManager