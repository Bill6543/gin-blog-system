@echo off
:: 项目一键回滚脚本
:: 将项目恢复到初始基线状态

echo ========================================
echo 博客系统一键回滚工具
echo ========================================
echo 当前时间: %date% %time%
echo.

:: 检查Git状态
echo [1/5] 检查Git状态...
git status --porcelain >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: Git未安装或不在PATH中
    pause
    exit /b 1
)

:: 显示当前分支和提交
echo [2/5] 当前Git状态:
git log --oneline -1
echo 当前分支: 
git branch --show-current
echo.

:: 确认操作
echo ========================================
echo ⚠️  警告: 此操作将永久删除所有未保存的更改
echo ========================================
set /p confirm=确定要回滚到初始状态吗？(输入 YES 确认):

if /i "%confirm%" neq "YES" (
    echo 操作已取消
    pause
    exit /b 0
)

:: 创建保护备份
echo [3/5] 创建保护备份...
set backup_branch=backup_%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set backup_branch=%backup_branch: =%
set backup_branch=%backup_branch:/=%
set backup_branch=%backup_branch::=%

git checkout -b %backup_branch% >nul 2>&1
if %errorlevel% equ 0 (
    echo 备份分支已创建: %backup_branch%
    git checkout master >nul 2>&1
) else (
    echo 警告: 备份分支创建失败
)

:: 执行回滚
echo [4/5] 执行回滚操作...
echo 切换到备份分支...
git checkout baseline-backup

echo 重置主分支...
git branch -f master baseline-backup

echo 切换回主分支...
git checkout master

:: 验证结果
echo [5/5] 验证回滚结果...
echo.
echo 当前状态:
git log --oneline -1
echo.

:: 清理未跟踪文件
echo 清理临时文件...
git clean -fd

echo ========================================
echo ✅ 回滚完成！
echo 项目已恢复到初始基线状态
echo ========================================

echo.
echo 建议后续操作:
echo 1. 检查项目功能是否正常
echo 2. 重新安装依赖包
echo 3. 重启开发服务器
echo.

pause