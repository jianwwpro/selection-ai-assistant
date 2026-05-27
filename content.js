// content.js - 内容脚本：划词检测、浮动按钮、结果弹窗（支持多AI提供商）

(function() {
  'use strict';

  if (window.__selectionAIInjected) return;
  window.__selectionAIInjected = true;

  let config = {
    provider: 'deepseek',
    deepseekApiKey: '',
    deepseekModel: 'deepseek-chat',
    aliyunApiKey: '',
    aliyunModel: 'qwen-plus',
    prompts: [],
    activePromptIndex: 0,
    triggerMode: 'float'
  };

  // 提供商显示名称
  const PROVIDER_NAMES = {
    deepseek: 'DeepSeek',
    aliyun: '阿里云百炼'
  };

  let floatBtn = null;
  let resultPanel = null;

  // 加载配置
  function loadConfig() {
    chrome.storage.sync.get({
      provider: 'deepseek',
      deepseekApiKey: '',
      deepseekModel: 'deepseek-chat',
      aliyunApiKey: '',
      aliyunModel: 'qwen-plus',
      prompts: [
        { name: '翻译', text: '请将以下内容翻译成中文，保持原文的语气和风格：\n{{text}}', enabled: true },
        { name: '解释', text: '请详细解释以下内容的含义：\n{{text}}', enabled: true },
        { name: '总结', text: '请用简洁的语言总结以下内容的核心要点：\n{{text}}', enabled: true },
      ],
      activePromptIndex: 0,
      triggerMode: 'float'
    }, (items) => {
      config = items;
    });
  }

  loadConfig();

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'CONFIG_UPDATED') loadConfig();
  });

  // 获取当前提供商的API Key
  function getApiKey() {
    return config.provider === 'deepseek' ? config.deepseekApiKey : config.aliyunApiKey;
  }

  // 获取当前提供商的模型
  function getModel() {
    return config.provider === 'deepseek' ? config.deepseekModel : config.aliyunModel;
  }

  // 创建浮动按钮
  function createFloatBtn() {
    if (floatBtn) floatBtn.remove();
    floatBtn = document.createElement('div');
    floatBtn.className = 'dsai-float-btn';
    floatBtn.innerHTML = '🤖';
    floatBtn.title = '划词AI助手';
    floatBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      const selectedText = window.getSelection().toString().trim();
      if (selectedText) { hideFloatBtn(); showResultPanel(selectedText); }
    });
    floatBtn.addEventListener('dblclick', (e) => {
      e.stopPropagation(); hideFloatBtn(); hideResultPanel();
    });
    document.body.appendChild(floatBtn);
    return floatBtn;
  }

  function positionFloatBtn() {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const rect = selection.getRangeAt(0).getBoundingClientRect();
    if (floatBtn) {
      floatBtn.style.top = (rect.top + window.scrollY - 40) + 'px';
      floatBtn.style.left = (rect.left + window.scrollX + rect.width / 2 - 18) + 'px';
      floatBtn.style.display = 'flex';
    }
  }

  function hideFloatBtn() { if (floatBtn) floatBtn.style.display = 'none'; }

  // 创建结果面板
  function createResultPanel() {
    if (resultPanel) resultPanel.remove();
    resultPanel = document.createElement('div');
    resultPanel.className = 'dsai-result-panel';

    // 头部
    const header = document.createElement('div');
    header.className = 'dsai-panel-header';

    const titleArea = document.createElement('div');
    titleArea.className = 'dsai-panel-title-area';

    const title = document.createElement('span');
    title.className = 'dsai-panel-title';
    title.textContent = '🤖 划词AI助手';

    const providerTag = document.createElement('span');
    providerTag.className = 'dsai-provider-tag';
    providerTag.textContent = PROVIDER_NAMES[config.provider] || config.provider;

    const promptSelector = document.createElement('select');
    promptSelector.className = 'dsai-prompt-selector';
    config.prompts.forEach((p, i) => {
      const opt = document.createElement('option');
      opt.value = i; opt.textContent = p.name;
      if (i === config.activePromptIndex) opt.selected = true;
      promptSelector.appendChild(opt);
    });
    promptSelector.addEventListener('change', () => {
      config.activePromptIndex = parseInt(promptSelector.value);
      chrome.storage.sync.set({ activePromptIndex: config.activePromptIndex });
    });

    titleArea.appendChild(title);
    titleArea.appendChild(providerTag);
    titleArea.appendChild(promptSelector);
    header.appendChild(titleArea);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'dsai-close-btn';
    closeBtn.innerHTML = '✕';
    closeBtn.addEventListener('click', () => hideResultPanel());
    header.appendChild(closeBtn);
    resultPanel.appendChild(header);

    // 选中文本预览
    const preview = document.createElement('div');
    preview.className = 'dsai-selected-preview';
    resultPanel.appendChild(preview);

    // 结果内容
    const content = document.createElement('div');
    content.className = 'dsai-panel-content';
    resultPanel.appendChild(content);

    // 底部
    const footer = document.createElement('div');
    footer.className = 'dsai-panel-footer';

    const copyBtn = document.createElement('button');
    copyBtn.className = 'dsai-action-btn';
    copyBtn.textContent = '📋 复制结果';
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(content.textContent).then(() => {
        copyBtn.textContent = '✅ 已复制';
        setTimeout(() => copyBtn.textContent = '📋 复制结果', 2000);
      });
    });

    const reaskBtn = document.createElement('button');
    reaskBtn.className = 'dsai-action-btn';
    reaskBtn.textContent = '🔄 重新提问';
    reaskBtn.addEventListener('click', () => {
      const previewEl = resultPanel.querySelector('.dsai-selected-preview');
      const text = previewEl.dataset.selectedText;
      if (text) callAI(text);
    });

    footer.appendChild(copyBtn);
    footer.appendChild(reaskBtn);
    resultPanel.appendChild(footer);

    document.body.appendChild(resultPanel);
    return resultPanel;
  }

  function showResultPanel(selectedText) {
    if (!getApiKey()) { showNoApiKeyPanel(); return; }
    resultPanel = createResultPanel();
    const preview = resultPanel.querySelector('.dsai-selected-preview');
    preview.textContent = selectedText.length > 200 ? selectedText.substring(0, 200) + '...' : selectedText;
    preview.dataset.selectedText = selectedText;
    preview.title = selectedText;
    positionResultPanel();
    callAI(selectedText);
    resultPanel.style.display = 'block';
  }

  function showNoApiKeyPanel() {
    resultPanel = createResultPanel();
    const content = resultPanel.querySelector('.dsai-panel-content');
    content.innerHTML = `
      <div class="dsai-no-key">
        <div style="font-size:40px; margin-bottom:12px;">⚠️</div>
        <div style="font-size:14px; font-weight:600; margin-bottom:8px;">未配置API Key</div>
        <div style="font-size:12px; color:#888;">请点击插件图标，在设置页面配置当前提供商 (${PROVIDER_NAMES[config.provider]}) 的API Key</div>
      </div>
    `;
    positionResultPanel();
    resultPanel.style.display = 'block';
  }

  function positionResultPanel() {
    if (!resultPanel) return;
    const selection = window.getSelection();
    let top, left;
    if (selection.rangeCount) {
      const rect = selection.getRangeAt(0).getBoundingClientRect();
      top = rect.bottom + window.scrollY + 10;
      left = rect.left + window.scrollX;
    } else { top = 100; left = 100; }
    const panelWidth = 420;
    if (left + panelWidth > window.innerWidth) left = window.innerWidth - panelWidth - 20;
    if (left < 10) left = 10;
    resultPanel.style.top = top + 'px';
    resultPanel.style.left = left + 'px';
  }

  function hideResultPanel() {
    if (resultPanel) resultPanel.style.display = 'none';
  }

  // 调用AI
  function callAI(selectedText) {
    const contentEl = resultPanel.querySelector('.dsai-panel-content');
    contentEl.innerHTML = '<div class="dsai-loading"><div class="dsai-spinner"></div><span>正在分析中...</span></div>';

    const prompt = config.prompts[config.activePromptIndex] || config.prompts[0];
    const promptText = prompt.text.replace(/\{\{text\}\}/g, selectedText);

    chrome.runtime.sendMessage({
      type: 'CALL_AI',
      provider: config.provider,
      apiKey: getApiKey(),
      model: getModel(),
      prompt: promptText
    }, (response) => {
      if (response && response.success) {
        renderResult(response.content);
      } else {
        const errorMsg = response ? response.error : '未知错误';
        contentEl.innerHTML = `<div class="dsai-error">❌ 错误: ${errorMsg}</div>`;
      }
    });
  }

  function renderResult(text) {
    const contentEl = resultPanel.querySelector('.dsai-panel-content');
    contentEl.innerHTML = `<div class="dsai-result-text">${simpleMarkdownRender(text)}</div>`;
  }

  function simpleMarkdownRender(text) {
    let html = text;
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="dsai-code-block"><code>$2</code></pre>');
    html = html.replace(/`([^`]+)`/g, '<code class="dsai-inline-code">$1</code>');
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    html = html.replace(/^### (.+)$/gm, '<h4 class="dsai-h">$1</h4>');
    html = html.replace(/^## (.+)$/gm, '<h3 class="dsai-h">$1</h3>');
    html = html.replace(/^# (.+)$/gm, '<h2 class="dsai-h">$1</h2>');
    html = html.replace(/\n\n/g, '<br><br>');
    html = html.replace(/\n/g, '<br>');
    return html;
  }

  // 监听文本选择
  document.addEventListener('mouseup', (e) => {
    if (e.target.closest('.dsai-float-btn') || e.target.closest('.dsai-result-panel')) return;
    setTimeout(() => {
      const selectedText = window.getSelection().toString().trim();
      if (selectedText && selectedText.length > 0) {
        if (config.triggerMode === 'float' || config.triggerMode === 'both') {
          createFloatBtn(); positionFloatBtn();
        }
      } else { hideFloatBtn(); }
    }, 100);
  });

  document.addEventListener('selectionchange', () => {
    if (!window.getSelection().toString().trim()) hideFloatBtn();
  });

  // 快捷键 Alt+S
  document.addEventListener('keydown', (e) => {
    if (e.altKey && e.key === 's') {
      e.preventDefault();
      const selectedText = window.getSelection().toString().trim();
      if (selectedText) { hideFloatBtn(); showResultPanel(selectedText); }
    }
  });

  window.addEventListener('scroll', () => {
    if (floatBtn && floatBtn.style.display === 'flex') positionFloatBtn();
    if (resultPanel && resultPanel.style.display === 'block') positionResultPanel();
  });
})();