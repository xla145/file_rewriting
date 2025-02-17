# AI 水文生成器 Chrome 扩展

一个基于 AI 的文章生成 Chrome 扩展，可以帮助用户快速生成高质量的文章内容。

## 功能特点

- 一键仿写：分析当前页面内容，生成相关主题的文章
- 智能标题：自动生成多个相关的文章标题供选择
- Markdown 支持：支持 Markdown 格式的文章预览和编辑
- 复制功能：一键复制生成的文章内容
- 预览/编辑模式：支持实时预览和编辑切换

## 安装方法

1. 下载项目代码
2. 打开 Chrome 浏览器，进入扩展程序页面 (chrome://extensions/)
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目文件夹

## 使用说明

1. 在任意网页点击扩展图标打开插件
2. 点击"仿写"按钮分析当前页面内容
3. 从生成的标题列表中选择感兴趣的标题
4. 等待文章生成完成
5. 可以在预览模式查看文章效果
6. 切换到编辑模式可以修改文章内容
7. 点击"复制"按钮复制文章内容

## 文件结构

manifest.json     # 扩展配置文件
popup.html       # 弹出窗口 HTML 
popup.js         # 弹出窗口脚本
styles.css       # 样式文件
background.js    # 后台脚本
content.js       # 内容脚本
test_dify_api.py # API 测试脚本

## 技术栈

- HTML/CSS/JavaScript
- Chrome Extension API
- Marked.js (Markdown 解析)
- Dify API (AI 内容生成)

## 注意事项

- 需要配置有效的 API 密钥才能使用
- 生成内容的质量取决于原页面内容的相关性
- 建议在生成后检查并适当编辑内容

## 开发计划

- [ ] 添加更多文章模板
- [ ] 支持自定义 AI 参数
- [ ] 添加历史记录功能
- [ ] 支持导出多种格式
- [ ] 优化生成速度

## 贡献指南

欢迎提交 Issue 和 Pull Request 来帮助改进项目。

## 许可证

MIT License