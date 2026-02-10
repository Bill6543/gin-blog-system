// 测试数据生成工具
export const generateTestData = () => {
  // 模拟用户数据
  const testUser = {
    id: 1,
    username: 'testuser',
    nickname: '测试用户',
    email: 'test@example.com',
    avatar: '/static/default_avatar.png',
    status: 1,
    created_at: '2026-02-07 10:00:00',
    updated_at: '2026-02-07 10:00:00'
  }

  // 模拟文章数据
  const testArticles = [
    {
      id: 1,
      title: '我的第一篇博客文章',
      content: '# 欢迎来到我的博客\n\n这是我写的第一篇博客文章，很高兴能在这里分享我的想法。\n\n## 为什么写博客\n\n写博客可以帮助我：\n- 记录学习心得\n- 分享技术经验\n- 与他人交流\n\n希望你能喜欢我的内容！',
      summary: '这是我写的第一篇博客文章，很高兴能在这里分享我的想法。',
      cover: '/static/default_cover.png',
      status: 1,
      view_count: 156,
      like_count: 23,
      comment_count: 8,
      user_id: 1,
      user: testUser,
      category_id: 1,
      category: {
        id: 1,
        name: '技术分享',
        description: '分享各种技术知识和经验',
        status: 1,
        created_at: '2026-02-07 09:00:00',
        updated_at: '2026-02-07 09:00:00'
      },
      tag_ids: [1, 2],
      tags: [
        {
          id: 1,
          name: '前端开发',
          color: '#4CAF50',
          status: 1,
          created_at: '2026-02-07 09:00:00',
          updated_at: '2026-02-07 09:00:00'
        },
        {
          id: 2,
          name: 'React',
          color: '#61DAFB',
          status: 1,
          created_at: '2026-02-07 09:00:00',
          updated_at: '2026-02-07 09:00:00'
        }
      ],
      created_at: '2026-02-07 10:30:00',
      updated_at: '2026-02-07 10:30:00'
    },
    {
      id: 2,
      title: 'Go语言学习笔记',
      content: '# Go语言入门指南\n\nGo语言是一门简洁高效的编程语言。\n\n## 主要特性\n\n- 静态类型\n- 并发支持\n- 垃圾回收\n- 快速编译\n\n## 简单示例\n\n```go\npackage main\n\nimport \"fmt\"\n\nfunc main() {\n    fmt.Println(\"Hello, Go!\")\n}\n```',
      summary: 'Go语言是一门简洁高效的编程语言，本文介绍了其主要特性和入门示例。',
      cover: '/static/default_cover.png',
      status: 1,
      view_count: 89,
      like_count: 15,
      comment_count: 3,
      user_id: 1,
      user: testUser,
      category_id: 1,
      category: {
        id: 1,
        name: '技术分享',
        description: '分享各种技术知识和经验',
        status: 1,
        created_at: '2026-02-07 09:00:00',
        updated_at: '2026-02-07 09:00:00'
      },
      tag_ids: [3, 4],
      tags: [
        {
          id: 3,
          name: '后端开发',
          color: '#FF9800',
          status: 1,
          created_at: '2026-02-07 09:00:00',
          updated_at: '2026-02-07 09:00:00'
        },
        {
          id: 4,
          name: 'Go语言',
          color: '#00ADD8',
          status: 1,
          created_at: '2026-02-07 09:00:00',
          updated_at: '2026-02-07 09:00:00'
        }
      ],
      created_at: '2026-02-07 11:15:00',
      updated_at: '2026-02-07 11:15:00'
    }
  ]

  return { testUser, testArticles }
}