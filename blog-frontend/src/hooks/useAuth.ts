import { useState, useEffect } from 'react'
import { User } from '../types'

// 用户状态管理Hook
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  // 初始化时检查本地存储的用户信息
  useEffect(() => {
    const initAuth = () => {
      try {
        const storedUser = localStorage.getItem('user')
        const storedToken = localStorage.getItem('token')
        
        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser))
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error('初始化认证状态失败:', error)
        // 清除无效的存储数据
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  // 登录函数
  const login = (userData: User, token: string) => {
    try {
      // 保存到本地存储
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('token', token)
      
      // 更新状态
      setUser(userData)
      setIsAuthenticated(true)
      
      return true
    } catch (error) {
      console.error('登录失败:', error)
      return false
    }
  }

  // 登出函数 - 移除useNavigate，改用window.location
  const logout = () => {
    // 清除本地存储
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    
    // 重置状态
    setUser(null)
    setIsAuthenticated(false)
    
    // 使用window.location跳转（避免useNavigate的上下文问题）
    window.location.href = '/login'
  }

  // 更新用户信息
  const updateUser = (userData: User) => {
    try {
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
      return true
    } catch (error) {
      console.error('更新用户信息失败:', error)
      return false
    }
  }

  return {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    updateUser
  }
}