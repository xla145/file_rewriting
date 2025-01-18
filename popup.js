document.addEventListener('DOMContentLoaded', () => {
  const convertBtn = document.getElementById('convertBtn');
  const titleList = document.getElementById('titleList');
  const editor = document.getElementById('editor');
  const content = document.getElementById('content');
  const copyBtn = document.getElementById('copyBtn');
  const tabBtns = document.querySelectorAll('.tab-btn');
 

  // 设置 marked 选项
  marked.setOptions({
    breaks: true,  // 支持 GitHub 风格的换行
    gfm: true      // 启用 GitHub 风格的 Markdown
  });

  // 切换标签页
  tabBtns.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (index === 0) { // 预览模式
        content.style.display = 'none';
        titleList.style.display = 'none';
        if (!content.nextElementSibling) {
          const preview = document.createElement('div');
          preview.className = 'content';
          preview.innerHTML = marked.parse(content.value);  // 使用 marked 解析
          content.parentNode.appendChild(preview);
        } else {
          content.nextElementSibling.style.display = 'block';
          content.nextElementSibling.innerHTML = marked.parse(content.value);  // 使用 marked 解析
        }
      } else { // 编辑模式
        content.style.display = 'block';
        titleList.style.display = 'block';
        if (content.nextElementSibling) {
          content.nextElementSibling.style.display = 'none';
        }
      }
    });
  });

  convertBtn.addEventListener('click', async () => {
    convertBtn.disabled = true;
    convertBtn.innerHTML = '<span class="loading-spinner"></span> 生成中...';
    
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      titleList.innerHTML = `
        <div class="loading-container">
          <span class="loading-spinner"></span>
          <span>正在分析页面内容...</span>
        </div>
      `;
      
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'getContent' });
      const titles = await chrome.runtime.sendMessage({
        action: 'genTitle',
        content: response.content
      });

      titleList.innerHTML = '';
      const titleRow = document.createElement('div');
      titleRow.className = 'title-row';
      titleList.appendChild(titleRow);

      titles.forEach((title, index) => {
        if (index > 0 && index % 2 === 0) {
          const newRow = document.createElement('div');
          newRow.className = 'title-row';
          titleList.appendChild(newRow);
        }
        const div = document.createElement('div');
        div.className = 'title-item';
        div.textContent = title;
        div.addEventListener('click', async () => {
          const allTitles = document.querySelectorAll('.title-item');
          allTitles.forEach(t => t.classList.remove('selected'));
          div.classList.add('selected');
          
          const originalText = div.textContent;
          div.innerHTML = '<span class="loading-spinner"></span> 生成文章中...';
          
          try {
            const generatedContent = await chrome.runtime.sendMessage({
              action: 'genContent',
              title: title,
              content: response.content
            });
            
            titleList.style.display = 'none';
            
            editor.style.display = 'block';
            content.value = generatedContent;
            
            content.style.display = 'none';
            tabBtns[0].classList.add('active');
            tabBtns[1].classList.remove('active');
            
            if (!content.nextElementSibling) {
              const preview = document.createElement('div');
              preview.className = 'content';
              preview.innerHTML = marked.parse(generatedContent);  // 使用 marked 解析
              content.parentNode.appendChild(preview);
            } else {
              content.nextElementSibling.style.display = 'block';
              content.nextElementSibling.innerHTML = marked.parse(generatedContent);  // 使用 marked 解析
            }
            
            editor.scrollIntoView({ behavior: 'smooth' });
          } catch (err) {
            console.error('生成文章失败:', err);
          } finally {
            div.textContent = originalText;
          }
        });
        titleList.lastElementChild.appendChild(div);
      });

    } catch (err) {
      console.error('获取标题失败:', err);
      titleList.innerHTML = '<div class="error">获取标题失败，请重试</div>';
    } finally {
      convertBtn.disabled = false;
      convertBtn.textContent = '仿写';
    }
  });

  content.addEventListener('input', () => {
    if (content.nextElementSibling) {
      content.nextElementSibling.innerHTML = marked.parse(content.value);  // 使用 marked 解析
    }
  });

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(content.value).then(() => {
      const originalText = copyBtn.textContent;
      copyBtn.textContent = '已复制';
      setTimeout(() => {
        copyBtn.textContent = originalText;
      }, 2000);
    });
  });
}); 