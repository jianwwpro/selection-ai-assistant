# 🤖 DeepSeek Selection AI Assistant

[中文](#中文) | [English](#english) | [日本語](#日本語)

---

## 中文

### 简介

**DeepSeek 划词AI助手** 是一个 Chrome 浏览器扩展插件，让你在网页上划词划句时，一键调用 DeepSeek AI 进行智能分析。支持自定义提示词，灵活配置 API Key，划词即问，AI秒答！

### 功能特性

- 🖱️ **划词触发** — 选中文本后自动在选区上方出现浮动按钮
- 🤖 **AI 分析** — 点击浮动按钮，调用 DeepSeek API 对选中文本进行智能分析
- 💬 **可配置提示词** — 支持多个自定义提示词，使用 `{{text}}` 代表划选文本，可在结果面板中切换
- 🔑 **可配置 API Key** — 在设置页面配置你的 DeepSeek API Key
- 🧠 **模型选择** — 支持 DeepSeek Chat（通用对话）和 DeepSeek Reasoner（深度推理）
- ⚡ **多种触发方式** — 支持浮动按钮、快捷键 `Alt+S`、或两者兼有
- 📋 **结果操作** — 支持复制结果、重新提问
- 🎨 **Markdown 渲染** — 简单的 Markdown 格式渲染（代码块、粗体、标题等）
- 🌐 **全网页支持** — 可在任意网页上使用

### 安装方法

1. 打开 Chrome 浏览器，进入 `chrome://extensions/`
2. 开启右上角的「开发者模式」
3. 点击「加载已解压的扩展程序」
4. 选择本项目的 `deepseek-selection-ai` 目录
5. 点击浏览器工具栏中的插件图标，配置你的 DeepSeek API Key 和提示词
6. 在任意网页上划选文本即可使用！

### 使用方法

1. **划词分析**：在网页上选中一段文本，选区上方会出现 🤖 浮动按钮，点击即可调用 AI 分析
2. **快捷键分析**：选中文本后按 `Alt+S` 快速触发 AI 分析
3. **切换提示词**：在结果面板顶部的下拉框中切换不同的提示词
4. **配置提示词**：点击插件图标打开设置页面，添加/编辑/删除提示词
5. **复制结果**：点击结果面板底部的「复制结果」按钮

### 提示词配置

在提示词中使用 `{{text}}` 作为占位符，它会被替换为你划选的文本内容。

**内置提示词示例：**

| 名称 | 提示词内容 |
|------|-----------|
| 翻译 | 请将以下内容翻译成中文，保持原文的语气和风格：\n{{text}} |
| 解释 | 请详细解释以下内容的含义：\n{{text}} |
| 总结 | 请用简洁的语言总结以下内容的核心要点：\n{{text}} |
| 润色 | 请帮我润色以下文本，使其更加流畅和优雅：\n{{text}} |

### 文件结构

```
deepseek-selection-ai/
├── manifest.json       — 插件配置 (Manifest V3)
├── background.js       — Service Worker，处理 DeepSeek API 调用
├── content.js          — 内容脚本，划词检测、浮动按钮、结果面板
├── popup.html          — 设置页面 UI
├── popup.js            — 设置页面逻辑
├── styles.css          — 浮动按钮和结果面板样式
└── icons/
    ├── icon16.png      — 16px 图标
    ├── icon48.png      — 48px 图标
    └── icon128.png     — 128px 图标
```

### 获取 DeepSeek API Key

1. 访问 [DeepSeek 开放平台](https://platform.deepseek.com/)
2. 注册/登录账号
3. 在 API Keys 页面创建新的 API Key
4. 将 API Key 复制到插件的设置页面

### 技术栈

- Chrome Extension Manifest V3
- Vanilla JavaScript（无框架依赖）
- DeepSeek Chat API
- Chrome Storage Sync API

---

## English

### Introduction

**DeepSeek Selection AI Assistant** is a Chrome extension that lets you instantly analyze selected text on any webpage using DeepSeek AI. With customizable prompts and configurable API Key, simply select text and get AI-powered insights in seconds!

### Features

- 🖱️ **Selection Trigger** — A floating button appears above the selected text automatically
- 🤖 **AI Analysis** — Click the floating button to call DeepSeek API for intelligent text analysis
- 💬 **Customizable Prompts** — Support multiple custom prompts with `{{text}}` placeholder for selected text, switchable in the result panel
- 🔑 **Configurable API Key** — Set your DeepSeek API Key in the settings page
- 🧠 **Model Selection** — Support DeepSeek Chat (general conversation) and DeepSeek Reasoner (deep reasoning)
- ⚡ **Multiple Trigger Modes** — Support floating button, keyboard shortcut `Alt+S`, or both
- 📋 **Result Operations** — Copy results, re-ask with different prompts
- 🎨 **Markdown Rendering** — Simple Markdown format rendering (code blocks, bold, headings, etc.)
- 🌐 **Universal Support** — Works on any webpage

### Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked"
4. Select the `deepseek-selection-ai` directory of this project
5. Click the extension icon in the toolbar to configure your DeepSeek API Key and prompts
6. Select text on any webpage and start using!

### Usage

1. **Selection Analysis**: Select text on a webpage, a 🤖 floating button will appear above the selection — click to trigger AI analysis
2. **Shortcut Analysis**: Select text and press `Alt+S` to quickly trigger AI analysis
3. **Switch Prompts**: Use the dropdown in the result panel header to switch between different prompts
4. **Configure Prompts**: Click the extension icon to open settings — add/edit/delete prompts
5. **Copy Results**: Click the "Copy Result" button at the bottom of the result panel

### Prompt Configuration

Use `{{text}}` as a placeholder in your prompts — it will be replaced with the selected text.

**Built-in Prompt Examples:**

| Name | Prompt |
|------|--------|
| Translate | Please translate the following content into Chinese, maintaining the original tone and style:\n{{text}} |
| Explain | Please explain the meaning of the following content in detail:\n{{text}} |
| Summarize | Please summarize the key points of the following content concisely:\n{{text}} |
| Polish | Please polish the following text to make it more fluent and elegant:\n{{text}} |

### File Structure

```
deepseek-selection-ai/
├── manifest.json       — Extension config (Manifest V3)
├── background.js       — Service Worker, handles DeepSeek API calls
├── content.js          — Content script, selection detection, floating button, result panel
├── popup.html          — Settings page UI
├── popup.js            — Settings page logic
├── styles.css          — Floating button and result panel styles
└── icons/
    ├── icon16.png      — 16px icon
    ├── icon48.png      — 48px icon
    └── icon128.png     — 128px icon
```

### Getting a DeepSeek API Key

1. Visit [DeepSeek Open Platform](https://platform.deepseek.com/)
2. Register/Login to your account
3. Create a new API Key on the API Keys page
4. Copy the API Key into the extension's settings page

### Tech Stack

- Chrome Extension Manifest V3
- Vanilla JavaScript (no framework dependencies)
- DeepSeek Chat API
- Chrome Storage Sync API

---

## 日本語

### 概要

**DeepSeek 選択テキストAIアシスタント** は、ウェブページ上でテキストを選択（ドラッグ）すると、DeepSeek AI を即座に呼び出して智能分析を行う Chrome拡張機能です。カスタムプロンプトとAPIキーの設定が可能で、テキストを選択すればAIが瞬時に回答！

### 特徴

- 🖱️ **選択トリガー** — テキストを選択すると、選択範囲の上にフローティングボタンが自動表示
- 🤖 **AI分析** — フローティングボタンをクリックすると、DeepSeek API を呼び出してテキストを智能分析
- 💬 **カスタムプロンプト** — `{{text}}` プレースホルダーを使った複数のプロンプトをサポート、結果パネルで切り替え可能
- 🔑 **APIキー設定** — 設定ページでDeepSeek APIキーを設定
- 🧠 **モデル選択** — DeepSeek Chat（一般会話）と DeepSeek Reasoner（深い推論）をサポート
- ⚡ **複数トリガーモード** — フローティングボタン、ショートカットキー `Alt+S`、または両方をサポート
- 📋 **結果操作** — 结果のコピー、再質問をサポート
- 🎨 **Markdownレンダリング** — コードブロック、太字、見出しなどのMarkdown形式のレンダリング
- 🌐 **全ページサポート** — 任意のウェブページで使用可能

### インストール方法

1. Chromeブラウザを開き、`chrome://extensions/` にアクセス
2. 右上の「デベロッパーモード」を有効にする
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. 本プロジェクトの `deepseek-selection-ai` ディレクトリを選択
5. ブラウザツールバーの拡張機能アイコンをクリックし、DeepSeek APIキーとプロンプトを設定
6. 任意のウェブページでテキストを選択して使用開始！

### 使用方法

1. **選択分析**: ウェブページでテキストを選択すると、🤖 フローティングボタンが表示 — クリックしてAI分析をトリガー
2. **ショートカット分析**: テキストを選択後 `Alt+S` を押すとAI分析を即座にトリガー
3. **プロンプト切替**: 結果パネル上部のドロップダウンで異なるプロンプトに切替
4. **プロンプト設定**: 拡張機能アイコンをクリックして設定ページを開く — プロンプトの追加/編集/削除
5. **結果コピー**: 結果パネル下部の「結果をコピー」ボタンをクリック

### プロンプト設定

プロンプト内で `{{text}}` をプレースホルダーとして使用 — 選択したテキストに置換されます。

**内蔵プロンプト例：**

| 名前 | プロンプト |
|------|-----------|
| 翻訳 | 次の内容を中国語に翻訳し、原文のトーンとスタイルを維持してください：\n{{text}} |
| 説明 | 次の内容の意味を詳しく説明してください：\n{{text}} |
| 要約 | 次の内容の核心的なポイントを簡潔に要約してください：\n{{text}} |
| 添削 | 次のテキストをより流暢でエレガントに添削してください：\n{{text}} |

### ファイル構成

```
deepseek-selection-ai/
├── manifest.json       — 拡張機能設定 (Manifest V3)
├── background.js       — Service Worker、DeepSeek API呼び出し処理
├── content.js          — コンテンツスクリプト、選択検出、フローティングボタン、結果パネル
├── popup.html          — 設定ページUI
├── popup.js            — 訋定ページロジック
├── styles.css          — フローティングボタンと結果パネルのスタイル
└── icons/
    ├── icon16.png      — 16pxアイコン
    ├── icon48.png      — 48pxアイコン
    └── icon128.png     — 128pxアイコン
```

### DeepSeek APIキーの取得

1. [DeepSeekオープンプラットフォーム](https://platform.deepseek.com/) にアクセス
2. アカウントを登録/ログイン
3. API Keysページで新しいAPIキーを作成
4. APIキーを拡張機能の設定ページにコピー

### 技術スタック

- Chrome Extension Manifest V3
- Vanilla JavaScript（フレームワーク依存なし）
- DeepSeek Chat API
- Chrome Storage Sync API

---

## License

MIT License

## Contributing

Issues and Pull Requests are welcome!