// popup.js - 设置页面逻辑

const DEFAULT_PROMPTS = [
  { name: '翻译', text: '请将以下内容翻译成中文，保持原文的语气和风格：\n{{text}}', enabled: true },
  { name: '解释', text: '请详细解释以下内容的含义：\n{{text}}', enabled: true },
  { name: '总结', text: '请用简洁的语言总结以下内容的核心要点：\n{{text}}', enabled: true },
  { name: '润色', text: '请帮我润色以下文本，使其更加流畅和优雅：\n{{text}}', enabled: false },
];

// 当前编辑中的prompts状态
let currentPrompts = null;
let currentActiveIndex = 0;

// 加载设置
function loadSettings() {
  chrome.storage.sync.get({
    apiKey: '',
    model: 'deepseek-chat',
    prompts: DEFAULT_PROMPTS,
    activePromptIndex: 0,
    triggerMode: 'float'
  }, (items) => {
    currentPrompts = items.prompts;
    currentActiveIndex = items.activePromptIndex;
    document.getElementById('apiKey').value = items.apiKey;
    document.getElementById('model').value = items.model;
    document.getElementById('triggerMode').value = items.triggerMode;
    renderPromptList();
  });
}

// 渲染提示词列表
function renderPromptList() {
  const listEl = document.getElementById('promptList');
  listEl.innerHTML = '';
  
  currentPrompts.forEach((prompt, index) => {
    const item = document.createElement('div');
    item.className = 'prompt-item';
    item.innerHTML = `
      <input type="radio" name="activePrompt" value="${index}" ${index === currentActiveIndex ? 'checked' : ''}>
      <div class="prompt-text">
        <strong>${prompt.name}</strong>
        <div style="margin-top:2px; word-break:break-all;">${prompt.text.substring(0, 60)}${prompt.text.length > 60 ? '...' : ''}</div>
      </div>
      <div class="prompt-actions">
        <button class="btn btn-secondary edit-btn" data-index="${index}">编辑</button>
        <button class="btn btn-danger delete-btn" data-index="${index}">删除</button>
      </div>
    `;
    listEl.appendChild(item);
  });

  // 绑定radio事件
  listEl.querySelectorAll('input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      currentActiveIndex = parseInt(e.target.value);
    });
  });

  // 绑定编辑按钮
  listEl.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index);
      editPrompt(idx);
    });
  });

  // 绑定删除按钮
  listEl.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index);
      currentPrompts.splice(idx, 1);
      if (currentPrompts.length === 0) {
        currentPrompts.push({ name: '默认', text: '{{text}}', enabled: true });
      }
      if (currentActiveIndex >= currentPrompts.length) {
        currentActiveIndex = 0;
      }
      renderPromptList();
    });
  });
}

// 编辑提示词
function editPrompt(index) {
  const prompt = currentPrompts[index];
  const listEl = document.getElementById('promptList');
  const item = listEl.children[index];
  
  item.innerHTML = `
    <div style="width:100%;">
      <input type="text" id="editName" value="${prompt.name}" placeholder="提示词名称" style="margin-bottom:6px; font-size:12px;">
      <textarea id="editText" style="font-size:12px; min-height:60px;">${prompt.text}</textarea>
      <div class="hint" style="margin-top:4px;">使用 {{text}} 代表划选的文本</div>
      <div style="margin-top:6px; display:flex; gap:4px;">
        <button class="btn btn-primary" style="font-size:11px; padding:4px 12px;" id="saveEditBtn">保存</button>
        <button class="btn btn-secondary" style="font-size:11px; padding:4px 12px;" id="cancelEditBtn">取消</button>
      </div>
    </div>
  `;

  document.getElementById('saveEditBtn').addEventListener('click', () => {
    prompt.name = document.getElementById('editName').value || '未命名';
    prompt.text = document.getElementById('editText').value || '{{text}}';
    renderPromptList();
  });

  document.getElementById('cancelEditBtn').addEventListener('click', () => {
    renderPromptList();
  });
}

// 添加新提示词
document.getElementById('addPromptBtn').addEventListener('click', () => {
  currentPrompts.push({ name: '新提示词', text: '请分析以下内容：\n{{text}}', enabled: true });
  currentActiveIndex = currentPrompts.length - 1;
  renderPromptList();
  // 自动进入编辑模式
  editPrompt(currentPrompts.length - 1);
});

// 保存设置
document.getElementById('saveBtn').addEventListener('click', () => {
  const apiKey = document.getElementById('apiKey').value.trim();
  const model = document.getElementById('model').value;
  const triggerMode = document.getElementById('triggerMode').value;

  if (!apiKey) {
    showStatus('请输入API Key', 'error');
    return;
  }

  chrome.storage.sync.set({
    apiKey: apiKey,
    model: model,
    prompts: currentPrompts,
    activePromptIndex: currentActiveIndex,
    triggerMode: triggerMode
  }, () => {
    showStatus('设置已保存！✅', 'success');
    // 通知content script更新配置
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'CONFIG_UPDATED' });
      }
    });
  });
});

// 显示状态消息
function showStatus(msg, type) {
  const statusEl = document.getElementById('statusMsg');
  statusEl.textContent = msg;
  statusEl.className = 'status ' + type;
  setTimeout(() => {
    statusEl.className = 'status';
  }, 3000);
}

// 初始化
loadSettings();