import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authApi } from '../api'
import { uploadApi } from '../api/upload'
import './Register.css'

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    nickname: ''
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // 清除之前的错误信息
    if (error) setError('')
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      // 创建预览
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatarPreview(event.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const removeAvatar = () => {
    setAvatarFile(null)
    setAvatarPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('请输入用户名')
      return false
    }
    if (!formData.email.trim()) {
      setError('请输入邮箱')
      return false
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('请输入有效的邮箱地址')
      return false
    }
    if (!formData.password) {
      setError('请输入密码')
      return false
    }
    if (formData.password.length < 6) {
      setError('密码长度至少6位')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      let avatarUrl = ''
      
      // 如果有头像文件，先上传
      if (avatarFile) {
        const uploadResponse = await uploadApi.uploadImage(avatarFile)
        if (uploadResponse.data.code === 200 && uploadResponse.data.data) {
          avatarUrl = uploadResponse.data.data.url
        } else {
          throw new Error(uploadResponse.data.msg || '头像上传失败')
        }
      }

      // 注册用户，包含头像URL
      await authApi.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        nickname: formData.nickname || formData.username,
        avatar: avatarUrl
      })

      setSuccess(true)
      // 3秒后自动跳转到登录页
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err: any) {
      console.error('注册错误:', err)
      setError(err.response?.data?.msg || '网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="register-container">
        <div className="register-success">
          <div className="success-icon">✓</div>
          <h2>注册成功！</h2>
          <p>您的账户已创建成功</p>
          <p>正在跳转到登录页面...</p>
          <Link to="/login" className="login-link">
            立即登录
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="register-container" style={{ overflowY: 'auto', height: '100vh', minHeight: '100vh' }}>
      <div className="register-form-wrapper">
        <div className="register-header">
          <h1>创建账户</h1>
          <p>加入我们的博客社区！</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          {/* 头像上传区域 */}
          <div className="form-group avatar-upload">
            <label>头像（可选）</label>
            <div className="avatar-upload-container">
              {avatarPreview ? (
                <div className="avatar-preview">
                  <img src={avatarPreview} alt="头像预览" className="avatar-preview-img" />
                </div>
              ) : (
                <div className="avatar-placeholder">
                  <div className="avatar-placeholder-icon">👤</div>
                  <p>点击选择头像图片</p>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="avatar-file-input"
              />
              <div className="avatar-actions">
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="avatar-btn"
                >
                  选择图片
                </button>
                {avatarPreview && (
                  <button 
                    type="button"
                    onClick={removeAvatar}
                    className="remove-avatar-btn"
                  >
                    删除
                  </button>
                )}
              </div>
              <p className="avatar-hint">支持 JPG、PNG 格式，建议尺寸 200x200px</p>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="username">用户名：*</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="请输入用户名"
              disabled={loading}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">邮箱：*</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="请输入邮箱地址"
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="nickname">昵称：</label>
            <input
              type="text"
              id="nickname"
              name="nickname"
              value={formData.nickname}
              onChange={handleInputChange}
              placeholder="请输入昵称（可选）"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">密码：*</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="请输入密码（至少6位）"
              disabled={loading}
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">确认密码：*</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="请再次输入密码"
              disabled={loading}
              autoComplete="new-password"
            />
          </div>

          <button 
            type="submit" 
            className="register-button"
            disabled={loading}
          >
            {loading ? '注册中...' : '注册'}
          </button>
        </form>

        <div className="register-footer">
          <p>
            已有账户？ <Link to="/login">立即登录</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage