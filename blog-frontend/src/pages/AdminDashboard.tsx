import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import ArticleManager from '../components/ArticleManager'
import ArticleManagerTest from '../components/ArticleManager_test'
import ArticleEditor from '../components/ArticleEditor'
import CategoryManager from '../components/CategoryManager'
import TagManager from '../components/TagManager'
import { Article } from '../types'
import { articleApi } from '../api/article'
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
      let result;
      if (editingArticle) {
        // 编辑文章
        result = await articleApi.updateArticle(editingArticle.id, articleData)
        alert('文章更新成功！')
      } else {
        // 创建文章
        result = await articleApi.createArticle(articleData)
        alert('文章创建成功！')
      }
      setShowEditor(false)
      setEditingArticle(null)
      // 触发自定义事件通知ArticleManager组件刷新数据
      window.dispatchEvent(new CustomEvent('articleUpdated'))
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
          <CategoryManager />
        )
      case 'tags':
        return (
          <TagManager />
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
      {/* 顶部导航 - 注释掉管理后台的独立导航栏，使用全局导航栏 */}
      {/* 
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
      */}

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
        <main className="content-area" style={{
          marginTop: '70px',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          minHeight: '100vh',
          height: '100vh'
        }}>
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