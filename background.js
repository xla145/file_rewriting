async function genTitle(content) {
  // 调用dify工作流API生成标题
  const response = await fetch('https://api.dify.ai/v1/chat-messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer app-1kTQuObQhQZzouim8MP5vZau'
    },
    body: JSON.stringify({
      inputs: {
        gen_type: 1,
        title: '',
      },
      query: content,
      response_mode: "streaming",
      conversation_id: "",
      user: "user"
    })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let contentArray = [];

  while (true) {
    const {value, done} = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');
    
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        // 移除"data: "前缀
        let lineStr = line;
        if (lineStr.startsWith('data: ')) {
          lineStr = lineStr.substring(6);
        }
        const data = JSON.parse(lineStr);
        if (data.answer) {
          console.log("收到响应:", data.answer);
          contentArray.push(data.answer);
        }
      } catch (e) {
        console.error('解析JSON失败:', e);
      }
    }
  }
  
  const contentStr = contentArray.join('');
  try {
    const titles = JSON.parse(contentStr).map(item => item.title);
    console.log("生成的标题:", titles);
    return titles;
  } catch (e) {
    console.error('解析标题失败:', e);
    return [];
  }
}

async function genContent(title, content) {
  const response = await fetch('https://api.dify.ai/v1/chat-messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer app-1kTQuObQhQZzouim8MP5vZau'
    },
    body: JSON.stringify({
      inputs: {
        gen_type: 2,
        title: title,
      },
      query: content,
      response_mode: "streaming",
      conversation_id: "",
      user: "user"
    })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let contentArray = [];

  while (true) {
    const {value, done} = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');
    
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        let lineStr = line;
        if (lineStr.startsWith('data: ')) {
          lineStr = lineStr.substring(6);
        }
        const data = JSON.parse(lineStr);
        if (data.answer) {
          contentArray.push(data.answer.replace(/'/g, ''));
          console.log("收到响应片段:", data.answer);
        }
      } catch (e) {
        console.error('解析JSON失败:', e);
      }
    }
  }

  const contentStr = contentArray.join('');
  return contentStr;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'genTitle') {
    genTitle(request.content).then(sendResponse);
    return true;
  } else if (request.action === 'genContent') {
    genContent(request.title, request.content).then(sendResponse);
    return true;
  }
}); 