# Glitch Theme & Theme Switcher Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** vivibio に Glitch（サイバーパンク）テーマを追加し、URLハッシュ連動の右端中央スイッチャーで Minimal ⇄ Glitch を切り替えられるようにする。

**Architecture:** 単一ページ内に両テーマを HTML レンダリング、`:root[data-theme]` 属性 + CSS で表示切替。URL hash と localStorage で状態保持。Glitch のみ vanilla JS でパーティクル・タイプライター・時計を駆動。

**Tech Stack:** Astro 5 / TypeScript / Vanilla JS（React 等は使わない）/ Canvas API / CSS

**Spec:** `docs/superpowers/specs/2026-04-26-vivibio-glitch-theme-and-switcher-design.md`

---

## File Structure

### 新規作成

- `src/components/themes/MinimalTheme.astro` — 既存 Minimal セクションを束ねる薄いラッパ
- `src/components/themes/GlitchTheme.astro` — 自己完結型 Glitch テーマ（HTML+CSS+vanilla JS）
- `src/components/ThemeSwitcher.astro` — 右端のスイッチャー UI + クライアントスクリプト

### 修正

- `src/layouts/BaseLayout.astro` — `<head>` に inline script、`<body>` バックグラウンドを `:root[data-theme]` 連動
- `src/pages/index.astro` — `MinimalTheme` / `GlitchTheme` / `ThemeSwitcher` をホスト

### 変更なし（DRY 維持）

- `src/data/profile.ts` — データ層は触らない
- `src/components/{TopBar,Hero,Links,Output,Footer}.astro` — Minimal 専用なのでそのまま
- `src/components/icons/LinkIcons.astro` — 両テーマで共有

---

## Task 1: BaseLayout に data-theme 対応を追加

**Files:**
- Modify: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: 既存 BaseLayout を読む**

Run: `cat src/layouts/BaseLayout.astro`

Expected: 現在の `<head>` には fonts と meta、`<body>` に `slot` と `<style is:global>` が `background: #f7f6f3; color: #1a1a1a;` をハードコードしている状態。

- [ ] **Step 2: BaseLayout を data-theme 対応に書き換え**

`src/layouts/BaseLayout.astro` を以下で完全に置き換える：

```astro
---
interface Props {
  title?: string;
  description?: string;
}

const {
  title = 'vivibio · NFC profile',
  description = 'vivibio — vivid × vivere × bio. A digital business card for Naoki Yokomachi.',
} = Astro.props;
---

<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
    <meta name="description" content={description} />
    <title>{title}</title>

    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&family=Space+Grotesk:wght@400;500;700;900&display=swap"
      rel="stylesheet"
    />

    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="profile" />
    <meta name="twitter:card" content="summary" />

    <script is:inline>
      (function () {
        try {
          var hash = location.hash.slice(1);
          var stored = localStorage.getItem('vivibio-theme');
          var allowed = ['minimal', 'glitch'];
          var theme =
            allowed.indexOf(hash) >= 0
              ? hash
              : allowed.indexOf(stored) >= 0
                ? stored
                : 'minimal';
          document.documentElement.dataset.theme = theme;
        } catch (e) {
          document.documentElement.dataset.theme = 'minimal';
        }
      })();
    </script>
  </head>
  <body>
    <slot />

    <style is:global>
      *,
      *::before,
      *::after {
        box-sizing: border-box;
      }
      html,
      body {
        margin: 0;
        padding: 0;
        min-height: 100%;
      }
      html {
        overflow-x: hidden;
      }
      :root[data-theme='minimal'] body {
        background: #f7f6f3;
        color: #1a1a1a;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
      }
      :root[data-theme='glitch'] body {
        background: #07010d;
        color: #fff;
        font-family: 'Space Grotesk', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      }
      body {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        overscroll-behavior-y: none;
      }
      a {
        color: inherit;
      }
      .theme-pane {
        display: none;
      }
      :root[data-theme='minimal'] .theme-pane[data-theme='minimal'],
      :root[data-theme='glitch'] .theme-pane[data-theme='glitch'] {
        display: block;
      }
    </style>
  </body>
</html>
```

- [ ] **Step 3: ビルド成功を確認**

Run: `npm run build 2>&1 | tail -10`

Expected: `[build] Complete!` が表示され、エラーなし。

- [ ] **Step 4: dev サーバーで Minimal が壊れていないことを確認**

Run: `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4321/` (dev サーバーがすでに走っている前提。なければ `npm run dev` をバックグラウンド起動)

Expected: `200` が返る。`curl http://localhost:4321/ | grep 'data-theme'` で `data-theme="minimal"` が含まれることを確認（注：inline script は curl で取得した HTML には反映されないので、Chrome DevTools MCP で確認）。

- [ ] **Step 5: Chrome DevTools MCP で Minimal が動いているか確認**

`mcp__chrome-devtools__navigate_page` で `http://localhost:4321/` を開く。
`mcp__chrome-devtools__evaluate_script` で `() => document.documentElement.dataset.theme` を実行。

Expected: `"minimal"` が返る。背景が `#f7f6f3` のままページが正常表示。

- [ ] **Step 6: コミット**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "refactor(layout): BaseLayout を data-theme 属性で背景・フォントを切り替えられるようにする"
```

---

## Task 2: MinimalTheme コンポーネントを作成し index.astro を再構成

**Files:**
- Create: `src/components/themes/MinimalTheme.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: MinimalTheme.astro を作成**

`mkdir -p src/components/themes` が必要。

`src/components/themes/MinimalTheme.astro`:

```astro
---
import TopBar from '../TopBar.astro';
import Hero from '../Hero.astro';
import Links from '../Links.astro';
import Output from '../Output.astro';
import Footer from '../Footer.astro';
---

<div class="mn">
  <TopBar />
  <Hero />
  <Links />
  <Output />
  <Footer />
</div>

<style>
  .mn {
    min-height: 100dvh;
    max-width: 960px;
    margin: 0 auto;
    padding: 28px 24px 64px;
  }

  @media (min-width: 768px) {
    .mn {
      padding: 40px 48px 80px;
    }
  }
</style>
```

- [ ] **Step 2: index.astro を再構成**

`src/pages/index.astro` を以下で完全に置き換える：

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import MinimalTheme from '../components/themes/MinimalTheme.astro';
---

<BaseLayout>
  <main class="theme-pane" data-theme="minimal">
    <MinimalTheme />
  </main>
</BaseLayout>
```

注：この時点ではまだ Glitch も Switcher も配置していない。

- [ ] **Step 3: ビルド成功を確認**

Run: `npm run build 2>&1 | tail -10`

Expected: `Complete!`

- [ ] **Step 4: ブラウザで Minimal の見た目が変わっていないことを確認**

`mcp__chrome-devtools__navigate_page` reload `http://localhost:4321/`。
`mcp__chrome-devtools__take_screenshot` でスクリーンショットを撮る。

Expected: 既存 Minimal と完全に同じ見た目（avatar 64px・hero・19リンク・4 OUTPUT カード）。

- [ ] **Step 5: コミット**

```bash
git add src/components/themes/MinimalTheme.astro src/pages/index.astro
git commit -m "refactor(themes): Minimal セクションを MinimalTheme コンポーネントに集約"
```

---

## Task 3: ThemeSwitcher コンポーネントを作成（UI のみ）

**Files:**
- Create: `src/components/ThemeSwitcher.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: ThemeSwitcher.astro を作成（UI とデフォルトスタイル、まだ click ロジックなし）**

`src/components/ThemeSwitcher.astro`:

```astro
---
const themes = [
  { id: 'minimal', label: 'MINIMAL' },
  { id: 'glitch', label: 'GLITCH' },
];
---

<aside class="ts" data-open="false" aria-label="Theme switcher">
  {
    themes.map((t) => (
      <button class="ts-btn" data-theme-target={t.id} aria-current={t.id === 'minimal' ? 'true' : 'false'}>
        <span class="ts-icon">
          {t.id === 'minimal' && (
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">
              <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
              <circle cx="12" cy="12" r="2.6" fill="currentColor" />
            </svg>
          )}
          {t.id === 'glitch' && (
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <rect x="3" y="3" width="14" height="14" rx="2" fill="#ff2d8d" />
              <rect x="7" y="7" width="14" height="14" rx="2" fill="#16f0ff" />
              <rect x="5" y="5" width="14" height="14" rx="2" fill="#fff" fill-opacity="0.85" />
            </svg>
          )}
        </span>
        <span class="ts-label">{t.label}</span>
      </button>
    ))
  }
</aside>

<style>
  .ts {
    position: fixed;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    z-index: 100;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .ts-btn {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 160px;
    padding: 12px 14px;
    background: rgba(20, 20, 28, 0.85);
    color: #fff;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-right: 0;
    border-radius: 12px 0 0 12px;
    backdrop-filter: blur(20px) saturate(140%);
    -webkit-backdrop-filter: blur(20px) saturate(140%);
    box-shadow: -4px 0 16px rgba(0, 0, 0, 0.3);
    cursor: pointer;
    transform: translateX(calc(100% - 48px));
    transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1), border-color 0.18s ease;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    text-align: left;
  }

  .ts-btn:hover {
    border-color: rgba(255, 255, 255, 0.4);
  }

  .ts-icon {
    width: 22px;
    height: 22px;
    flex-shrink: 0;
    color: currentColor;
    display: grid;
    place-items: center;
  }

  .ts-label {
    white-space: nowrap;
    flex: 1;
  }

  /* Active theme highlight */
  .ts-btn[aria-current='true'] {
    border-color: #ff5733;
  }
  :root[data-theme='glitch'] .ts-btn[aria-current='true'] {
    border-color: #ff2d8d;
    box-shadow: -4px 0 16px rgba(255, 45, 141, 0.25);
  }

  /* Hover: slide whole stack out (desktop) */
  @media (hover: hover) {
    .ts:hover .ts-btn {
      transform: translateX(0);
    }
  }

  /* Mobile / explicit open */
  .ts[data-open='true'] .ts-btn {
    transform: translateX(0);
  }
</style>
```

- [ ] **Step 2: index.astro にスイッチャーを追加**

`src/pages/index.astro` を以下に更新：

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import MinimalTheme from '../components/themes/MinimalTheme.astro';
import ThemeSwitcher from '../components/ThemeSwitcher.astro';
---

<BaseLayout>
  <main class="theme-pane" data-theme="minimal">
    <MinimalTheme />
  </main>
  <ThemeSwitcher />
</BaseLayout>
```

- [ ] **Step 3: ビルド成功を確認**

Run: `npm run build 2>&1 | tail -10`

Expected: `Complete!`

- [ ] **Step 4: Chrome DevTools MCP で表示確認**

`mcp__chrome-devtools__navigate_page` reload。
`mcp__chrome-devtools__emulate` で viewport `1280x900x2`。
`mcp__chrome-devtools__take_screenshot` で確認。

Expected: 画面右端中央にスイッチャーが配置され、MINIMAL ボタンが選択状態（橙色のボーダー）、ボタン本体は右に隠れていてアイコンだけ覗いている状態。

- [ ] **Step 5: ホバー動作の確認**

`mcp__chrome-devtools__evaluate_script` で:
```js
() => {
  const ts = document.querySelector('.ts');
  const rect = ts.getBoundingClientRect();
  return { right: rect.right, left: rect.left, width: rect.width };
}
```

Expected: `right` ≈ viewport の右端、`width` ≈ 160px、`left` ≈ viewport幅 - 48px（アイコン部分のみ画面内）。

- [ ] **Step 6: コミット**

```bash
git add src/components/ThemeSwitcher.astro src/pages/index.astro
git commit -m "feat(switcher): テーマスイッチャー UI を追加（右端からスライドイン、ロジックは次タスク）"
```

---

## Task 4: ThemeSwitcher のクライアントロジックを実装

**Files:**
- Modify: `src/components/ThemeSwitcher.astro`

- [ ] **Step 1: ThemeSwitcher.astro の末尾に `<script>` を追加**

`src/components/ThemeSwitcher.astro` の `</style>` の後ろに以下を追加：

```astro
<script>
  const ALLOWED = ['minimal', 'glitch'] as const;
  type ThemeId = (typeof ALLOWED)[number];

  const root = document.documentElement;
  const ts = document.querySelector<HTMLElement>('.ts');
  const buttons = document.querySelectorAll<HTMLButtonElement>('.ts-btn');

  function isAllowed(v: string | null): v is ThemeId {
    return v !== null && (ALLOWED as readonly string[]).includes(v);
  }

  function applyTheme(id: ThemeId, opts: { persist?: boolean } = { persist: true }) {
    root.dataset.theme = id;
    if (opts.persist !== false) {
      try {
        localStorage.setItem('vivibio-theme', id);
      } catch (e) {
        /* ignore */
      }
    }
    buttons.forEach((b) => {
      b.setAttribute('aria-current', b.dataset.themeTarget === id ? 'true' : 'false');
    });
  }

  // Initialize aria-current from current theme (set by inline script in BaseLayout)
  const initial = isAllowed(root.dataset.theme ?? null) ? (root.dataset.theme as ThemeId) : 'minimal';
  applyTheme(initial, { persist: false });

  // Click handler — switch theme via hash
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.themeTarget;
      if (!isAllowed(target ?? null)) return;
      location.hash = '#' + target;
      // hashchange will fire and update everything; also close mobile menu
      if (ts) ts.dataset.open = 'false';
    });
  });

  // hashchange listener
  window.addEventListener('hashchange', () => {
    const hash = location.hash.slice(1);
    if (isAllowed(hash)) applyTheme(hash);
  });

  // Mobile: tap-anywhere on the switcher toggles open/closed
  if (ts) {
    ts.addEventListener('click', (e) => {
      if (window.matchMedia('(hover: hover)').matches) return; // desktop uses hover
      const target = e.target as HTMLElement;
      // If user tapped on a button, the click handler above runs; here we only handle non-button area
      if (target.closest('.ts-btn')) return;
      ts.dataset.open = ts.dataset.open === 'true' ? 'false' : 'true';
    });
  }

  // Close menu on outside tap (mobile) and on ESC
  document.addEventListener('click', (e) => {
    if (!ts) return;
    if (window.matchMedia('(hover: hover)').matches) return;
    if (!ts.contains(e.target as Node)) ts.dataset.open = 'false';
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && ts) ts.dataset.open = 'false';
  });
</script>
```

- [ ] **Step 2: ビルド成功を確認**

Run: `npm run build 2>&1 | tail -10`

Expected: `Complete!`

- [ ] **Step 3: クリック時にハッシュが変わることを確認**

`mcp__chrome-devtools__navigate_page` reload `http://localhost:4321/`。
`mcp__chrome-devtools__click` で `.ts-btn[data-theme-target="glitch"]` をクリック。
`mcp__chrome-devtools__evaluate_script` で `() => location.hash` を実行。

Expected: `"#glitch"` が返る。

注：この時点では Glitch テーマがまだ実装されていないので、画面は何も表示されない（theme-pane[data-theme="glitch"] が存在しない）。これは想定通り、次タスクで実装。`document.documentElement.dataset.theme` が `"glitch"` になっていることを `evaluate_script` で確認できれば OK。

- [ ] **Step 4: aria-current が更新されることを確認**

`mcp__chrome-devtools__evaluate_script`:
```js
() => Array.from(document.querySelectorAll('.ts-btn')).map(b => ({
  target: b.dataset.themeTarget,
  current: b.getAttribute('aria-current')
}))
```

Expected: GLITCH ボタンが `aria-current="true"`、MINIMAL が `false`。

- [ ] **Step 5: localStorage に保存されていることを確認**

`mcp__chrome-devtools__evaluate_script`:
```js
() => localStorage.getItem('vivibio-theme')
```

Expected: `"glitch"`。

- [ ] **Step 6: ハッシュ手動変更でも反応することを確認**

`mcp__chrome-devtools__evaluate_script`:
```js
() => { location.hash = '#minimal'; return document.documentElement.dataset.theme; }
```

注：hashchange は非同期なので、続けて：
```js
() => new Promise(r => setTimeout(() => r(document.documentElement.dataset.theme), 50))
```

Expected: `"minimal"`

- [ ] **Step 7: ハッシュを minimal に戻して画面を Minimal に戻す**

`mcp__chrome-devtools__evaluate_script`:
```js
() => { location.hash = '#minimal'; }
```

- [ ] **Step 8: コミット**

```bash
git add src/components/ThemeSwitcher.astro
git commit -m "feat(switcher): クリックで location.hash を更新し data-theme・localStorage と同期するロジック"
```

---

## Task 5: GlitchTheme の構造とベーススタイル（アニメーション・JS なし）

**Files:**
- Create: `src/components/themes/GlitchTheme.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: GlitchTheme.astro を作成**

`src/components/themes/GlitchTheme.astro`:

```astro
---
import { PROFILE, LINKS, OUTPUTS } from '../../data/profile';
import LinkIcons from '../icons/LinkIcons.astro';

const asciiFooter = `╳━━━━━━━━━━━━━━━━━━━━━━━━━━━━╳
   END_OF_TRANSMISSION  ::  026
╳━━━━━━━━━━━━━━━━━━━━━━━━━━━━╳`;

const stripeColors = ['#ff2d8d', '#16f0ff', '#ffd200', '#00ff88', '#ff3b3b', '#ffffff', '#7d4eff', '#ff8a00'];
---

<div class="gl">
  <canvas class="gl-particles" aria-hidden="true"></canvas>

  <div class="gl-content">
    <header class="gl-bar">
      <span class="gl-pink">● REC</span>
      <span class="gl-cyan">CH.026</span>
      <span class="gl-spacer"></span>
      <span class="gl-mono gl-clock" data-glitch-clock>--:--:--</span>
      <span class="gl-yel gl-mono">142.7MHz</span>
    </header>

    <section class="gl-hero">
      <span class="gl-tag">[ NFC ] HUMAN_DETECTED</span>

      <div class="gl-name-shake" data-glitch-shake>
        <span class="gl-rgb" data-text={PROFILE.name}>{PROFILE.name}</span>
      </div>

      <div class="gl-mono gl-line">
        // {PROFILE.title.toLowerCase()} · {PROFILE.location.toLowerCase()} · {PROFILE.handle}
      </div>

      <div class="gl-mono gl-tagline gl-cyan">
        <span data-glitch-typewriter data-text="SIGNAL_LOST · RECONNECTING · HUMAN_FOUND"></span><span class="gl-cursor"></span>
      </div>

      <div class="gl-stripe">
        {stripeColors.map((c, i) => <i style={`background:${c};height:${8 + (i % 3) * 6}px`}></i>)}
      </div>
    </section>

    <section class="gl-card" data-tag="ABOUT.TXT">
      <div class="gl-bio-en">{PROFILE.bio}</div>
      <div class="gl-bio-ja">{PROFILE.bioJa}</div>
    </section>

    <h2 class="gl-h2"><span class="gl-h2-dot"></span>LINKS</h2>
    <div class="gl-links">
      {LINKS.map((l) => (
        <a
          href={l.url}
          class="gl-link"
          title={`${l.label} · ${l.handle}`}
          target={l.url.startsWith('mailto:') ? undefined : '_blank'}
          rel={l.url.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
        >
          <span class="ic"><LinkIcons id={l.id} /></span>
        </a>
      ))}
    </div>

    <h2 class="gl-h2"><span class="gl-h2-dot"></span>OUTPUT</h2>
    <div class="gl-output gl-card" data-tag="STREAM">
      {OUTPUTS.map((o) => (
        <a href={o.url} class="gl-output-row" target="_blank" rel="noopener noreferrer">
          <span class="gl-mono gl-output-mark gl-yel">26</span>
          <span class={`gl-mono gl-output-badge gl-badge-${o.badge.toLowerCase()}`}>[{o.badge}]</span>
          <span class="gl-output-title">{o.title}</span>
        </a>
      ))}
    </div>

    <pre class="gl-ascii">{asciiFooter}</pre>
  </div>
</div>

<style>
  .gl {
    position: relative;
    min-height: 100dvh;
    overflow: hidden;
    color: #fff;
  }

  /* Particle canvas — full coverage, behind content */
  .gl-particles {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
  }

  /* Scanline overlay */
  .gl::before {
    content: '';
    position: fixed;
    inset: 0;
    background: repeating-linear-gradient(
      0deg,
      rgba(255, 0, 180, 0.04) 0 1px,
      transparent 1px 2px
    );
    pointer-events: none;
    z-index: 5;
  }

  /* Scanbeam — slow-moving white sweep */
  .gl::after {
    content: '';
    position: fixed;
    inset: 0;
    background: linear-gradient(
      180deg,
      transparent 0 49%,
      rgba(255, 255, 255, 0.05) 49.5% 50%,
      transparent 50% 100%
    );
    animation: gl-scan 7s linear infinite;
    pointer-events: none;
    z-index: 6;
  }
  @keyframes gl-scan {
    from { transform: translateY(-100%); }
    to { transform: translateY(100%); }
  }

  .gl-content {
    position: relative;
    z-index: 2;
    padding: 16px;
    max-width: 960px;
    margin: 0 auto;
  }

  @media (min-width: 768px) {
    .gl-content {
      padding: 24px 32px 60px;
    }
  }

  .gl-mono {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
  }
  .gl-pink { color: #ff2d8d; }
  .gl-cyan { color: #16f0ff; }
  .gl-yel  { color: #ffd200; }
  .gl-grn  { color: #00ff88; }

  /* Top bar */
  .gl-bar {
    display: flex;
    gap: 10px;
    align-items: center;
    font-size: 10px;
    padding-bottom: 14px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    letter-spacing: 0.06em;
  }
  .gl-spacer { flex: 1; }

  /* Hero */
  .gl-hero {
    padding: 28px 0 8px;
  }
  .gl-tag {
    display: inline-block;
    padding: 4px 10px;
    font-size: 10px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    background: #ff2d8d;
    color: #07010d;
    font-weight: 800;
    margin-bottom: 16px;
  }

  /* RGB-shifted name */
  .gl-name-shake { display: inline-block; }
  .gl-rgb {
    position: relative;
    display: inline-block;
    line-height: 0.85;
    font-weight: 900;
    font-size: clamp(48px, 13vw, 120px);
    letter-spacing: -0.04em;
    text-transform: uppercase;
    color: #fff;
    font-family: 'Inter', 'Helvetica Neue', sans-serif;
  }
  .gl-rgb::before,
  .gl-rgb::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    mix-blend-mode: screen;
    pointer-events: none;
  }
  .gl-rgb::before {
    color: #ff2d8d;
    transform: translate(-3px, 1px);
  }
  .gl-rgb::after {
    color: #16f0ff;
    transform: translate(3px, -1px);
  }

  .gl-line {
    font-size: 12px;
    opacity: 0.75;
    margin-top: 18px;
    letter-spacing: 0.04em;
  }
  .gl-tagline {
    margin-top: 10px;
    font-size: 11px;
    min-height: 1.4em;
  }
  .gl-cursor {
    display: inline-block;
    width: 7px;
    height: 12px;
    margin-left: 2px;
    vertical-align: -1px;
    background: #16f0ff;
    animation: gl-blink 1s steps(2) infinite;
  }
  @keyframes gl-blink {
    50% { opacity: 0; }
  }

  .gl-stripe {
    display: flex;
    gap: 4px;
    margin-top: 22px;
    align-items: flex-end;
  }
  .gl-stripe i {
    display: block;
    flex: 1;
  }

  /* Cards */
  .gl-card {
    padding: 16px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    background: rgba(255, 255, 255, 0.03);
    margin: 24px 0;
    position: relative;
  }
  .gl-card::before {
    content: attr(data-tag);
    position: absolute;
    top: -1px;
    left: -1px;
    padding: 3px 8px;
    background: #16f0ff;
    color: #07010d;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.14em;
  }
  .gl-bio-en {
    font-size: 14px;
    line-height: 1.55;
    margin-top: 12px;
  }
  .gl-bio-ja {
    font-size: 12px;
    line-height: 1.7;
    margin-top: 12px;
    opacity: 0.65;
    word-break: auto-phrase;
    line-break: strict;
  }

  /* Section heading */
  .gl-h2 {
    font-size: 24px;
    font-weight: 900;
    letter-spacing: -0.02em;
    text-transform: uppercase;
    margin: 28px 0 10px;
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: 'Inter', sans-serif;
  }
  .gl-h2-dot {
    display: inline-block;
    width: 10px;
    height: 10px;
    background: #ff2d8d;
    box-shadow: 0 0 14px #ff2d8d;
  }

  /* Links grid (icon-only) */
  .gl-links {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
    gap: 6px;
  }
  .gl-link {
    aspect-ratio: 1 / 1;
    display: grid;
    place-items: center;
    border: 1px solid rgba(255, 255, 255, 0.15);
    background: rgba(255, 255, 255, 0.03);
    text-decoration: none;
    color: #fff;
    transition: transform 0.12s ease, color 0.12s ease, border-color 0.12s ease, box-shadow 0.12s ease;
    position: relative;
    overflow: hidden;
  }
  .gl-link:hover,
  .gl-link:active {
    border-color: #ff2d8d;
    color: #ff2d8d;
    transform: translate(-1px, -1px);
    box-shadow: 3px 3px 0 #16f0ff;
  }
  .gl-link .ic {
    width: 22px;
    height: 22px;
  }

  /* Output (feed style) */
  .gl-output {
    padding: 8px 16px;
  }
  .gl-output-row {
    display: grid;
    grid-template-columns: auto auto 1fr;
    gap: 10px;
    align-items: baseline;
    padding: 10px 0;
    border-bottom: 1px dashed rgba(255, 255, 255, 0.1);
    text-decoration: none;
    color: #fff;
    transition: color 0.12s ease;
  }
  .gl-output-row:last-child {
    border-bottom: 0;
  }
  .gl-output-row:hover {
    color: #ff2d8d;
  }
  .gl-output-mark {
    font-size: 11px;
    font-weight: 700;
  }
  .gl-output-badge {
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.1em;
  }
  .gl-badge-article { color: #ff2d8d; }
  .gl-badge-talk    { color: #ffd200; }
  .gl-badge-repo    { color: #00ff88; }
  .gl-badge-slide   { color: #16f0ff; }
  .gl-output-title {
    font-size: 13px;
    line-height: 1.4;
  }

  /* ASCII footer */
  .gl-ascii {
    margin-top: 32px;
    margin-bottom: 24px;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    white-space: pre;
    font-size: 10px;
    line-height: 1.05;
    color: #ff2d8d;
    opacity: 0.7;
    text-align: center;
    overflow-x: auto;
  }
</style>
```

- [ ] **Step 2: index.astro に GlitchTheme を追加**

`src/pages/index.astro` を以下に更新：

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

- [ ] **Step 3: ビルド成功を確認**

Run: `npm run build 2>&1 | tail -10`

Expected: `Complete!`

- [ ] **Step 4: Glitch テーマの表示を確認**

`mcp__chrome-devtools__navigate_page` で `http://localhost:4321/#glitch` を開く。
`mcp__chrome-devtools__take_screenshot` で確認。

Expected: 黒背景の Glitch 画面が表示。RGB シフト名前・タグ `[NFC] HUMAN_DETECTED`・bio カード・19リンクのアイコングリッド・OUTPUT 4枚がフィード形式で表示・ASCII フッター。タイプライターはまだ動かないので空の領域が見える。時計は `--:--:--`。

- [ ] **Step 5: スイッチャーの表示色が Glitch 用に変わったことを確認**

スクリーンショットで GLITCH ボタンの枠がマゼンタ系になっていることを確認。

- [ ] **Step 6: Minimal に戻ってもまだ正常表示か確認**

`mcp__chrome-devtools__evaluate_script`: `() => { location.hash = '#minimal'; }`
スクリーンショット → Minimal が無事表示。

- [ ] **Step 7: コミット**

```bash
git add src/components/themes/GlitchTheme.astro src/pages/index.astro
git commit -m "feat(theme): Glitch テーマの構造とベーススタイル（アニメーションは次タスク）"
```

---

## Task 6: Glitch の動的要素（時計・タイプライター・周期グリッチ）

**Files:**
- Modify: `src/components/themes/GlitchTheme.astro`

- [ ] **Step 1: スクリプトとシェイクアニメーション CSS を追加**

`src/components/themes/GlitchTheme.astro` の `</style>` の直前に以下を追加：

```css
  /* Glitch shake animation */
  @keyframes gl-shake {
    0%, 100% { transform: translate(0, 0); }
    25% { transform: translate(-3px, 1px); }
    50% { transform: translate(2px, -2px); }
    75% { transform: translate(-1px, 2px); }
  }
  .gl-shake {
    animation: gl-shake 0.18s steps(2) 1;
  }
```

そして `</style>` の後ろに以下のスクリプトを追加：

```astro
<script>
  // Run only when Glitch theme is active (lazy init via observer)
  function initGlitchEffects() {
    // Already initialized?
    if ((window as any).__glitchInited) return;
    (window as any).__glitchInited = true;

    // ----- Clock -----
    const clockEl = document.querySelector<HTMLElement>('[data-glitch-clock]');
    if (clockEl) {
      const tick = () => {
        const now = new Date();
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        const ss = String(now.getSeconds()).padStart(2, '0');
        clockEl.textContent = `${hh}:${mm}:${ss}`;
      };
      tick();
      setInterval(tick, 1000);
    }

    // ----- Typewriter -----
    const tw = document.querySelector<HTMLElement>('[data-glitch-typewriter]');
    if (tw) {
      const text = tw.dataset.text ?? '';
      let i = 0;
      const speed = 35;
      const pauseAtEnd = 2200;
      const step = () => {
        if (i <= text.length) {
          tw.textContent = text.slice(0, i);
          i++;
          setTimeout(step, speed);
        } else {
          // Hold then restart
          setTimeout(() => {
            i = 0;
            step();
          }, pauseAtEnd);
        }
      };
      step();
    }

    // ----- Periodic glitch shake on the name -----
    const shakeEl = document.querySelector<HTMLElement>('[data-glitch-shake]');
    if (shakeEl) {
      setInterval(() => {
        if (Math.random() > 0.5) {
          shakeEl.classList.add('gl-shake');
          setTimeout(() => shakeEl.classList.remove('gl-shake'), 200);
        }
      }, 1800);
    }
  }

  // Run on initial load if already on Glitch theme, otherwise wait
  if (document.documentElement.dataset.theme === 'glitch') {
    initGlitchEffects();
  } else {
    // Watch for theme changes; init once Glitch becomes active
    const observer = new MutationObserver(() => {
      if (document.documentElement.dataset.theme === 'glitch') {
        initGlitchEffects();
        observer.disconnect();
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }
</script>
```

- [ ] **Step 2: ビルド成功を確認**

Run: `npm run build 2>&1 | tail -10`

Expected: `Complete!`

- [ ] **Step 3: 時計とタイプライターが動くことを確認**

`mcp__chrome-devtools__navigate_page` で `http://localhost:4321/#glitch` を reload。
3秒待って `mcp__chrome-devtools__evaluate_script`:
```js
() => ({
  clock: document.querySelector('[data-glitch-clock]')?.textContent,
  tw: document.querySelector('[data-glitch-typewriter]')?.textContent,
})
```

Expected: clock が `HH:MM:SS` 形式（`--:--:--` ではない）、tw に何かしら文字が入っている（タイプ進行中）。

- [ ] **Step 4: スクリーンショット撮影**

`mcp__chrome-devtools__take_screenshot` で確認。タイプライターが動いている瞬間が見える。

- [ ] **Step 5: コミット**

```bash
git add src/components/themes/GlitchTheme.astro
git commit -m "feat(theme): Glitch の時計・タイプライター・周期グリッチシェイクを実装"
```

---

## Task 7: Glitch のパーティクル背景

**Files:**
- Modify: `src/components/themes/GlitchTheme.astro`

- [ ] **Step 1: パーティクル初期化関数をスクリプトに追加**

`src/components/themes/GlitchTheme.astro` の `<script>` 内、`initGlitchEffects()` 関数の中の最後に以下を追加（typewriter / shake の後）：

```ts
    // ----- Particle canvas -----
    const canvas = document.querySelector<HTMLCanvasElement>('.gl-particles');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        let w = 0;
        let h = 0;
        const COUNT = 50;
        const COLOR = '#ff2d8d';
        const LINK_DIST = 80;

        type P = { x: number; y: number; vx: number; vy: number; r: number };
        const particles: P[] = [];

        function resize() {
          if (!canvas || !ctx) return;
          w = canvas.clientWidth;
          h = canvas.clientHeight;
          canvas.width = w * dpr;
          canvas.height = h * dpr;
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        function spawn() {
          particles.length = 0;
          for (let i = 0; i < COUNT; i++) {
            particles.push({
              x: Math.random() * w,
              y: Math.random() * h,
              vx: (Math.random() - 0.5) * 0.3,
              vy: (Math.random() - 0.5) * 0.3,
              r: Math.random() * 1.4 + 0.4,
            });
          }
        }

        let raf = 0;
        function tick() {
          if (!ctx) return;
          ctx.clearRect(0, 0, w, h);
          for (const p of particles) {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0) p.x += w;
            if (p.x > w) p.x -= w;
            if (p.y < 0) p.y += h;
            if (p.y > h) p.y -= h;
            ctx.fillStyle = COLOR;
            ctx.globalAlpha = 0.7;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.strokeStyle = COLOR;
          ctx.lineWidth = 0.5;
          for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
              const dx = particles[i].x - particles[j].x;
              const dy = particles[i].y - particles[j].y;
              const d2 = dx * dx + dy * dy;
              if (d2 < LINK_DIST * LINK_DIST) {
                ctx.globalAlpha = 0.15 * (1 - Math.sqrt(d2) / LINK_DIST);
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
              }
            }
          }
          raf = requestAnimationFrame(tick);
        }

        const ro = new ResizeObserver(() => {
          resize();
          spawn();
        });
        ro.observe(canvas);

        resize();
        spawn();
        tick();

        // Pause animation when tab is hidden to save CPU
        document.addEventListener('visibilitychange', () => {
          if (document.hidden) {
            cancelAnimationFrame(raf);
          } else {
            tick();
          }
        });
      }
    }
```

- [ ] **Step 2: ビルド成功を確認**

Run: `npm run build 2>&1 | tail -10`

Expected: `Complete!`

- [ ] **Step 3: パーティクルが動いていることを確認**

`mcp__chrome-devtools__navigate_page` で `http://localhost:4321/#glitch` reload。
2秒待ってから `mcp__chrome-devtools__evaluate_script`:
```js
() => {
  const canvas = document.querySelector('.gl-particles');
  return { width: canvas?.width, height: canvas?.height, hasContext: !!canvas?.getContext };
}
```

Expected: `width` と `height` が viewport サイズ × DPR に近い値（例：`width: 2560, height: 1800` で 1280x900 viewport の場合）。

`mcp__chrome-devtools__take_screenshot` で背景にマゼンタの点 + 線が見えることを確認。

- [ ] **Step 4: コンソールエラーがないことを確認**

`mcp__chrome-devtools__list_console_messages` で `error` や `warn` のないことを確認。

- [ ] **Step 5: コミット**

```bash
git add src/components/themes/GlitchTheme.astro
git commit -m "feat(theme): Glitch のパーティクル背景（マゼンタ50点 + リンク線）を追加"
```

---

## Task 8: 多角的な動作検証 → 最終コミット

**Files:**
- 検証のみ。コード変更があれば修正してコミット。

- [ ] **Step 1: Minimal テーマ実機確認（PC幅）**

`mcp__chrome-devtools__emulate` で viewport `1280x900x2`。
`mcp__chrome-devtools__navigate_page` で `http://localhost:4321/#minimal`（または `/`）を開いて reload。
`mcp__chrome-devtools__take_screenshot` フルページ。

Expected: 既存 Minimal と完全同一の見た目（avatar 64px、19 リンクラベル付き、OUTPUT 4 枚）。スイッチャーが画面右端中央にアイコンだけ覗いた状態。

- [ ] **Step 2: Minimal テーマ実機確認（モバイル幅）**

`mcp__chrome-devtools__emulate` で viewport `390x844x3,mobile,touch`。
reload → screenshot。

Expected: アイコンのみグリッド・スイッチャーが右端に見えている。

- [ ] **Step 3: Glitch テーマ実機確認（PC幅）**

`mcp__chrome-devtools__emulate` で viewport `1280x900x2`。
`location.hash = '#glitch'` に切替 → reload → screenshot。

Expected: 黒背景、マゼンタの RGB シフト名前、走査線、パーティクル、タイプライター動作中、19 アイコングリッド、4 OUTPUT エントリー、ASCII フッター。スイッチャーがマゼンタ枠で GLITCH 表示中。

- [ ] **Step 4: Glitch テーマ実機確認（モバイル幅）**

`mcp__chrome-devtools__emulate` で viewport `390x844x3,mobile,touch`。
reload → screenshot。

Expected: モバイル幅でも崩れず表示。リンクは 5〜6 列のアイコンタイル、OUTPUT は縦並び。

- [ ] **Step 5: スイッチャーホバー挙動（PC）**

`mcp__chrome-devtools__emulate` で viewport `1280x900x2`。
`mcp__chrome-devtools__hover` で `.ts` をホバー（Hover ツール用に schema 取得が必要）。

代替：`mcp__chrome-devtools__evaluate_script`:
```js
() => {
  const ts = document.querySelector('.ts');
  ts.dispatchEvent(new MouseEvent('mouseenter'));
  // Wait for transition
  return new Promise(r => setTimeout(() => {
    const btn = document.querySelector('.ts-btn');
    const transform = getComputedStyle(btn).transform;
    r(transform);
  }, 400));
}
```

Expected: 戻り値の transform が `matrix(1, 0, 0, 1, 0, 0)`（translateX(0) になっている）。

注：CSS `:hover` は MouseEvent では発火しないことがあるため、目視確認を優先。`take_screenshot` で展開後のスクショを撮ること。

- [ ] **Step 6: スイッチャーモバイルタップ挙動**

`mcp__chrome-devtools__emulate` で viewport `390x844x3,mobile,touch`。
`mcp__chrome-devtools__click` で `.ts`（ボタン外側エリア）をクリック。

代替：`evaluate_script`:
```js
() => {
  const ts = document.querySelector('.ts');
  ts.dataset.open = ts.dataset.open === 'true' ? 'false' : 'true';
  return ts.dataset.open;
}
```

Expected: `"true"` になり、screenshot で展開状態が確認できる。

- [ ] **Step 7: Console エラーチェック**

`mcp__chrome-devtools__list_console_messages` で確認。

Expected: `error` レベルメッセージなし。

- [ ] **Step 8: ビルドサイズチェック**

Run: `npm run build && du -sh dist/`

Expected: `dist/` が数 MB 程度。フォント・パーティクルアセット込みで膨らみすぎていないこと。

- [ ] **Step 9: 最終コミット & プッシュ**

```bash
git status
git log --oneline -10
```

ここまで Task 1〜7 の変更が個別コミットされているはず。追加修正があった場合のみ：

```bash
git add -A
git commit -m "chore: Glitch テーマと切り替え機能の最終調整"
```

push は権限ガードに止められたら、オーナーに「push して OK ですか？」と確認する。

---

## Self-Review

### Spec coverage check

- ✅ アーキテクチャ（単一ページ + data-theme）→ Task 1, 2, 5
- ✅ ハッシュベースのルーティング → Task 1（inline script）, 4（hashchange）
- ✅ MinimalTheme.astro 作成 → Task 2
- ✅ GlitchTheme.astro 作成 → Task 5, 6, 7
- ✅ ThemeSwitcher.astro → Task 3, 4
- ✅ BaseLayout 修正 → Task 1
- ✅ index.astro 修正 → Task 2, 3, 5
- ✅ profile.ts 変更なし（DRY 維持）→ 全タスクで触っていないことを確認
- ✅ Glitch カラーパレット・タイポグラフィ → Task 5
- ✅ Glitch 採用セクション（top bar, hero, about, links, output, ASCII） → Task 5
- ✅ 装飾要素（走査線・スキャンビーム・RGB shift・カラーストライプ・OUTPUT バッジ色分け） → Task 5
- ✅ 動的要素（時計・タイプライター・グリッチシェイク・パーティクル） → Task 6, 7
- ✅ スイッチャースタイル・状態 → Task 3
- ✅ スイッチャーイベント（クリック・hashchange・モバイルタップ・外側タップ・ESC） → Task 4
- ✅ テーマ別アクセント色 → Task 3 のスタイル
- ✅ A11y（aria-current, aria-label） → Task 3, 4
- ✅ 検証（PC/モバイル両 viewport） → Task 8

### Type consistency check

- `data-glitch-clock`, `data-glitch-typewriter`, `data-glitch-shake` 属性名が Task 5（HTML）と Task 6（スクリプト）で一致 ✓
- `data-theme-target` が Task 3（HTML）と Task 4（スクリプト）で一致 ✓
- `data-open` が Task 3（CSS）と Task 4（スクリプト）で一致 ✓
- `vivibio-theme` localStorage キーが Task 1, 4 で一致 ✓
- `applyTheme` 関数の引数型と呼び出しが一致 ✓
- `aria-current` の `"true" | "false"` 文字列値が一貫 ✓

### Placeholder scan

- "TBD"/"TODO" なし ✓
- 全コードブロック実装込み ✓
- "Similar to Task N" なし ✓

### Scope check

単一の独立した機能（Glitch + Switcher）に焦点が当たっており、複数の独立サブシステムには分かれていない。単一プランで適切。
