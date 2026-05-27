// background.js - Service Worker: 处理DeepSeek API调用

// 监听消息
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'CALL_DEEPSEEK') {
    callDeepSeek(msg.apiKey, msg.model, msg.prompt)
      .then(content => {
        sendResponse({ success: true, content: content });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message || String(error) });
      });
    // 返回true表示异步响应
    return true;
  }
});

// 调用DeepSeek API
async function callDeepSeek(apiKey, model, prompt) {
  const url = 'https://api.deepseek.com/chat/completions';
  
  const body = {
    model: model,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ],
    stream: false,
    temperature: 0.7,
    max_tokens: 2048
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMsg = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
    throw new Error(errorMsg);
  }

  const data = await response.json();
  
  if (data.choices && data.choices.length > 0) {
    return data.choices[0].message.content;
  } else {
    throw new Error('API返回数据格式异常');
  }
}