// content.js - 内容脚本：划词检测、浮动按钮、结果弹窗

(function() {
  'use strict';

  // 防止重复注入
  if (window.__deepSeekSelectionAIInjected) return;
  window.__deepSeekSelectionAIInjected = true;

  let config = {
    apiKey: '',
    model: 'deepseek-chat',
    prompts: [],
    activePromptIndex: 0,
    triggerMode: 'float'
  };

  let floatBtn = null;
  let resultPanel = null;
  let isLoading = false;

  // 加载配置
  function loadConfig() {
    chrome.storage.sync.get({
      apiKey: '',
      model: 'deepseek-chat',
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

  // 监听配置更新
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'CONFIG_UPDATED') {
      loadConfig();
    }
  });

  // 创建浮动按钮
  function createFloatBtn() {
    if (floatBtn) floatBtn.remove();

    floatBtn = document.createElement('div');
    floatBtn.className = 'dsai-float-btn';
    floatBtn.innerHTML = '🤖';
    floatBtn.title = 'DeepSeek AI 分析';

    floatBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      const selectedText = window.getSelection().toString().trim();
      if (selectedText) {
        hideFloatBtn();
        showResultPanel(selectedText);
      }
    });

    floatBtn.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      hideFloatBtn();
      hideResultPanel();
    });

    document.body.appendChild(floatBtn);
    return floatBtn;
  }

  // 定位浮动按钮到选区附近
  function positionFloatBtn() {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    if (floatBtn) {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
      
      floatBtn.style.top = (rect.top + scrollTop - 40) + 'px';
      floatBtn.style.left = (rect.left + scrollLeft + rect.width / 2 - 18) + 'px';
      floatBtn.style.display = 'flex';
    }
  }

  // 隐藏浮动按钮
  function hideFloatBtn() {
    if (floatBtn) {
      floatBtn.style.display = 'none';
    }
  }

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
    title.textContent = '🤖 DeepSeek AI';

    const promptSelector = document.createElement('select');
    promptSelector.className = 'dsai-prompt-selector';
    config.prompts.forEach((p, i) => {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = p.name;
      if (i === config.activePromptIndex) opt.selected = true;
      promptSelector.appendChild(opt);
    });
    promptSelector.addEventListener('change', () => {
      config.activePromptIndex = parseInt(promptSelector.value);
      chrome.storage.sync.set({ activePromptIndex: config.activePromptIndex });
    });

    titleArea.appendChild(title);
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

    // 底部操作
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
      if (text) {
        callDeepSeek(text);
      }
    });

    footer.appendChild(copyBtn);
    footer.appendChild(reaskBtn);
    resultPanel.appendChild(footer);

    document.body.appendChild(resultPanel);
    return resultPanel;
  }

  // 显示结果面板
  function showResultPanel(selectedText) {
    if (!config.apiKey) {
      showNoApiKeyPanel();
      return;
    }

    resultPanel = createResultPanel();

    // 设置预览
    const preview = resultPanel.querySelector('.dsai-selected-preview');
    preview.textContent = selectedText.length > 200 ? selectedText.substring(0, 200) + '...' : selectedText;
    preview.dataset.selectedText = selectedText;
    preview.title = selectedText;

    // 定位面板
    positionResultPanel();

    // 调用DeepSeek
    callDeepSeek(selectedText);

    resultPanel.style.display = 'block';
  }

  // 显示未配置API Key的面板
  function showNoApiKeyPanel() {
    resultPanel = createResultPanel();
    const content = resultPanel.querySelector('.dsai-panel-content');
    content.innerHTML = `
      <div class="dsai-no-key">
        <div style="font-size:40px; margin-bottom:12px;">⚠️</div>
        <div style="font-size:14px; font-weight:600; margin-bottom:8px;">未配置API Key</div>
        <div style="font-size:12px; color:#888;">请点击插件图标，在设置页面配置您的DeepSeek API Key</div>
      </div>
    `;
    positionResultPanel();
    resultPanel.style.display = 'block';
  }

  // 定位结果面板
  function positionResultPanel() {
    if (!resultPanel) return;

    const selection = window.getSelection();
    let top, left;

    if (selection.rangeCount) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

      top = rect.bottom + scrollTop + 10;
      left = rect.left + scrollLeft;
    } else {
      top = 100;
      left = 100;
    }

    // 确保面板不超出视窗
    const panelWidth = 420;
    const viewportWidth = window.innerWidth;
    
    if (left + panelWidth > viewportWidth) {
      left = viewportWidth - panelWidth - 20;
    }
    if (left < 10) left = 10;

    resultPanel.style.top = top + 'px';
    resultPanel.style.left = left + 'px';
  }

  // 隐藏结果面板
  function hideResultPanel() {
    if (resultPanel) {
      resultPanel.style.display = 'none';
      isLoading = false;
    }
  }

  // 调用DeepSeek API
  function callDeepSeek(selectedText) {
    const contentEl = resultPanel.querySelector('.dsai-panel-content');
    contentEl.innerHTML = '<div class="dsai-loading"><div class="dsai-spinner"></div><span>正在分析中...</span></div>';
    isLoading = true;

    const prompt = config.prompts[config.activePromptIndex] || config.prompts[0];
    const promptText = prompt.text.replace(/\{\{text\}\}/g, selectedText);

    chrome.runtime.sendMessage({
      type: 'CALL_DEEPSEEK',
      apiKey: config.apiKey,
      model: config.model,
      prompt: promptText
    }, (response) => {
      isLoading = false;
      if (response && response.success) {
        renderResult(response.content);
      } else {
        const errorMsg = response ? response.error : '未知错误';
        contentEl.innerHTML = `<div class="dsai-error">❌ 错误: ${errorMsg}</div>`;
      }
    });
  }

  // 渲染AI结果
  function renderResult(text) {
    const contentEl = resultPanel.querySelector('.dsai-panel-content');
    // 简单的Markdown渲染
    const html = simpleMarkdownRender(text);
    contentEl.innerHTML = `<div class="dsai-result-text">${html}</div>`;
  }

  // 简单Markdown渲染
  function simpleMarkdownRender(text) {
    let html = text;
    // 代码块
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="dsai-code-block"><code>$2</code></pre>');
    // 行内代码
    html = html.replace(/`([^`]+)`/g, '<code class="dsai-inline-code">$1</code>');
    // 粗体
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    // 斜体
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    // 标题
    html = html.replace(/^### (.+)$/gm, '<h4 class="dsai-h">$1</h4>');
    html = html.replace(/^## (.+)$/gm, '<h3 class="dsai-h">$1</h3>');
    html = html.replace(/^# (.+)$/gm, '<h2 class="dsai-h">$1</h2>');
    // 段落换行
    html = html.replace(/\n\n/g, '<br><br>');
    html = html.replace(/\n/g, '<br>');
    return html;
  }

  // 监听文本选择
  document.addEventListener('mouseup', (e) => {
    // 防止在面板内部操作时触发
    if (e.target.closest('.dsai-float-btn') || e.target.closest('.dsai-result-panel')) return;

    setTimeout(() => {
      const selectedText = window.getSelection().toString().trim();
      if (selectedText && selectedText.length > 0) {
        if (config.triggerMode === 'float' || config.triggerMode === 'both') {
          createFloatBtn();
          positionFloatBtn();
        }
      } else {
        hideFloatBtn();
      }
    }, 100);
  });

  // 监听选区变化
  document.addEventListener('selectionchange', () => {
    const selectedText = window.getSelection().toString().trim();
    if (!selectedText) {
      hideFloatBtn();
    }
  });

  // 快捷键 Alt+S
  document.addEventListener('keydown', (e) => {
    if (e.altKey && e.key === 's') {
      e.preventDefault();
      const selectedText = window.getSelection().toString().trim();
      if (selectedText) {
        hideFloatBtn();
        showResultPanel(selectedText);
      }
    }
  });

  // 点击面板外关闭
  document.addEventListener('mousedown', (e) => {
    if (resultPanel && resultPanel.style.display === 'block') {
      if (!e.target.closest('.dsai-result-panel') && !e.target.closest('.dsai-float-btn')) {
        // 延迟关闭，允许用户进行新的选择
        // hideResultPanel();
      }
    }
  });

  // 滚动时重新定位
  window.addEventListener('scroll', () => {
    if (floatBtn && floatBtn.style.display === 'flex') {
      positionFloatBtn();
    }
    if (resultPanel && resultPanel.style.display === 'block') {
      positionResultPanel();
    }
  });

})();