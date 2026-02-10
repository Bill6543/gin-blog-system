@echo off
:: 端口清理脚本 - 清理3000-3010端口的占用进程

echo ========================================
echo 端口清理工具 - 清理3000-3010端口
echo ========================================
echo 时间: %date% %time%
echo.

setlocal enabledelayedexpansion

:: 清理3000-3010端口
for /L %%i in (3000,1,3010) do (
    echo 检查端口: %%i
    netstat -ano | findstr :%%i >nul
    if !errorlevel! equ 0 (
        for /f "tokens=5" %%p in ('netstat -ano ^| findstr :%%i') do (
            echo 发现占用进程 PID: %%p
            taskkill /PID %%p /F
            echo 已终止进程 %%p
        )
    )
)

echo.
echo ========================================
echo 清理完成！现在可以启动开发服务器
echo 推荐命令: cd blog-frontend && npm run dev
echo ========================================

pause