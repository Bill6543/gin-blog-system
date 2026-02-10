import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import ArticleManager from '../components/ArticleManager'
import ArticleEditor from '../components/ArticleEditor'
import { Article } from '../types'
import './AdminDashboard.css'

const AdminDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('articles')
  const [showEditor, setShowEditor] = useState(false)
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)
  const [isHovered, setIsHovered] = useState(false)

  // 检查用户权限
  if (!user) {
    navigate('/login')
    return null
  }

  const handleEditArticle = (article: Article) => {
    setEditingArticle(article)
    setShowEditor(true)
  }

  const handleCreateArticle = () => {
    setEditingArticle(null)
    setShowEditor(true)
  }

  const handleSaveArticle = async (articleData: Partial<Article>) => {
    try {
      if (editingArticle) {
        // 编辑文章
        await articleApi.updateArticle(editingArticle.id, articleData)
        alert('文章更新成功！')
      } else {
        // 创建文章
        await articleApi.createArticle(articleData)
        alert('文章创建成功！')
      }
      setShowEditor(false)
      setEditingArticle(null)
      // 刷新文章列表
      window.location.reload()
    } catch (err: any) {
      throw new Error(err.message || '操作失败')
    }
  }

  const handleCloseEditor = () => {
    setShowEditor(false)
    setEditingArticle(null)
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'articles':
        return (
          <ArticleManager 
            onEdit={handleEditArticle}
            onCreate={handleCreateArticle}
          />
        )
      case 'categories':
        return (
          <div className="tab-content">
            <h2>分类管理</h2>
            <p>这里将显示分类管理功能</p>
          </div>
        )
      case 'tags':
        return (
          <div className="tab-content">
            <h2>标签管理</h2>
            <p>这里将显示标签管理功能</p>
          </div>
        )
      case 'stats':
        return (
          <div className="tab-content">
            <h2>数据统计</h2>
            <p>这里将显示统计数据</p>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="admin-dashboard">
      {/* 顶部导航 */}
      <nav 
        className="admin-nav"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.3s ease'
        }}
      >
        <div className="nav-brand">
          <h1>博客管理系统</h1>
        </div>
        <div className="nav-user">
          <span>欢迎，{user?.nickname || user?.username}</span>
          <button 
            onClick={() => navigate('/admin')}
            className="btn btn-secondary"
          >
            管理后台
          </button>
          <button 
            onClick={() => navigate('/')}
            className="btn btn-primary"
          >
            返回文章列表
          </button>
        </div>
      </nav>

      {/* 主要内容区域 */}
      <div className="admin-main">
        {/* 侧边栏菜单 */}
        <aside className="sidebar">
          <ul className="nav-menu">
            <li>
              <button
                className={`nav-item ${activeTab === 'articles' ? 'active' : ''}`}
                onClick={() => setActiveTab('articles')}
              >
                📝 文章管理
              </button>
            </li>
            <li>
              <button
                className={`nav-item ${activeTab === 'categories' ? 'active' : ''}`}
                onClick={() => setActiveTab('categories')}
              >
                📂 分类管理
              </button>
            </li>
            <li>
              <button
                className={`nav-item ${activeTab === 'tags' ? 'active' : ''}`}
                onClick={() => setActiveTab('tags')}
              >
                🏷️ 标签管理
              </button>
            </li>
            <li>
              <button
                className={`nav-item ${activeTab === 'stats' ? 'active' : ''}`}
                onClick={() => setActiveTab('stats')}
              >
                📊 数据统计
              </button>
            </li>
          </ul>
        </aside>

        {/* 内容区域 - 添加顶部间距和滚动支持 */}
        <main className="content-area" style={{ marginTop: '70px', overflowY: 'auto' }}>
          {renderTabContent()}
        </main>
      </div>

      {/* 文章编辑器模态框 */}
      {showEditor && (
        <ArticleEditor
          article={editingArticle}
          onSave={handleSaveArticle}
          onCancel={handleCloseEditor}
        />
      )}
    </div>
  )
}

export default AdminDashboard