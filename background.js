// background.js - Service Worker: 支持多AI提供商调用

// 提供商配置
const PROVIDERS = {
  deepseek: {
    url: 'https://api.deepseek.com/chat/completions',
    name: 'DeepSeek'
  },
  aliyun: {
    url: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    name: '阿里云百炼'
  }
};

// 监听消息
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'CALL_AI') {
    callAI(msg.provider, msg.apiKey, msg.model, msg.prompt)
      .then(content => sendResponse({ success: true, content }))
      .catch(error => sendResponse({ success: false, error: error.message || String(error) }));
    return true;
  }
});

// 调用AI API（兼容OpenAI格式）
async function callAI(provider, apiKey, model, prompt) {
  const providerConfig = PROVIDERS[provider];
  if (!providerConfig) {
    throw new Error(`未知的AI提供商: ${provider}`);
  }

  const body = {
    model: model,
    messages: [{ role: 'user', content: prompt }],
    stream: false,
    temperature: 0.7,
    max_tokens: 2048
  };

  const response = await fetch(providerConfig.url, {
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
    throw new Error(`[${providerConfig.name}] ${errorMsg}`);
  }

  const data = await response.json();
  if (data.choices && data.choices.length > 0) {
    return data.choices[0].message.content;
  } else {
    throw new Error(`[${providerConfig.name}] API返回数据格式异常`);
  }
}