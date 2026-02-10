import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authApi } from '../api'
import { useAuth } from '../hooks/useAuth'
import './Login.css'

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const navigate = useNavigate()

  // 设置页面背景
  useEffect(() => {
    const bgImage = '/static/2026/02/09/1770605592_g9xbTbWU.jpg';
    document.body.style.backgroundImage = `url(${bgImage})`;
    document.body.style.backgroundSize = '100% 100%';
    document.body.style.backgroundRepeat = 'no-repeat';
    document.body.style.backgroundAttachment = 'fixed';
    
    // 清理函数
    return () => {
      document.body.style.backgroundImage = '';
      document.body.style.backgroundSize = '';
      document.body.style.backgroundRepeat = '';
      document.body.style.backgroundAttachment = '';
    };
  }, []);
  const { login } = useAuth()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // 清除之前的错误信息
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 基本验证
    if (!formData.username.trim()) {
      setError('请输入用户名')
      return
    }
    if (!formData.password) {
      setError('请输入密码')
      return
    }

    setLoading(true)
    setError('')

    try {
      // 直接调用API
      const response = await authApi.login({
        username: formData.username,
        password: formData.password
      })

      console.log('登录响应:', response);
      
      // 响应拦截器已经处理了标准API格式，response就是 { token, user } 对象
      // 确保response有user和token属性
      if (response && response.user && response.token) {
        // 登录成功
        const success = login(response.user, response.token)
        if (success) {
          // 跳转到首页
          navigate('/')
        } else {
          setError('登录失败，请重试')
        }
      } else {
        setError('登录响应格式不正确，请联系管理员')
        console.error('登录响应格式异常:', response);
      }
    } catch (err: any) {
      console.error('登录错误:', err);
      
      // 安全的错误处理，避免访问undefined属性
      let errorMsg = '网络错误，请稍后重试';
      
      if (err && typeof err === 'object') {
        if (err.response) {
          if (err.response.data) {
            if (typeof err.response.data === 'object' && 'msg' in err.response.data) {
              errorMsg = err.response.data.msg;
            } else if (typeof err.response.data === 'string') {
              errorMsg = err.response.data;
            }
          }
        } else if (err.message) {
          errorMsg = err.message;
        }
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-form-wrapper">
        <div className="login-header">
          <h1>博客系统</h1>
          <p>欢迎回来，请登录您的账户</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">用户名：</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="请输入用户名或邮箱"
              disabled={loading}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">密码：</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="请输入密码"
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            还没有账户？ <Link to="/register">立即注册</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage