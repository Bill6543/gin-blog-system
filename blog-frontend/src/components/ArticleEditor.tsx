import { useState, useEffect } from 'react'
import { articleApi, categoryApi, tagApi } from '../api'
import { Article, Category, Tag } from '../types'
import './ArticleEditor.css'

interface ArticleEditorProps {
  article?: Article | null
  onSave: (article: Partial<Article>) => Promise<void>
  onCancel: () => void
}

const ArticleEditor = ({ article, onSave, onCancel }: ArticleEditorProps) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    cover: '',
    status: 1,
    category_id: 0,
    tag_ids: [] as number[]
  })

  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 初始化数据
  useEffect(() => {
    fetchCategoriesAndTags()
    if (article) {
      setFormData({
        title: article.title,
        content: article.content,
        summary: article.summary || '',
        cover: article.cover || '',
        status: article.status,
        category_id: article.category_id,
        tag_ids: article.tags?.map(t => t.id) || []
      })
      setSelectedTags(article.tags?.map(t => t.id) || [])
    }
  }, [article])

  const fetchCategoriesAndTags = async () => {
    try {
      // 获取分类列表
      const categoryResponse = await categoryApi.getCategories()
      if (categoryResponse.data.code === 200) {
        setCategories(categoryResponse.data.data)
      }

      // 获取标签列表
      const tagResponse = await tagApi.getTags()
      if (tagResponse.data.code === 200) {
        setTags(tagResponse.data.data)
      }
    } catch (err) {
      console.error('获取分类或标签失败:', err)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'status' || name === 'category_id' ? parseInt(value) : value
    }))
    if (error) setError('')
  }

  const handleTagToggle = (tagId: number) => {
    setSelectedTags(prev => {
      const newTags = prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
      
      setFormData(prevData => ({
        ...prevData,
        tag_ids: newTags
      }))
      
      return newTags
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 验证必填字段
    if (!formData.title.trim()) {
      setError('请输入文章标题')
      return
    }
    if (!formData.content.trim()) {
      setError('请输入文章内容')
      return
    }
    if (!formData.category_id) {
      setError('请选择文章分类')
      return
    }

    setLoading(true)
    setError('')

    try {
      await onSave(formData)
    } catch (err: any) {
      setError(err.message || '保存失败')
    } finally {
      setLoading(false)
    }
  }

  const isEditing = !!article

  return (
    <div className="article-editor-overlay">
      <div className="article-editor">
        <div className="editor-header">
          <h2>{isEditing ? '编辑文章' : '新建文章'}</h2>
          <button 
            className="close-btn"
            onClick={onCancel}
            disabled={loading}
          >
            ×
          </button>
        </div>

        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="editor-form">
          {/* 基本信息 */}
          <div className="form-section">
            <h3>基本信息</h3>
            
            <div className="form-group">
              <label htmlFor="title">文章标题 *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="请输入文章标题"
                disabled={loading}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category_id">文章分类 *</label>
                <select
                  id="category_id"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  disabled={loading}
                  required
                >
                  <option value="">请选择分类</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="status">文章状态</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  disabled={loading}
                >
                  <option value={1}>发布</option>
                  <option value={0}>草稿</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="cover">封面图片</label>
              <input
                type="text"
                id="cover"
                name="cover"
                value={formData.cover}
                onChange={handleInputChange}
                placeholder="请输入封面图片URL或上传图片"
                disabled={loading}
              />
              <small>支持图片URL或上传图片</small>
            </div>
          </div>

          {/* 标签选择 */}
          <div className="form-section">
            <h3>标签选择</h3>
            <div className="tags-selector">
              {tags.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  className={`tag-option ${selectedTags.includes(tag.id) ? 'selected' : ''}`}
                  onClick={() => handleTagToggle(tag.id)}
                  style={{ backgroundColor: tag.color }}
                  disabled={loading}
                >
                  {tag.name}
                </button>
              ))}
              {tags.length === 0 && (
                <p className="no-tags">暂无可用标签</p>
              )}
            </div>
          </div>

          {/* 文章摘要 */}
          <div className="form-section">
            <h3>文章摘要</h3>
            <div className="form-group">
              <textarea
                id="summary"
                name="summary"
                value={formData.summary}
                onChange={handleInputChange}
                placeholder="请输入文章摘要（可选）"
                rows={3}
                disabled={loading}
              />
              <small>如果不填写，系统将自动生成摘要</small>
            </div>
          </div>

          {/* 文章内容 */}
          <div className="form-section">
            <h3>文章内容 *</h3>
            <div className="form-group">
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="请输入文章内容（支持Markdown语法）"
                rows={15}
                disabled={loading}
                required
              />
              <small>支持Markdown语法，如 # 标题、**粗体**、*斜体* 等</small>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={loading}
            >
              取消
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (isEditing ? '更新中...' : '创建中...') : (isEditing ? '更新文章' : '创建文章')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ArticleEditor