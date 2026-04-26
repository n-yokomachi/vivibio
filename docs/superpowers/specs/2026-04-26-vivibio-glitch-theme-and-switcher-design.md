# vivibio – Glitch テーマ追加 & テーマ切り替え機能 設計

_Date: 2026-04-26_

## 概要

`vivibio` に Glitch テーマを追加し、複数テーマを切り替えるためのスイッチャー UI を実装する。
コンテンツデータは DRY を維持し（`src/data/profile.ts` を変更せず両テーマで共有）、テーマごとに表示を変える。

## 動機

- Glitch は派手でサイバーパンク感のあるテーマで、技術ブロガー兼AI/AWS エンジニアとしての遊び心を表現する
- NFC カードで配布する URL に `#glitch` ハッシュを付けると初回からそのテーマで開ける（運用上の便益）
- 今後さらにテーマが追加されることを見越して、拡張可能なスイッチャー基盤を作る

## アーキテクチャ

### ルーティング

URL ハッシュベース。ページ遷移なしの SPA 風切替。

| URL | 表示 |
|---|---|
| `/` または `/#minimal` | Minimal テーマ |
| `/#glitch` | Glitch テーマ |

### ディレクトリ構成

```
src/
├── components/
│   ├── themes/
│   │   ├── MinimalTheme.astro    # 新規。既存セクションを束ねる
│   │   └── GlitchTheme.astro     # 新規。サイバーパンク
│   ├── ThemeSwitcher.astro       # 新規。右端中央のスイッチャー
│   ├── TopBar.astro              # 既存（Minimal専用）
│   ├── Hero.astro                # 既存（Minimal専用）
│   ├── Links.astro               # 既存（Minimal専用）
│   ├── Output.astro              # 既存（Minimal専用）
│   ├── Footer.astro              # 既存（Minimal専用）
│   └── icons/LinkIcons.astro     # 既存（共有）
├── data/profile.ts               # 既存（変更なし）
├── layouts/BaseLayout.astro      # 修正（data-theme 対応）
└── pages/index.astro             # 修正（両テーマ + スイッチャー配置）
```

### CSS による表示切替

`:root[data-theme]` 属性に応じて表示するパネルを切り替える。

```css
.theme-pane { display: none; }
:root[data-theme="minimal"] .theme-pane[data-theme="minimal"] { display: block; }
:root[data-theme="glitch"]  .theme-pane[data-theme="glitch"]  { display: block; }
```

### 初期テーマ決定ロジック

`<head>` 内 inline script で描画前に `data-theme` を設定（フラッシュ防止）。

```js
(function() {
  try {
    const hash = location.hash.slice(1);
    const stored = localStorage.getItem('vivibio-theme');
    const theme = ['minimal', 'glitch'].includes(hash) ? hash :
                  ['minimal', 'glitch'].includes(stored) ? stored : 'minimal';
    document.documentElement.dataset.theme = theme;
  } catch (e) {
    document.documentElement.dataset.theme = 'minimal';
  }
})();
```

### ハッシュ変化への反応

```js
window.addEventListener('hashchange', () => {
  const next = location.hash.slice(1);
  if (['minimal', 'glitch'].includes(next)) {
    document.documentElement.dataset.theme = next;
    localStorage.setItem('vivibio-theme', next);
  }
});
```

## Glitch テーマ仕様

### カラーパレット

| 役割 | 値 |
|---|---|
| 背景 | `#07010d` |
| マゼンタ（主アクセント） | `#ff2d8d` |
| シアン（副アクセント） | `#16f0ff` |
| 黄（警告色） | `#ffd200` |
| 緑（通知色） | `#00ff88` |
| 文字 | `#fff` |

### タイポグラフィ

- ヒーロー名前: Inter Black、RGB シフト 3 レイヤー
- 一般テキスト: Space Grotesk
- モノスペース: JetBrains Mono

### セクション構成（採用するもののみ）

1. **上部バー（装飾）**: REC・チャンネル・時刻・ランダム MHz
2. **ヒーロー**: タグ + RGB-shift 名前 + サブライン（タイトル/ハンドル/ロケーション）+ タイプライター・タグライン + カラーストライプ
3. **ABOUT カード**: bio (en/ja)、左上に `[ABOUT.TXT]` バッジ
4. **LINKS**: 19 アイコンの正方形タイル（アイコンのみ・英語ラベル無し）
5. **OUTPUT (FEED 風)**: OUTPUTS データを `26 | [ARTICLE] タイトル` 形式で4枚表示
6. **ASCII フッター**: `╳━━━━━ END_OF_TRANSMISSION :: 026 ━━━━━╳`

**採用しないもの**: Marquee, STATUS カード, NOW セクション, セクション見出しの日本語サブタイトル（接続・受信など）

### 装飾要素（派手派手・サイバーパンク仕様）

| 装飾 | 実装方法 |
|---|---|
| 走査線 | CSS `::before` repeating-linear-gradient |
| スキャンビーム | CSS `::after` linear-gradient + 7 秒で translate アニメ |
| パーティクル | Canvas API で 50 個のマゼンタドット + リンク線 |
| RGB shift 名前 | `::before` `::after` 疑似要素を offset + `mix-blend-mode: screen` |
| 周期的グリッチシェイク | 1.8 秒ごとに class 付け外しで shake animation |
| タイプライター | setInterval で文字数を増やしていく |
| 点滅カーソル | CSS `animation: blink 1s steps(2) infinite` |
| カラーストライプ | flex で 8 色のバーを並べる |
| リンクホバー | `transform: translate(-1,-1)` + マゼンタ枠 + シアン box-shadow |
| OUTPUT バッジ | 各種類ごとに色分け（マゼンタ・シアン・黄・緑） |

### 動的要素

すべて vanilla JS（React 不要）：

- パーティクルアニメーション（`requestAnimationFrame`）
- リアルタイム時計（`setInterval(1000)`）
- タイプライター（`setInterval`）
- 周期的グリッチ（`setInterval(1800)`）

## ThemeSwitcher 仕様

### 配置・形状

- `position: fixed; right: 0; top: 50%; transform: translateY(-50%)`
- `flex-direction: column` で各テーマボタンを縦に積む
- 角丸は左側のみ（`border-radius: 12px 0 0 12px`）

### 状態と挙動

| 状態 | スタイル |
|---|---|
| デフォルト | `transform: translateX(calc(100% - 48px))` でアイコン部のみ画面内 |
| デスクトップホバー | `:hover` で `translateX(0)` |
| モバイルタップ | `data-open="true"` で `translateX(0)` |
| アクティブテーマ | `aria-current="true"` でアクセント色枠 |

### スタイル

- 背景: `rgba(20, 20, 28, 0.85)` + `backdrop-filter: blur(20px) saturate(140%)`
- 文字: 白・JetBrains Mono・letter-spacing 広め・UPPERCASE
- transition: `transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)`
- box-shadow: `-4px 0 16px rgba(0, 0, 0, 0.3)`

### テーマ別アイコン (22x22 SVG)

- **Minimal**: 細い白アウトラインの正方形 + 中央 1ドット（清潔・ミニマル）
- **Glitch**: マゼンタ・シアン・白の正方形が offset 重なり（RGB shift 表現）

### イベントハンドリング

| イベント | 挙動 |
|---|---|
| テーマボタンクリック | `location.hash = '#<theme>'` （hashchange を介して反映） |
| `hashchange` | `data-theme` 属性更新 + localStorage 保存 + `aria-current` 更新 |
| モバイル：ボタンクリック後 | `data-open="false"` で閉じる |
| モバイル：外側タップ | document click listener で閉じる |
| ESC キー | 展開していたら閉じる |

### A11y

- `<aside aria-label="Theme switcher">` でランドマーク
- 各ボタンに `aria-current="true|false"` を付与
- `aria-controls` でパネルを示す（必要に応じて）

## BaseLayout 修正

### 追加するもの

```html
<head>
  <!-- 既存メタ・フォント -->
  <script is:inline>
    /* 上記の初期テーマ判定ロジック */
  </script>
</head>
<body>
  <slot />
  <style is:global>
    :root[data-theme="minimal"] body { background: #f7f6f3; color: #1a1a1a; }
    :root[data-theme="glitch"]  body { background: #07010d; color: #fff; }
  </style>
</body>
```

### 既存スタイルの調整

`background: #f7f6f3` ハードコードを `:root[data-theme]` セレクタに移管。
`color: #1a1a1a` も同様。

## index.astro の構成

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import MinimalTheme from '../components/themes/MinimalTheme.astro';
import GlitchTheme from '../components/themes/GlitchTheme.astro';
import ThemeSwitcher from '../components/ThemeSwitcher.astro';
---
<BaseLayout>
  <main class="theme-pane" data-theme="minimal">
    <MinimalTheme />
  </main>
  <main class="theme-pane" data-theme="glitch">
    <GlitchTheme />
  </main>
  <ThemeSwitcher />
</BaseLayout>
```

## DRY 維持の保証

- `src/data/profile.ts` は本作業で変更しない
- 両テーマは `import { PROFILE, LINKS, OUTPUTS } from '../data/profile'` で同じデータを取得
- アイコンも `src/components/icons/LinkIcons.astro` を共有
- 将来テーマ追加時もデータ層は触らずに済む

## テスト・検証手順

1. `npm run build` 成功確認
2. dev サーバー起動 → `chrome-devtools-mcp` で確認:
   - `localhost:4321/` → Minimal 表示
   - `localhost:4321/#glitch` → Glitch 表示
   - スイッチャー操作で双方向切替
   - モバイル emulation（390x844）でタップ展開動作
   - コンソールエラー無し
3. ハッシュ手動変更（アドレスバー編集）でも反応すること
4. ページリロード後にlocalStorage が効いて選択テーマが維持されること

## 範囲外（Out of Scope）

- 新テーマ追加（Cyber, Particles 等）
- profile.ts への新フィールド追加
- アニメーション設定 UI（Tweaks パネル）
- ジャイロ反応・タップ波紋エフェクト
- テーマ間トランジションアニメーション（瞬時切替で OK）
- フォーカスリング等の A11y 詳細カスタマイズ

## オープンクエスチョン（実装中に判断）

- Glitch のリンクアイコンの色: 現状は `currentColor` で white になる予定。視認性低い場合はアクセント色に変更検討
- パーティクル個数 50 がモバイルで重ければ調整
- タイプライター文言は固定（`SIGNAL_LOST · RECONNECTING · HUMAN_FOUND`）
