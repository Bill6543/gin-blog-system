import React, { useState, useEffect } from 'react';
import { categoryApi } from '../api/category';
import { Category } from '../types';
import { useNavigate } from 'react-router-dom';

const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<Omit<Category, 'id' | 'created_at' | 'updated_at'>>({
    name: '',
    description: '',
    status: 1
  });
  const navigate = useNavigate();

  // 获取分类列表
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryApi.getCategories();
      if (response.data.code === 200) {
        setCategories(response.data.data);
      } else {
        setError(response.data.msg || '获取分类列表失败');
      }
    } catch (err) {
      setError('网络请求失败');
      console.error('获取分类列表失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 初始化数据
  useEffect(() => {
    fetchCategories();
  }, []);

  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'status' ? parseInt(value) : value
    }));
    if (error) setError('');
  };

  // 提交表单（创建或更新）
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCategory) {
        // 更新分类
        const response = await categoryApi.updateCategory(editingCategory.id, formData);
        if (response.data.code === 200) {
          alert('分类更新成功！');
          setShowForm(false);
          setEditingCategory(null);
          setFormData({ name: '', description: '', status: 1 });
          fetchCategories();
        } else {
          setError(response.data.msg || '更新分类失败');
        }
      } else {
        // 创建分类
        const response = await categoryApi.createCategory(formData);
        if (response.data.code === 200) {
          alert('分类创建成功！');
          setShowForm(false);
          setFormData({ name: '', description: '', status: 1 });
          fetchCategories();
        } else {
          setError(response.data.msg || '创建分类失败');
        }
      }
    } catch (err) {
      setError('操作失败，请重试');
      console.error('分类操作失败:', err);
    }
  };

  // 删除分类
  const handleDelete = async (id: number) => {
    if (!window.confirm('确定要删除此分类吗？删除后相关文章的分类将被设为默认分类。')) {
      return;
    }

    try {
      const response = await categoryApi.deleteCategory(id);
      if (response.data.code === 200) {
        alert('分类删除成功！');
        fetchCategories();
      } else {
        setError(response.data.msg || '删除分类失败');
      }
    } catch (err) {
      setError('删除失败，请重试');
      console.error('删除分类失败:', err);
    }
  };

  // 编辑分类
  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      status: category.status
    });
    setShowForm(true);
  };

  // 重置表单
  const handleReset = () => {
    setFormData({ name: '', description: '', status: 1 });
    setEditingCategory(null);
    setShowForm(false);
    setError('');
  };

  // 获取状态文本
  const getStatusText = (status: number): string => {
    return status === 1 ? '启用' : '禁用';
  };

  // 获取状态样式
  const getStatusClass = (status: number): string => {
    return status === 1 ? 'status-active' : 'status-inactive';
  };

  // 格式化日期
  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="article-manager" style={{ 
      width: '100%', 
      maxWidth: '1280px', 
      margin: '0 auto',
      padding: '20px 0'
    }}>
      {/* 操作栏 - 与文章管理保持一致 */}
      <div className="manager-header">
        <h2>分类管理</h2>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => {
              setEditingCategory(null);
              setFormData({ name: '', description: '', status: 1 });
              setShowForm(true);
            }}
          >
            ✨ 新建分类
          </button>
        </div>
      </div>

      {/* 添加统计栏，与文章管理完全一致 */}
      <div className="stats-bar" style={{ 
        display: 'flex', 
        gap: '20px', 
        margin: '0 0 25px 0', 
        padding: '20px', 
        background: '#f8f9fa', 
        borderRadius: '8px',
        width: '100%'
      }}>
        <div className="stat-item" style={{ textAlign: 'center', flex: '1' }}>
          <span className="stat-number" style={{ display: 'block', fontSize: '28px', fontWeight: '700', color: '#667eea' }}>
            {categories.length}
          </span>
          <span className="stat-label" style={{ fontSize: '14px', color: '#666' }}>总分类数</span>
        </div>
        <div className="stat-item" style={{ textAlign: 'center', flex: '1' }}>
          <span className="stat-number" style={{ display: 'block', fontSize: '28px', fontWeight: '700', color: '#667eea' }}>
            {categories.filter(c => c.status === 1).length}
          </span>
          <span className="stat-label" style={{ fontSize: '14px', color: '#666' }}>启用</span>
        </div>
        <div className="stat-item" style={{ textAlign: 'center', flex: '1' }}>
          <span className="stat-number" style={{ display: 'block', fontSize: '28px', fontWeight: '700', color: '#667eea' }}>
            {categories.filter(c => c.status === 0).length}
          </span>
          <span className="stat-label" style={{ fontSize: '14px', color: '#666' }}>禁用</span>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {showForm && (
        <div className="category-form-card">
          <h2>{editingCategory ? '编辑分类' : '新建分类'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">分类名称 *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="请输入分类名称"
                required
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">描述</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="请输入分类描述"
                rows={3}
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="status">状态</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="form-control"
              >
                <option value={1}>启用</option>
                <option value={0}>禁用</option>
              </select>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn btn-success">
                {editingCategory ? '更新分类' : '创建分类'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={handleReset}
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-container" style={{ width: '100%' }}>
        {loading ? (
          <div className="loading">加载中...</div>
        ) : categories.length === 0 ? (
          <div className="empty-state">
            <p>暂无分类数据</p>
            <button 
              className="btn btn-primary"
              onClick={() => {
                setEditingCategory(null);
                setFormData({ name: '', description: '', status: 1 });
                setShowForm(true);
              }}
            >
              创建第一个分类
            </button>
          </div>
        ) : (
          <table className="category-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>分类名称</th>
                <th>描述</th>
                <th>状态</th>
                <th>文章数量</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(category => (
                <tr key={category.id}>
                  <td>{category.name}</td>
                  <td>{category.description || '无描述'}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(category.status)}`}>
                      {getStatusText(category.status)}
                    </span>
                  </td>
                  <td>{category.articles?.length || 0}</td>
                  <td>{formatDate(category.created_at)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleEdit(category)}
                      >
                        编辑
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(category.id)}
                      >
                        删除
                      </button>
                    </div>
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

export default CategoryManager;