# 项目回滚操作指南

## 🎯 回滚目标
将项目恢复到 2026年2月10日 的初始状态（提交哈希: 40535bf）

## 📋 回滚方法

### 方法一：使用备份分支（推荐）
```bash
# 1. 切换到备份分支
git checkout baseline-backup

# 2. 强制重置主分支到备份分支的状态
git branch -f master baseline-backup

# 3. 切换回主分支
git checkout master

# 4. 强制推送（如果需要同步远程仓库）
git push origin master --force
```

### 方法二：直接回滚到指定提交
```bash
# 1. 查看提交历史找到基线提交
git log --oneline

# 2. 重置到基线提交（替换 COMMIT_HASH 为实际的提交哈希）
git reset --hard 40535bf

# 3. 强制推送（如果需要同步远程仓库）
git push origin master --force
```

### 方法三：创建新的干净分支
```bash
# 1. 基于基线创建新分支
git checkout -b fresh-start 40535bf

# 2. 删除旧的主分支
git branch -D master

# 3. 将新分支重命名为master
git branch -m fresh-start master

# 4. 推送到远程（强制覆盖）
git push origin master --force
```

## ⚠️ 重要警告

⚠️ **危险操作**: 上述命令中的 `--force` 参数会覆盖远程仓库的历史记录
⚠️ **数据丢失**: 回滚操作会永久删除回滚点之后的所有更改
⚠️ **团队协作**: 在团队环境中执行前请通知其他开发者

## 🛡️ 安全建议

### 执行前的准备工作
1. **备份当前工作**: 
   ```bash
   git stash save "pre-rollback-backup"
   ```

2. **创建保护分支**:
   ```bash
   git checkout -b rollback-protection-$(date +%Y%m%d)
   git push origin rollback-protection-$(date +%Y%m%d)
   ```

3. **确认当前状态**:
   ```bash
   git status
   git log --oneline -5
   ```

### 验证回滚结果
```bash
# 检查是否回到正确状态
git log --oneline -1
# 应该显示: 40535bf _baseline_: 项目初始状态备份 - 2026-02-10

# 验证文件完整性
ls -la
git status
```

## 🆘 紧急恢复

如果回滚过程中出现问题：

1. **立即停止操作**
2. **不要继续执行任何git命令**
3. **联系技术支持**
4. **可以从本地备份或其他开发者处获取代码**

## 📝 操作记录模板

执行回滚后，请记录以下信息：
```
回滚时间: _______________
执行方法: _______________
操作人员: _______________
验证结果: _______________
备注: _______________
```

## 🔍 常见问题

**Q: 回滚后如何找回丢失的代码？**
A: 可以尝试从stash、其他分支或团队成员处恢复

**Q: 如何避免意外回滚？**
A: 使用别名保护重要分支，定期备份，团队沟通

**Q: 回滚会影响数据库吗？**
A: 不会，但建议同时备份数据库以防万一