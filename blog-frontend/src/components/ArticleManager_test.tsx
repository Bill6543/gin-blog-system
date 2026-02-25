import { useState, useEffect } from 'react'
import { articleApi } from '../api'
import { Article } from '../../types'
import './ArticleManager.css'

interface ArticleManagerProps {
  onEdit?: (article: Article) => void
  onCreate?: () => void
}

const ArticleManagerTest = ({ onEdit, onCreate }: ArticleManagerProps) => {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 10

  useEffect(() => {
    fetchArticles()
  }, [page])

  const fetchArticles = async () => {
    setLoading(true)
    setError('')
    
    try {
      // 测试数据 - 直接使用硬编码数据来验证按钮是否显示
      const testArticles: Article[] = [
        {
          id: 1,
          title: "JWT介绍",
          summary: "这是一个对JWT简单介绍...",
          content: "",
          status: 1,
          view_count: 273,
          like_count: 3,
          comment_count: 7,
          created_at: "2024-01-01T12:00:00Z",
          updated_at: "2024-01-01T12:00:00Z",
          user: { id: 1, username: "Bill", nickname: "Bill", avatar: "" },
          category: { id: 1, name: "技术分享", description: "" },
          tags: [{ id: 1, name: "后端", color: "#667eea" }]
        },
        {
          id: 2,
          title: "Invalidate Caches",
          summary: "解决IDEA胡乱报错...",
          content: "",
          status: 1,
          view_count: 86,
          like_count: 2,
          comment_count: 1,
          created_at: "2024-01-02T12:00:00Z",
          updated_at: "2024-01-02T12:00:00Z",
          user: { id: 1, username: "Bill", nickname: "Bill", avatar: "" },
          category: { id: 2, name: "技术分享", description: "" },
          tags: [{ id: 2, name: "Go语言", color: "#4caf50" }, { id: 3, name: "后端", color: "#667eea" }]
        }
      ]
      
      setArticles(testArticles)
      setLoading(false)
    } catch (err: any) {
      console.error('获取文章失败:', err)
      setError('获取文章列表失败: ' + (err.message || '网络错误'))
      setLoading(false)
    }
  }

  const handleDelete = async (articleId: number) => {
    if (!window.confirm('确定要删除这篇文章吗？')) {
      return
    }
    alert(`删除文章 ${articleId}`)
  }

  const handleStatusChange = async (articleId: number, currentStatus: number) => {
    alert(`更新文章 ${articleId} 状态为: ${currentStatus === 1 ? '草稿' : '发布'}`)
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
        <h2>文章管理 (测试版)</h2>
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
          <span className="stat-number">{articles.length}</span>
          <span className="stat-label">总文章数</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {articles.filter(a => a.status === 1).length}
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
                <td>{article.user.nickname || article.user.username}</td>
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
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => onEdit && onEdit(article)}
                    >
                      编辑
                    </button>
                    <button
                      className="btn btn-sm btn-warning"
                      onClick={() => handleStatusChange(article.id, article.status)}
                    >
                      {article.status === 1 ? '设为草稿' : '发布'}
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(article.id)}
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
    </div>
  )
}

export default ArticleManagerTest