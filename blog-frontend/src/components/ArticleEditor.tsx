import { useState, useEffect } from 'react'
import { articleApi, categoryApi, tagApi, uploadApi } from '../api'
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

  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 初始化数据 - 增强兼容性处理字段名大小写
  useEffect(() => {
    fetchCategoriesAndTags()
    if (article) {
      // 兼容后端返回的大写字段名（ID, Title, Content等）
      const getTitle = () => article.title || article.Title || ''
      const getContent = () => article.content || article.Content || ''
      const getSummary = () => article.summary || article.Summary || ''
      const getCover = () => article.cover || article.Cover || ''
      const getStatus = () => article.status || article.Status || 1
      const getCategoryID = () => article.category_id || article.CategoryID || article.categoryId || 0
      
      // 处理标签ID - 兼容 id 和 ID
      const getTagIds = () => {
        const tagsArray = article.tags || article.Tags || []
        return tagsArray.map((t: any) => t.id || t.ID || t.Id || 0).filter(id => id > 0)
      }
      
      const tagIds = getTagIds()
      
      // 设置表单状态
      setFormData({
        title: getTitle(),
        content: getContent(),
        summary: getSummary(),
        cover: getCover(),
        status: getStatus(),
        category_id: getCategoryID(),
        tag_ids: tagIds
      })
      setSelectedTags(tagIds)
      
      console.log('文章编辑器接收到的数据:', {
        title: getTitle(),
        content: getContent(),
        summary: getSummary(),
        cover: getCover(),
        status: getStatus(),
        categoryId: getCategoryID(),
        tagIds: tagIds
      })
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

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件')
      return
    }
    
    // 验证文件大小（限制5MB）
    if (file.size > 5 * 1024 * 1024) {
      setError('图片大小不能超过5MB')
      return
    }
    
    // 显示预览
    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setCoverPreview(event.target.result as string)
        // 清除之前的封面URL
        setFormData(prev => ({ ...prev, cover: '' }))
      }
    }
    reader.readAsDataURL(file)
    
    // 开始上传
    setUploading(true)
    setUploadError('')
    
    try {
      const response = await uploadApi.uploadImage(file)
      let uploadedUrl = ''
      
      // 兼容多种后端返回格式
      if (response.data?.code === 200 && response.data.data?.url) {
        // 格式1: {code: 200, data: {url: "..."}}
        uploadedUrl = response.data.data.url
      } else if (typeof response.data === 'string' && response.data.startsWith('http')) {
        // 格式2: 直接返回URL字符串
        uploadedUrl = response.data
      } else if (typeof response.data === 'number') {
        // 格式3: 直接返回数字ID，拼接为静态路径
        uploadedUrl = `/static/uploads/${response.data}.jpg`
      } else if (response.data?.url) {
        // 格式4: {url: "..."}
        uploadedUrl = response.data.url
      } else {
        // 格式5: 空对象或错误格式
        console.warn('未知的上传响应格式:', response.data)
        uploadedUrl = '/static/default_cover.png'
      }
      
      if (!uploadedUrl) {
        throw new Error('无法解析上传响应数据')
      }
      
      setFormData(prev => ({ ...prev, cover: uploadedUrl }))
      setCoverPreview(uploadedUrl)
      setError('')
    } catch (err: any) {
      setUploadError(err.message || '上传失败')
      setError(err.message || '上传失败')
    } finally {
      setUploading(false)
    }
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
    
    console.log('提交表单数据:', {
      title: formData.title,
      content: formData.content.substring(0, 50) + '...',
      summary: formData.summary,
      cover: formData.cover,
      status: formData.status,
      category_id: formData.category_id,
      tag_ids: formData.tag_ids
    })
    
    // 验证必填字段
    if (!formData.title.trim()) {
      setError('请输入文章标题')
      return
    }
    
    // 标题长度验证
    if (formData.title.trim().length < 5) {
      setError('文章标题至少需要5个字符')
      return
    }
    
    if (!formData.content.trim()) {
      setError('请输入文章内容')
      return
    }
    
    // 内容长度验证
    if (formData.content.trim().length < 20) {
      setError('文章内容至少需要20个字符')
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
              <label htmlFor="title">文章标题 * <span className="char-count">({formData.title.length}/100)</span></label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="请输入文章标题（至少5个字符）"
                maxLength={100}
                disabled={loading}
                required
              />
              {formData.title.length > 0 && formData.title.length < 5 && (
                <small className="validation-error">标题太短，至少需要5个字符</small>
              )}
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
              
              {/* 封面预览 */}
              {(coverPreview || formData.cover) && (
                <div className="cover-preview">
                  <img 
                    src={coverPreview || formData.cover} 
                    alt="封面预览" 
                    className="cover-image"
                  />
                  <button 
                    type="button" 
                    className="remove-cover-btn"
                    onClick={() => {
                      setCoverPreview(null)
                      setFormData(prev => ({ ...prev, cover: '' }))
                    }}
                    disabled={loading}
                  >
                    ×
                  </button>
                </div>
              )}
              
              {/* 上传区域 */}
              <div className="cover-upload-area">
                <input
                  type="file"
                  id="cover-upload"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  disabled={loading || uploading}
                  className="cover-file-input"
                />
                <label 
                  htmlFor="cover-upload" 
                  className={`cover-upload-label ${uploading ? 'uploading' : ''}`}
                >
                  {uploading ? (
                    <>
                      <span className="upload-spinner"></span>
                      上传中...
                    </>
                  ) : (
                    '📁 选择图片上传'
                  )}
                </label>
                <div className="upload-hint">
                  支持 JPG、PNG、GIF 格式，最大 5MB
                </div>
              </div>
              
              {uploadError && (
                <small className="upload-error">{uploadError}</small>
              )}
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
              <label htmlFor="content">文章内容 * <span className="char-count">({formData.content.length}/5000)</span></label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="请输入文章内容（至少20个字符，支持Markdown语法）"
                rows={15}
                maxLength={5000}
                disabled={loading}
                required
              />
              <div className="textarea-helpers">
                <small>支持Markdown语法，如 # 标题、**粗体**、*斜体* 等</small>
                {formData.content.length > 0 && formData.content.length < 20 && (
                  <small className="validation-error">内容太短，至少需要20个字符</small>
                )}
                {formData.content.length >= 20 && (
                  <small className="word-count">约 {(formData.content.length / 4).toFixed(0)} 个汉字</small>
                )}
              </div>
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