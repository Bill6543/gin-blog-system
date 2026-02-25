import { useState, useEffect } from 'react';
import { tagApi } from '../api/tag';
import { Tag } from '../types';

const TagManager = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#667eea',
    status: 1
  });

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await tagApi.getTags();
      if (response.data.code === 200) {
        // 后端返回的是 data 数组，不是 data.tags
        const tagsData = response.data.data || [];
        // 转换数据结构，添加 article_count 字段
        const processedTags = tagsData.map(tag => ({
          id: tag.id,
          name: tag.name,
          color: tag.color,
          status: tag.status,
          article_count: tag.articles?.length || 0,
          created_at: tag.created_at,
          updated_at: tag.updated_at
        }));
        setTags(processedTags);
      } else {
        throw new Error(response.data.msg || '获取标签列表失败');
      }
    } catch (err: any) {
      console.error('获取标签失败:', err);
      setError('获取标签列表失败: ' + (err.message || '网络错误'));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingTag) {
        const response = await tagApi.updateTag(editingTag.id, formData);
        if (response.data.code === 200) {
          alert('标签更新成功！');
          fetchTags();
          setShowForm(false);
          setEditingTag(null);
        } else {
          throw new Error(response.data.msg || '更新标签失败');
        }
      } else {
        const response = await tagApi.createTag(formData);
        if (response.data.code === 200) {
          alert('标签创建成功！');
          fetchTags();
          setShowForm(false);
          setFormData({ name: '', description: '', color: '#667eea', status: 1 });
        } else {
          throw new Error(response.data.msg || '创建标签失败');
        }
      }
    } catch (err: any) {
      console.error('操作标签失败:', err);
      setError(err.message || '操作失败');
    }
  };

  const handleDelete = async (tagId: number) => {
    if (!window.confirm('确定要删除这个标签吗？')) return;
    try {
      const response = await tagApi.deleteTag(tagId);
      if (response.data.code === 200) {
        alert('标签删除成功！');
        fetchTags();
      } else {
        throw new Error(response.data.msg || '删除标签失败');
      }
    } catch (err: any) {
      console.error('删除标签失败:', err);
      alert('删除失败: ' + (err.message || '未知错误'));
    }
  };

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      description: tag.description,
      color: tag.color || '#667eea',
      status: tag.status
    });
    setShowForm(true);
  };

  const handleReset = () => {
    setFormData({ name: '', description: '', color: '#667eea', status: 1 });
    setEditingTag(null);
    setShowForm(false);
    setError('');
  };

  const getStatusText = (status: number): string => status === 1 ? '启用' : '禁用';
  const formatDate = (dateString: string): string => dateString ? new Date(dateString).toLocaleDateString() : '';

  return (
    <div className="article-manager">
      {/* 操作栏 */}
      <div className="manager-header">
        <h2>标签管理</h2>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => {
              setEditingTag(null);
              setFormData({ name: '', description: '', color: '#667eea', status: 1 });
              setShowForm(true);
            }}
          >
            ✨ 新建标签
          </button>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-number">{tags.length}</span>
          <span className="stat-label">总标签数</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{tags.filter(t => t.status === 1).length}</span>
          <span className="stat-label">启用</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{tags.filter(t => t.status === 0).length}</span>
          <span className="stat-label">禁用</span>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {showForm && (
        <div className="category-form-card">
          <h2>{editingTag ? '编辑标签' : '新建标签'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">标签名称 *</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required className="form-control" />
            </div>
            <div className="form-group">
              <label htmlFor="description">描述</label>
              <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={3} className="form-control" />
            </div>
            <div className="form-group">
              <label htmlFor="color">颜色</label>
              <input type="color" id="color" name="color" value={formData.color} onChange={handleInputChange} className="form-control" style={{ height: '40px' }} />
            </div>
            <div className="form-group">
              <label htmlFor="status">状态</label>
              <select id="status" name="status" value={formData.status} onChange={handleInputChange} className="form-control">
                <option value={1}>启用</option>
                <option value={0}>禁用</option>
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-success">{editingTag ? '更新标签' : '创建标签'}</button>
              <button type="button" className="btn btn-secondary" onClick={handleReset}>取消</button>
            </div>
          </form>
        </div>
      )}

      <div className="table-container">
        {loading ? (
          <div className="loading">加载中...</div>
        ) : tags.length === 0 ? (
          <div className="empty-state">
            <p>暂无标签数据</p>
            <button className="btn btn-primary" onClick={() => {
              setEditingTag(null);
              setFormData({ name: '', description: '', color: '#667eea', status: 1 });
              setShowForm(true);
            }}>创建第一个标签</button>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>标签名称</th>
                <th>颜色</th>
                <th>状态</th>
                <th>文章数量</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {tags.map(tag => (
                <tr key={tag.id}>
                  <td>{tag.name}</td>
                  <td><span style={{ display: 'inline-block', width: '20px', height: '20px', backgroundColor: tag.color || '#667eea', borderRadius: '50%' }}></span></td>
                  <td><span className={`status-badge ${tag.status === 1 ? 'status-active' : 'status-inactive'}`}>{getStatusText(tag.status)}</span></td>
                  <td>{tag.article_count || 0}</td>
                  <td>{formatDate(tag.created_at)}</td>
                  <td>
                    <button className="btn btn-sm btn-primary" onClick={() => handleEdit(tag)}>编辑</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(tag.id)}>删除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TagManager;