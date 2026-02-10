import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { articleApi } from '../api'
import { Article } from '../types'
import { generateTestData } from '../utils/testData'
import './ArticleList.css'

// 路径标准化函数：处理后端返回的cover路径（当前格式：2026/02/07/xxx.png）
const normalizeCoverUrl = (cover: string): string => {
  // 如果已经是完整URL，直接返回
  if (cover.startsWith('http://') || cover.startsWith('https://')) {
    return cover;
  }
  // 如果以/static/开头，直接使用
  if (cover.startsWith('/static/')) {
    return cover;
  }
  // 如果是日期格式路径（如 2026/02/07/xxx.png），添加/static前缀
  if (/^\d{4}\/\d{2}\/\d{2}\//.test(cover)) {
    return `/static/${cover}`;
  }
  // 默认情况：添加/static前缀
  return `/static/${cover}`;
};

const ArticleList = () => {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 10
  
  const navigate = useNavigate()

  console.log('ArticleList组件渲染，当前状态:', { 
    articles: articles.length, 
    loading, 
    page, 
    total 
  })

  useEffect(() => {
    console.log('useEffect触发，准备调用fetchArticles')
    fetchArticles()
  }, [page, pageSize])

  const fetchArticles = async () => {
    setLoading(true)
    setError('')
    
    try {
      console.log('开始调用文章列表API...')
      // 先尝试调用真实API
      const response = await articleApi.getArticles({ page, page_size: pageSize })
      
      console.log('API响应:', response)
      
      if (response.data.code === 200) {
        console.log('API调用成功，获取到真实数据:', response.data.data.articles)
        setArticles(response.data.data.articles)
        setTotal(response.data.data.total)
      } else {
        throw new Error(response.data.msg || '获取文章列表失败')
      }
    } catch (err: any) {
      console.error('API调用失败:', err)
      console.log('使用测试数据作为回退方案')
      // 使用测试数据
      const { testArticles } = generateTestData()
      setArticles(testArticles)
      setTotal(testArticles.length)
    } finally {
      setLoading(false)
    }
  }

  const handleArticleClick = (articleId: number) => {
    navigate(`/article/${articleId}`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const renderPagination = () => {
    const totalPages = Math.ceil(total / pageSize)
    if (totalPages <= 1) return null

    return (
      <div className="pagination">
        <button 
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="pagination-btn"
        >
          上一页
        </button>
        
        <span className="pagination-info">
          第 {page} 页，共 {totalPages} 页
        </span>
        
        <button 
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="pagination-btn"
        >
          下一页
        </button>
      </div>
    )
  }

  if (loading && articles.length === 0) {
    return (
      <div className="article-list-container">
        <div className="loading">加载文章中...</div>
      </div>
    )
  }

  if (error && articles.length === 0) {
    return (
      <div className="article-list-container">
        <div className="error-message">{error}</div>
      </div>
    )
  }

  return (
    <div className="article-list-container">
      <div className="article-list-header">
        <h1>文章列表</h1>
        <p>共有 {total} 篇文章</p>
      </div>

      <div className="article-list">
        {articles.map(article => (
          <div 
            key={article.id} 
            className="article-item"
            onClick={() => handleArticleClick(article.id)}
          >
            {article.cover && (
              <div className="article-cover">
                <img src={normalizeCoverUrl(article.cover)} alt={article.title} />
              </div>
            )}
            
            <div className="article-content">
              <h2 className="article-title">{article.title}</h2>
              
              <p className="article-summary">{article.summary}</p>
              
              <div className="article-meta">
                <div className="article-author">
                  作者：{article.user.nickname || article.user.username}
                </div>
                <div className="article-date">
                  {formatDate(article.created_at)}
                </div>
              </div>
              
              <div className="article-stats">
                <span className="stat-item">
                  👁️ {article.view_count}
                </span>
                <span className="stat-item">
                  ❤️ {article.like_count}
                </span>
                <span className="stat-item">
                  💬 {article.comment_count}
                </span>
              </div>
              
              {article.tags && article.tags.length > 0 && (
                <div className="article-tags">
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
              )}
            </div>
          </div>
        ))}
      </div>

      {renderPagination()}
    </div>
  )
}

export default ArticleList