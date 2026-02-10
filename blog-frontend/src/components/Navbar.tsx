import { useAuth } from '../hooks/useAuth'
import { authApi } from '../api'
import { useLocation } from 'react-router-dom'
import { useState, useRef } from 'react'

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth()
  const location = useLocation()
  
  // 鼠标悬停状态
  const [isHovered, setIsHovered] = useState(false)
  const navbarRef = useRef<HTMLDivElement>(null)

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.error('登出API调用失败:', error)
    } finally {
      logout()
    }
  }

  // 判断是否在文章详情页
  const isArticleDetailPage = location.pathname.startsWith('/article/')

  return (
    <nav 
      ref={navbarRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '80px',
        background: isArticleDetailPage 
          ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.4) 0%, rgba(118, 75, 162, 0.4) 100%)' 
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        display: isAuthenticated ? 'block' : 'none',
        zIndex: '1000',
        boxShadow: isArticleDetailPage 
          ? '0 2px 10px rgba(0,0,0,0.05)' 
          : '0 2px 10px rgba(0,0,0,0.2)',
        padding: '0 20px',
        backdropFilter: isArticleDetailPage ? 'blur(10px)' : 'none',
        opacity: isHovered ? 1 : 0,
        transition: 'opacity 0.3s ease',
        overflow: 'hidden'
      }}
    >
      {/* 左侧标题 */}
      <div style={{ 
        position: 'absolute',
        left: '20px',
        top: '50%',
        transform: 'translateY(-50%)',
        fontSize: '22px',
        fontWeight: '600'
      }}>
        博客系统
      </div>
      
      {/* 右侧用户信息和按钮 - 绝对定位到最右边 */}
      <div style={{ 
        position: 'absolute',
        right: '20px',
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex', 
        alignItems: 'center', 
        gap: '20px'
      }}>
        <span style={{ color: 'white', fontSize: '16px' }}>
          欢迎，{user?.nickname || user?.username}
        </span>
        <button 
          onClick={() => window.location.href = '/admin'}
          style={{
            background: '#4CAF50',
            color: 'white',
            border: '2px solid #4CAF50',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            minWidth: '120px',
            marginRight: '10px'
          }}
        >
          管理后台
        </button>
        <button 
          onClick={handleLogout}
          style={{
            background: '#ff4757',
            color: 'white',
            border: '2px solid #ff4757',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            minWidth: '120px'
          }}
        >
          退出登录
        </button>
      </div>
    </nav>
  )
}

export default Navbar