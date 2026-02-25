import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { articleApi } from '../api';
import { Article } from '../types';
import { generateTestData } from '../utils/testData';
import './ArticleList.css';

import { normalizeCoverUrl } from '../utils/pathUtils';

// 已移至 utils/pathUtils.ts

const ArticleList = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const navigate = useNavigate();

  useEffect(() => {
    fetchArticles();
  }, [page]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const response = await articleApi.getArticles({ page, page_size: pageSize });
      if (response.data.code === 200) {
        setArticles(response.data.data.articles);
      }
    } catch (err) {
      const { testArticles } = generateTestData();
      setArticles(testArticles);
    } finally {
      setLoading(false);
    }
  };

  const handleArticleClick = (id: number) => navigate(`/article/${id}`);

  if (loading) return <div>加载中...</div>;

  return (
    <div className="article-list-container">
      {/* 文章列表标题 */}
      <div className="article-list-header">
        <h1>博客文章</h1>
        <p>探索知识与灵感</p>
      </div>
      
      {articles.map(article => (
        <div key={article.id} className="article-item" onClick={() => handleArticleClick(article.id)}>
          <div className="article-cover">
            {article.cover && (
              <img src={normalizeCoverUrl(article.cover)} alt={article.title} />
            )}
          </div>
          <div className="article-content">
            <h3 className="article-title">{article.title}</h3>
            <p className="article-summary">{article.summary || '暂无摘要'}</p>
            <div className="article-meta">
              <span>作者: {article.user?.nickname || article.user?.username || '未知'}</span>
              <span>发布时间: {new Date(article.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ArticleList;