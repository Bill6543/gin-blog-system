// 测试前端到后端的API连接
async function testApiConnection() {
    console.log('开始测试API连接...');
    
    try {
        // 测试直接访问后端
        console.log('1. 测试直接访问后端API:');
        const directResponse = await fetch('http://localhost:8081/api/articles?page=1&page_size=10');
        console.log('直接访问状态:', directResponse.status);
        if (directResponse.ok) {
            const directData = await directResponse.json();
            console.log('直接访问数据:', directData);
        }
        
        // 测试通过代理访问
        console.log('\n2. 测试通过代理访问:');
        const proxyResponse = await fetch('/api/articles?page=1&page_size=10');
        console.log('代理访问状态:', proxyResponse.status);
        if (proxyResponse.ok) {
            const proxyData = await proxyResponse.json();
            console.log('代理访问数据:', proxyData);
        }
        
    } catch (error) {
        console.error('测试失败:', error);
    }
}

// 在页面加载完成后运行测试
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', testApiConnection);
} else {
    testApiConnection();
}