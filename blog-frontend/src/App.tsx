import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'
import ArticleList from './pages/ArticleList'
import ArticleDetail from './pages/ArticleDetail'
import AdminDashboard from './pages/AdminDashboard'
import Navbar from './components/Navbar'
import './App.css'

// 受保护的路由组件
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return <div className="loading">加载中...</div>
  }
  
  return isAuthenticated ? (
    <>
      <Navbar />
      {children}
    </>
  ) : (
    <Navigate to="/login" />
  )
}

// 已认证用户的路由重定向组件
const AuthRedirect = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return <div className="loading">加载中...</div>
  }
  
  return isAuthenticated ? <Navigate to="/" /> : <>{children}</>
}

function App() {
  const { isAuthenticated } = useAuth()
  
  return (
    <Router>
      <div className="app">

        
        <Routes>
          {/* 登录页面 - 未登录用户可访问 */}
          <Route 
            path="/login" 
            element={
              <AuthRedirect>
                <LoginPage />
              </AuthRedirect>
            } 
          />
          
          {/* 注册页面 - 未登录用户可访问 */}
          <Route 
            path="/register" 
            element={
              <AuthRedirect>
                <RegisterPage />
              </AuthRedirect>
            } 
          />
          
          {/* 文章列表页面 - 需要登录 */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <ArticleList />
              </ProtectedRoute>
            } 
          />
          
          {/* 文章详情页面 - 需要登录 */}
          <Route 
            path="/article/:id" 
            element={
              <ProtectedRoute>
                <ArticleDetail />
              </ProtectedRoute>
            } 
          />
          
          {/* 管理后台 - 需要登录 */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* 默认重定向到首页 */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App