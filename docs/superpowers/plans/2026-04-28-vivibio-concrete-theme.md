# Concrete Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** vivibio に建築図面 × 漆喰／コンクリート × 大胆な余白の Concrete テーマを追加する。安藤忠雄ポスター系の architectural-poster 調で、ヘアラインの幾何（ルーラー・コンパス円弧・グリッド）と極大の condensed タイポを暖色プラスター紙面に重ねる。

**Architecture:** 既存の `data-theme` 属性 + CSS パターンを踏襲。ConcreteTheme は単一の自己完結型 `.astro` ファイル（HTML + scoped CSS + lazy init JS）。Canvas は使わず CSS / SVG のみで紙質・幾何を表現。データ層は `LinkItem` に `category` フィールドを1件追加するのみで他は無変更（DRY）。

**Tech Stack:** Astro 5 / TypeScript / Vanilla JS（React 不使用） / SVG / CSS

**Spec:** `docs/superpowers/specs/2026-04-28-vivibio-concrete-theme-design.md`

**Reference:** `tmp/concrete-design/vivibio/project/theme-concrete.jsx`（参照デザインの React 実装）

---

## Verification Approach

このプロジェクトはユニットテストフレームワークを持たない Astro 静的サイトですわ。各タスクの検証は以下の組み合わせで行いますの：

- **ビルド**: `npm run build` で型・構文エラー無し
- **目視**: `npm run dev` 起動 + `chrome-devtools-mcp` でナビゲート・スクリーンショット
- **動作**: コンソールエラー無し、テーマ切替が機能、視差・hover・clock 等が想定通り

「TDD の代わりに build + visual」のサイクルで進めますわ。

---

## File Structure

### 新規作成

- `src/components/themes/ConcreteTheme.astro` — 自己完結型 Concrete テーマ（HTML + scoped CSS + inline script）

### 修正

- `src/data/profile.ts` — `LinkItem` 型に `category` フィールドを必須追加、LINKS 19件にカテゴリ値を付与
- `src/layouts/BaseLayout.astro` — inline script の `allowed` 配列に `'concrete'` 追加、body CSS に Concrete 用ルール追加、Google Fonts に `Caveat` を追加
- `src/components/ThemeSwitcher.astro` — `themes` / `ALLOWED` 配列に concrete 追加、SVG アイコン追加、active 枠スタイル追加
- `src/pages/index.astro` — `ConcreteTheme` を import + マウント

### 変更なし（DRY 維持）

- `src/data/profile.ts` の `PROFILE` / `OUTPUTS`（構造変更なし）
- 既存テーマ `MinimalTheme.astro` / `GlitchTheme.astro` / `ParticleTheme.astro`
- `src/components/{TopBar,Hero,Links,Output,Footer}.astro`（Minimal 専用・無変更）
- `src/components/icons/LinkIcons.astro`（共有・無変更）

---

## Task 1: LinkItem に `category` フィールドを必須追加

**Files:**
- Modify: `src/data/profile.ts`

- [ ] **Step 1: 既存の LinkItem 型を確認**

Run: `head -20 src/data/profile.ts`

Expected: `export type LinkItem = { id; label; handle; url; }` という4フィールドの型定義が見える。

- [ ] **Step 2: `LinkItem` 型に `category` を追加**

`src/data/profile.ts` 冒頭の型定義を以下に置き換える：

```ts
export type LinkItem = {
  id: string;
  label: string;
  handle: string;
  url: string;
  category: 'code' | 'social' | 'writing' | 'talks' | 'creds' | 'design' | 'self' | 'contact';
};
```

- [ ] **Step 3: LINKS 19件に `category` を付与**

`src/data/profile.ts` 内の `export const LINKS: LinkItem[] = [...]` ブロック全体を以下で置き換える：

```ts
export const LINKS: LinkItem[] = [
  { id: 'github',      label: 'GitHub',          handle: 'n-yokomachi',         url: 'https://github.com/n-yokomachi',                                                                          category: 'code'    },
  { id: 'x',           label: 'X',               handle: '@_cityside',          url: 'https://twitter.com/_cityside',                                                                           category: 'social'  },
  { id: 'huggingface', label: 'HuggingFace',     handle: 'yokomachi',           url: 'https://huggingface.co/yokomachi',                                                                        category: 'code'    },
  { id: 'zenn',        label: 'Zenn',            handle: 'yokomachi',           url: 'https://zenn.dev/yokomachi',                                                                              category: 'writing' },
  { id: 'qiita',       label: 'Qiita',           handle: 'yokomachi',           url: 'https://qiita.com/yokomachi',                                                                             category: 'writing' },
  { id: 'devto',       label: 'Dev.to',          handle: 'yokomachi',           url: 'https://dev.to/yokomachi',                                                                                category: 'writing' },
  { id: 'speakerdeck', label: 'SpeakerDeck',     handle: 'yokomachi',           url: 'https://speakerdeck.com/yokomachi',                                                                       category: 'talks'   },
  { id: 'linkedin',    label: 'LinkedIn',        handle: 'in/yokomachi',        url: 'https://www.linkedin.com/in/yokomachi/',                                                                  category: 'social'  },
  { id: 'credly',      label: 'Credly',          handle: 'yokomachi',           url: 'https://www.credly.com/users/yokomachi',                                                                  category: 'creds'   },
  { id: 'lapras',      label: 'Lapras',          handle: 'yokomachi',           url: 'https://lapras.com/public/yokomachi',                                                                     category: 'creds'   },
  { id: 'connpass',    label: 'Connpass',        handle: 'duplicate1984',       url: 'https://connpass.com/user/duplicate1984/',                                                                category: 'talks'   },
  { id: 'figma',       label: 'Figma',           handle: '@yokomachi',          url: 'https://www.figma.com/@yokomachi',                                                                        category: 'design'  },
  { id: '16p',         label: '16Personalities', handle: 'profile',             url: 'https://www.16personalities.com/ja/%E3%83%97%E3%83%AD%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB/ffd619bb32c18', category: 'self'    },
  { id: 'duolingo',    label: 'Duolingo',        handle: 'yokomachi1',          url: 'https://www.duolingo.com/profile/yokomachi1',                                                             category: 'self'    },
  { id: 'bukulog',     label: 'ブクログ',         handle: 'yokomachi1',          url: 'https://booklog.jp/users/yokomachi1',                                                                     category: 'self'    },
  { id: 'filmarks',    label: 'Filmarks',        handle: 'yokomachi',           url: 'https://filmarks.com/users/yokomachi',                                                                    category: 'self'    },
  { id: 'discord',     label: 'Discord',         handle: 'yokomachi',           url: 'https://discordapp.com/users/750727153871618069',                                                         category: 'social'  },
  { id: 'atcoder',     label: 'AtCoder',         handle: 'yokomachi',           url: 'https://atcoder.jp/users/yokomachi',                                                                      category: 'code'    },
  { id: 'email',       label: 'Email',           handle: 'asterism.mihono',     url: 'mailto:asterism.mihono@gmail.com',                                                                        category: 'contact' },
];
```

URL や handle の値は既存と同一。`category` のみを追加。

- [ ] **Step 4: ビルドして型エラー無しを確認**

Run: `npm run build`

Expected: `0 errors`。LINKS は他のテーマでは `.category` を参照していないため、他テーマには影響無し。

- [ ] **Step 5: コミット**

```bash
git add src/data/profile.ts
git commit -m "feat(profile): LinkItem に category フィールドを追加 (concrete テーマ用)"
```

---

## Task 2: BaseLayout.astro に Concrete サポートを追加

**Files:**
- Modify: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: 既存の allowed 配列と body CSS を確認**

Run: `grep -n "allowed\|data-theme" src/layouts/BaseLayout.astro`

Expected: `var allowed = ['minimal', 'glitch', 'particle'];` が inline-script 内にあり、`:root[data-theme='particle'] body { ... }` 等の CSS ルールが `<style is:global>` 内にある。

- [ ] **Step 2: Google Fonts の link に `Caveat` を追加**

`src/layouts/BaseLayout.astro` の以下の行：

```astro
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&family=Space+Grotesk:wght@400;500;700;900&display=swap"
      rel="stylesheet"
    />
```

を、以下に置き換える（`&family=Caveat:wght@400;500` を追加）：

```astro
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&family=Space+Grotesk:wght@400;500;700;900&family=Caveat:wght@400;500&display=swap"
      rel="stylesheet"
    />
```

- [ ] **Step 3: inline script の `allowed` 配列に `'concrete'` を追加**

`src/layouts/BaseLayout.astro` 内の：

```js
          var allowed = ['minimal', 'glitch', 'particle'];
```

を、以下に置き換える：

```js
          var allowed = ['minimal', 'glitch', 'particle', 'concrete'];
```

- [ ] **Step 4: グローバル CSS に Concrete 用 body ルールを追加**

`src/layouts/BaseLayout.astro` の `<style is:global>` 内、`:root[data-theme='particle'] body { ... }` ルールの**直後**（`body { -webkit-font-smoothing: antialiased; ...` の直前）に以下を挿入する：

```css
      :root[data-theme='concrete'] body {
        background: #e8e2d6;
        color: #1a1815;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
      }
```

- [ ] **Step 5: `.theme-pane` 表示切替に concrete を追加**

`src/layouts/BaseLayout.astro` の `<style is:global>` 内、以下のルール：

```css
      :root[data-theme='minimal'] .theme-pane[data-theme='minimal'],
      :root[data-theme='glitch'] .theme-pane[data-theme='glitch'],
      :root[data-theme='particle'] .theme-pane[data-theme='particle'] {
        display: block;
      }
```

を、以下に置き換える（最後の行に concrete を追加）：

```css
      :root[data-theme='minimal'] .theme-pane[data-theme='minimal'],
      :root[data-theme='glitch'] .theme-pane[data-theme='glitch'],
      :root[data-theme='particle'] .theme-pane[data-theme='particle'],
      :root[data-theme='concrete'] .theme-pane[data-theme='concrete'] {
        display: block;
      }
```

- [ ] **Step 6: ビルドして構文エラー無しを確認**

Run: `npm run build`

Expected: ビルド成功。`#concrete` ハッシュはまだ表示対象が無いが、エラーは出ない（`<main data-theme="concrete">` を持つ要素が無いだけ）。

- [ ] **Step 7: コミット**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "feat(layout): BaseLayout に concrete テーマサポートを追加 (allowed/body/Caveat)"
```

---

## Task 3: ThemeSwitcher.astro に Concrete ボタンを追加

**Files:**
- Modify: `src/components/ThemeSwitcher.astro`

- [ ] **Step 1: 既存 themes 配列と ALLOWED を確認**

Run: `grep -n "themes\|ALLOWED" src/components/ThemeSwitcher.astro | head`

Expected: 上部 frontmatter の `themes` 配列と script 内の `ALLOWED` が見える。

- [ ] **Step 2: frontmatter の `themes` 配列に concrete を追加**

`src/components/ThemeSwitcher.astro` 冒頭の：

```astro
---
const themes = [
  { id: 'minimal', label: 'MINIMAL' },
  { id: 'glitch', label: 'GLITCH' },
  { id: 'particle', label: 'PARTICLE' },
];
---
```

を、以下に置き換える：

```astro
---
const themes = [
  { id: 'minimal', label: 'MINIMAL' },
  { id: 'glitch', label: 'GLITCH' },
  { id: 'particle', label: 'PARTICLE' },
  { id: 'concrete', label: 'CONCRETE' },
];
---
```

- [ ] **Step 3: テンプレート内の SVG 分岐に concrete アイコンを追加**

`src/components/ThemeSwitcher.astro` 内、`{t.id === 'particle' && (...)}` の SVG ブロックの**直後**（`</span>` の直前）に以下を挿入する：

```astro
          {t.id === 'concrete' && (
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <circle cx="12" cy="12" r="9" fill="none" stroke="#1a1815" stroke-width="1" />
              <circle cx="12" cy="12" r="5" fill="none" stroke="#1a1815" stroke-width="0.7" stroke-dasharray="1.5 2" />
              <line x1="12" y1="2.5" x2="12" y2="21.5" stroke="#1a1815" stroke-width="0.7" />
              <line x1="2.5" y1="12" x2="21.5" y2="12" stroke="#1a1815" stroke-width="0.7" />
              <circle cx="12" cy="12" r="1.4" fill="#1a1815" />
            </svg>
          )}
```

- [ ] **Step 4: アクティブ枠の色を CSS に追加**

`src/components/ThemeSwitcher.astro` の `<style>` ブロック内、以下のルール：

```css
  :root[data-theme='particle'] .ts-btn[aria-current='true'] {
    border-color: #7ec8ff;
    box-shadow: -4px 0 16px rgba(126, 200, 255, 0.25);
  }
```

の**直後**に以下を挿入する：

```css
  :root[data-theme='concrete'] .ts-btn[aria-current='true'] {
    border-color: #1a1815;
    box-shadow: -4px 0 16px rgba(40, 30, 15, 0.25);
  }
```

- [ ] **Step 5: script 内の `ALLOWED` 配列に concrete を追加**

`src/components/ThemeSwitcher.astro` の `<script>` 内の：

```ts
  const ALLOWED = ['minimal', 'glitch', 'particle'] as const;
```

を、以下に置き換える：

```ts
  const ALLOWED = ['minimal', 'glitch', 'particle', 'concrete'] as const;
```

- [ ] **Step 6: ビルドして型エラー無しを確認**

Run: `npm run build`

Expected: ビルド成功。

- [ ] **Step 7: コミット**

```bash
git add src/components/ThemeSwitcher.astro
git commit -m "feat(switcher): ThemeSwitcher に CONCRETE ボタンと SVG を追加"
```

---

## Task 4: ConcreteTheme.astro 新規作成（最小スタブ + マウント）

**Files:**
- Create: `src/components/themes/ConcreteTheme.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: ConcreteTheme.astro の最小スタブを作成**

新規ファイル `src/components/themes/ConcreteTheme.astro` を以下の内容で作成する：

```astro
---
import { PROFILE, LINKS, OUTPUTS } from '../../data/profile.ts';
---

<div class="cc">
  <div class="cc-stage">
    <h1>CONCRETE</h1>
    <p>{PROFILE.name}</p>
  </div>
</div>

<style>
  .cc {
    --paper: #e8e2d6;
    --paper-2: #ddd5c5;
    --concrete: #b6ad9e;
    --concrete-2: #8b8273;
    --ink: #1a1815;
    --ink-soft: #4a463f;
    --rule: #2a2620;
    --rust: #8a3a1f;
    --shadow: rgba(40, 32, 20, 0.14);

    position: relative;
    min-height: 100vh;
    background: var(--paper);
    color: var(--ink);
    font-family: 'Inter', 'Helvetica Neue', sans-serif;
    overflow: hidden;
    -webkit-font-smoothing: antialiased;
  }

  .cc-stage {
    position: relative;
    z-index: 5;
    max-width: 1100px;
    margin: 0 auto;
    padding: 56px 40px 80px;
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1fr;
    gap: 48px;
  }
</style>
```

`PROFILE`, `LINKS`, `OUTPUTS` は後続タスクで使うので import しておく（このタスクでは `PROFILE` のみ実使用）。

- [ ] **Step 2: index.astro に ConcreteTheme をマウント**

`src/pages/index.astro` を以下で置き換える：

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import MinimalTheme from '../components/themes/MinimalTheme.astro';
import GlitchTheme from '../components/themes/GlitchTheme.astro';
import ParticleTheme from '../components/themes/ParticleTheme.astro';
import ConcreteTheme from '../components/themes/ConcreteTheme.astro';
import ThemeSwitcher from '../components/ThemeSwitcher.astro';
---

<BaseLayout>
  <main class="theme-pane" data-theme="minimal">
    <MinimalTheme />
  </main>
  <main class="theme-pane" data-theme="glitch">
    <GlitchTheme />
  </main>
  <main class="theme-pane" data-theme="particle">
    <ParticleTheme />
  </main>
  <main class="theme-pane" data-theme="concrete">
    <ConcreteTheme />
  </main>
  <ThemeSwitcher />
</BaseLayout>
```

- [ ] **Step 3: ビルドと目視確認**

Run: `npm run build`

Expected: ビルド成功。

`npm run dev` 起動後、`http://localhost:4321/#concrete` を `chrome-devtools-mcp` で開いて以下を確認：

- 画面が暖色プラスター色 `#e8e2d6` で塗られている
- 中央に大きく `CONCRETE` の見出し、その下に `Naoki Yokomachi` が表示
- スイッチャーの `CONCRETE` ボタンがコンパス SVG 付きで表示
- スイッチャーで他テーマに切り替えるとそれぞれ正常に表示される
- コンソールエラー無し

- [ ] **Step 4: コミット**

```bash
git add src/components/themes/ConcreteTheme.astro src/pages/index.astro
git commit -m "feat(concrete): ConcreteTheme.astro の最小スタブを作成し index.astro にマウント"
```

---

## Task 5: 背景レイヤー（surface / noise / grid / seam / form-tie / rulers / crop marks）

**Files:**
- Modify: `src/components/themes/ConcreteTheme.astro`

- [ ] **Step 1: 装飾レイヤー HTML を `.cc-stage` の前に挿入**

`src/components/themes/ConcreteTheme.astro` の `<div class="cc">` 内、`<div class="cc-stage">` の**直前**に以下を挿入する：

```astro
  <div class="cc-surface" />
  <svg class="cc-noise" aria-hidden="true">
    <defs>
      <filter id="cc-grain">
        <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="2" seed="7" stitchTiles="stitch" />
        <feColorMatrix values="0 0 0 0 0.32 0 0 0 0 0.27 0 0 0 0 0.18 0 0 0 0.55 0" />
      </filter>
      <filter id="cc-grain2">
        <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" seed="3" stitchTiles="stitch" />
        <feColorMatrix values="0 0 0 0 0.16 0 0 0 0 0.13 0 0 0 0 0.08 0 0 0 0.18 0" />
      </filter>
    </defs>
    <rect width="100%" height="100%" filter="url(#cc-grain)" />
    <rect width="100%" height="100%" filter="url(#cc-grain2)" />
  </svg>

  <div class="cc-grid" />
  <div class="cc-seam" />
  <div class="cc-seam b" />

  <div class="cc-ties">
    {Array.from({ length: 32 }).map((_, i) => {
      const cols = 8;
      const r = Math.floor(i / cols);
      const c = i % cols;
      const x = `${(c + 0.5) * (100 / cols)}%`;
      const y = r === 0 ? '38%' : r === 1 ? '62%' : '38%';
      return <span style={`left: ${x}; top: ${y}; transform: translate(-50%, -50%);`} />;
    })}
  </div>

  <div class="cc-ruler" aria-hidden="true">
    <svg viewBox="0 0 24 1800" preserveAspectRatio="none">
      <line x1="22" y1="0" x2="22" y2="1800" stroke="currentColor" stroke-width="0.75" />
      {Array.from({ length: 90 }).map((_, i) => {
        const y = i * 20;
        const major = i % 5 === 0;
        const x = major ? 8 : 14;
        return (
          <g>
            <line x1={x} y1={y} x2="22" y2={y} stroke="currentColor" stroke-width={major ? 1 : 0.5} />
            {major && (
              <text x="2" y={y + 3} font-family="JetBrains Mono" font-size="7" fill="currentColor" letter-spacing="0.5">
                {(i * 100).toString().padStart(4, '0')}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  </div>

  <div class="cc-ruler-h" aria-hidden="true">
    <svg viewBox="0 0 1000 24" preserveAspectRatio="none">
      <line x1="0" y1="2" x2="1000" y2="2" stroke="currentColor" stroke-width="0.75" />
      {Array.from({ length: 50 }).map((_, i) => {
        const x = i * 20;
        const major = i % 5 === 0;
        const h = major ? 14 : 8;
        return (
          <g>
            <line x1={x} y1="2" x2={x} y2={2 + h} stroke="currentColor" stroke-width={major ? 1 : 0.5} />
            {major && (
              <text x={x + 2} y="22" font-family="JetBrains Mono" font-size="7" fill="currentColor">
                {(i * 100).toString().padStart(4, '0')}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  </div>

  <div class="cc-crop tl">
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1"><path d="M0 9 H10 M9 0 V10" /></svg>
  </div>
  <div class="cc-crop tr">
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1"><path d="M18 9 H8 M9 0 V10" /></svg>
  </div>
  <div class="cc-crop bl">
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1"><path d="M0 9 H10 M9 18 V8" /></svg>
  </div>
  <div class="cc-crop br">
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1"><path d="M18 9 H8 M9 18 V8" /></svg>
  </div>
```

- [ ] **Step 2: 対応する CSS を `<style>` に追加**

`<style>` ブロック内、`.cc-stage { ... }` の**直前**に以下を挿入する：

```css
  /* Plaster surface */
  .cc-surface {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    background:
      radial-gradient(120% 80% at 30% 20%, rgba(255, 250, 240, 0.5) 0%, transparent 55%),
      radial-gradient(80% 60% at 80% 90%, rgba(120, 100, 70, 0.1) 0%, transparent 60%),
      linear-gradient(180deg, #ece5d6 0%, #e2d9c6 100%);
    transition: transform 0.4s ease-out;
    transform: translate(calc(var(--par-x, 0px) * -1), calc(var(--par-y, 0px) * -1)) scale(1.06);
  }
  .cc-noise {
    position: absolute;
    inset: -10%;
    z-index: 1;
    pointer-events: none;
    opacity: 0.55;
    mix-blend-mode: multiply;
  }
  .cc-noise svg {
    width: 100%;
    height: 100%;
  }

  /* Engineer grid — 8px fine + 40px major */
  .cc-grid {
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    background-image:
      linear-gradient(to right, rgba(40, 30, 15, 0.07) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(40, 30, 15, 0.07) 1px, transparent 1px),
      linear-gradient(to right, rgba(40, 30, 15, 0.13) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(40, 30, 15, 0.13) 1px, transparent 1px);
    background-size: 8px 8px, 8px 8px, 40px 40px, 40px 40px;
    mix-blend-mode: multiply;
    opacity: 0.9;
    mask-image: radial-gradient(ellipse 90% 80% at 50% 40%, #000 30%, rgba(0, 0, 0, 0.5) 70%, transparent 100%);
    -webkit-mask-image: radial-gradient(ellipse 90% 80% at 50% 40%, #000 30%, rgba(0, 0, 0, 0.5) 70%, transparent 100%);
  }

  /* Pour seam — faint horizontal band */
  .cc-seam {
    position: absolute;
    left: 0;
    right: 0;
    top: 38%;
    height: 1px;
    background: rgba(60, 50, 30, 0.1);
    z-index: 1;
    pointer-events: none;
  }
  .cc-seam.b {
    top: 62%;
  }

  /* Form-tie dots */
  .cc-ties {
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
  }
  .cc-ties span {
    position: absolute;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: rgba(40, 30, 15, 0.18);
    box-shadow: 0 0 0 1px rgba(255, 250, 240, 0.35), inset 1px 1px 1.5px rgba(0, 0, 0, 0.4);
  }

  /* Vertical ruler — left edge */
  .cc-ruler {
    position: absolute;
    left: 6px;
    top: 0;
    bottom: 0;
    width: 24px;
    z-index: 3;
    pointer-events: none;
    color: rgba(40, 30, 15, 0.55);
  }
  .cc-ruler svg {
    display: block;
    height: 100%;
    width: 100%;
  }

  /* Horizontal ruler — bottom */
  .cc-ruler-h {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 6px;
    height: 24px;
    z-index: 3;
    pointer-events: none;
    color: rgba(40, 30, 15, 0.55);
  }
  .cc-ruler-h svg {
    display: block;
    width: 100%;
    height: 100%;
  }

  /* Crop marks (4 corners) */
  .cc-crop {
    position: fixed;
    pointer-events: none;
    z-index: 6;
    color: var(--ink-soft);
    opacity: 0.45;
  }
  .cc-crop.tl { top: 14px; left: 14px; }
  .cc-crop.tr { top: 14px; right: 14px; }
  .cc-crop.bl { bottom: 14px; left: 14px; }
  .cc-crop.br { bottom: 14px; right: 14px; }
  .cc-crop svg {
    width: 18px;
    height: 18px;
    display: block;
  }
```

- [ ] **Step 3: ビルドと目視確認**

Run: `npm run build`

Expected: ビルド成功。

`npm run dev` 起動後、`http://localhost:4321/#concrete` を `chrome-devtools-mcp` で確認：

- 暖色プラスター背景に**SVG ノイズグレイン**が乗って質感が出ている
- 中央に**8px細目 + 40px主線のグリッド**が見える（中央付近で濃く、端でフェードアウト）
- 左端に**縦ルーラー**、下端に**横ルーラー**が表示（5tick毎に数値あり）
- 4隅に**カットマーク**（クロスヘア風）が固定表示
- 上下に**38%/62% の水平線**と**形枠ドット**が並んでいる
- スイッチャー操作で他テーマと往復可能

- [ ] **Step 4: コミット**

```bash
git add src/components/themes/ConcreteTheme.astro
git commit -m "feat(concrete): 背景レイヤー追加 (surface / noise / grid / seam / form-tie / rulers / crop marks)"
```

---

## Task 6: Construction lines（コンパス円弧）+ side label + north arrow

**Files:**
- Modify: `src/components/themes/ConcreteTheme.astro`

- [ ] **Step 1: コンパス SVG と縦書き side label を `.cc-stage` の前に追加**

`src/components/themes/ConcreteTheme.astro` の frontmatter に日付計算を追加する。冒頭の：

```astro
---
import { PROFILE, LINKS, OUTPUTS } from '../../data/profile.ts';
---
```

を、以下に置き換える：

```astro
---
import { PROFILE, LINKS, OUTPUTS } from '../../data/profile.ts';

const now = new Date();
const yyyy = now.getFullYear();
const mo = String(now.getMonth() + 1).padStart(2, '0');
const da = String(now.getDate()).padStart(2, '0');
---
```

その上で、HTML 内の `<div class="cc-crop br">...</div>` の**直後**に以下を挿入する：

```astro
  <div class="cc-construct" aria-hidden="true">
    <svg viewBox="0 0 1000 1800" preserveAspectRatio="xMidYMid slice">
      <circle cx="720" cy="380" r="380" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="3 4" />
      <circle cx="720" cy="380" r="240" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="2 3" />
      <circle cx="720" cy="380" r="135" fill="none" stroke="currentColor" stroke-width="0.75" />
      <g stroke="currentColor" stroke-width="1">
        <line x1="0" y1="380" x2="1000" y2="380" />
        <line x1="720" y1="60" x2="720" y2="760" />
      </g>
      <g class="heavy" fill="none" stroke-width="0.6" opacity="0.6">
        <line x1="720" y1="380" x2="1000" y2="120" stroke="currentColor" />
        <line x1="720" y1="380" x2="340" y2="120" stroke="currentColor" />
        <line x1="720" y1="380" x2="1000" y2="640" stroke="currentColor" />
        <line x1="720" y1="380" x2="340" y2="640" stroke="currentColor" />
      </g>
      <path d="M 0 1200 A 700 700 0 0 1 1000 1200" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="4 5" />
      <path d="M 100 1480 A 400 400 0 0 1 900 1480" fill="none" stroke="currentColor" stroke-width="0.75" />
      <g stroke="currentColor" stroke-width="0.5" opacity="0.7">
        <line x1="0" y1="900" x2="1000" y2="900" />
        <line x1="0" y1="900" x2="720" y2="380" />
        <line x1="1000" y1="900" x2="720" y2="380" />
      </g>
      <g class="rust" fill="none" stroke-width="1">
        <path d="M 760 380 A 40 40 0 0 1 750 420" stroke="currentColor" />
      </g>
      <g fill="currentColor">
        <circle cx="720" cy="380" r="3" />
        <circle cx="720" cy="380" r="9" fill="none" stroke="currentColor" stroke-width="1" />
      </g>
    </svg>
  </div>

  <div class="cc-side">SHEET A-101 · PROFILE PLAN · SCALE 1:50 · {yyyy}.{mo}.{da}</div>
```

- [ ] **Step 2: north-arrow SVG を `.cc-stage` 内の先頭に追加**

`<div class="cc-stage">` の**直後**に以下を挿入する（後続タスクで title-block / hero などがここに追加される）：

```astro
    <svg class="cc-north" viewBox="0 0 60 60" aria-hidden="true">
      <circle cx="30" cy="30" r="26" fill="none" stroke="var(--ink)" stroke-width="1" />
      <circle cx="30" cy="30" r="20" fill="none" stroke="var(--ink)" stroke-width="0.5" stroke-dasharray="2 3" />
      <path d="M30 8 L36 34 L30 30 L24 34 Z" fill="var(--ink)" />
      <path d="M30 30 L36 34 L30 52 L24 34 Z" fill="none" stroke="var(--ink)" stroke-width="1" />
      <text x="30" y="6" text-anchor="middle" font-family="JetBrains Mono" font-size="7" font-weight="700" fill="var(--ink)">N</text>
    </svg>
```

- [ ] **Step 3: 対応する CSS を追加**

`<style>` ブロック内、`.cc-crop svg { ... }` ルールの**直後**に以下を挿入する：

```css
  /* Construction lines (compass arcs etc.) */
  .cc-construct {
    position: absolute;
    inset: 0;
    z-index: 2;
    pointer-events: none;
    color: rgba(40, 30, 15, 0.32);
    mix-blend-mode: multiply;
  }
  .cc-construct svg {
    width: 100%;
    height: 100%;
    display: block;
  }
  .cc-construct .heavy {
    stroke: rgba(40, 30, 15, 0.55);
  }
  .cc-construct .rust {
    stroke: var(--rust);
    opacity: 0.55;
  }

  /* Vertical side label */
  .cc-side {
    position: fixed;
    left: 14px;
    top: 50%;
    transform: translateY(-50%) rotate(180deg);
    writing-mode: vertical-rl;
    text-orientation: mixed;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10px;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    color: var(--ink-soft);
    opacity: 0.55;
    z-index: 5;
    pointer-events: none;
    white-space: nowrap;
  }
  @media (max-width: 720px) {
    .cc-side {
      display: none;
    }
  }

  /* North arrow */
  .cc-north {
    position: absolute;
    right: 40px;
    top: 56px;
    width: 56px;
    height: 56px;
    opacity: 0.9;
  }
  @media (max-width: 720px) {
    .cc-north {
      right: 16px;
      top: 16px;
      width: 44px;
      height: 44px;
    }
  }
```

- [ ] **Step 4: ビルドと目視確認**

Run: `npm run build`

Expected: ビルド成功。

`npm run dev` 起動後、`http://localhost:4321/#concrete` を `chrome-devtools-mcp` で確認：

- 画面の右側 (約 72%地点) を中心とする**3重コンパス円弧**と**放射線4本**、**下部の大円弧2本**が描画
- 中心点に小さなドットと9px の円
- 中心からわずかに右下に**錆色の角度マーク**（`.rust`）
- 左端に縦書きで `SHEET A-101 · PROFILE PLAN · SCALE 1:50 · 2026.04.28` 等の表示
- 右上に**北方位コンパス SVG**（円 + 矢印 + N 表記）

- [ ] **Step 5: コミット**

```bash
git add src/components/themes/ConcreteTheme.astro
git commit -m "feat(concrete): construction lines (コンパス円弧) と side label / north arrow を追加"
```

---

## Task 7: Title block + Hero（上部コンテンツ）

**Files:**
- Modify: `src/components/themes/ConcreteTheme.astro`

- [ ] **Step 1: スタブ HTML を Title Block + Hero に置き換え**

`src/components/themes/ConcreteTheme.astro` の `<svg class="cc-north">...</svg>` の**直後**にあるスタブ：

```astro
    <h1>CONCRETE</h1>
    <p>{PROFILE.name}</p>
```

を、以下に置き換える（`yyyy/mo/da` は frontmatter で計算済み。clock の `HH:MM` はスクリプトで埋める前提で初期値 `--:--` を入れる）：

```astro
    <div class="cc-titleblock">
      <div class="meta">
        <div class="row"><span>PROJ.</span><b>{PROFILE.handle}</b></div>
        <div class="row"><span>DRWG.</span><b>PROFILE / NFC</b></div>
        <div class="row"><span>LOC.</span><b>{PROFILE.location}</b></div>
      </div>
      <div class="sheet">
        <div class="num">A-101</div>
        <div>{yyyy}.{mo}.{da} · <span data-cc-clock>--:--</span></div>
        <div>REV. 02 / 04</div>
      </div>
    </div>

    <div class="cc-hero">
      <div class="label">A · ELEVATION · 立面</div>
      <h1>
        {PROFILE.name}
        <span class="ja">{PROFILE.nameJa}</span>
      </h1>
      <div class="role">
        <span class="accent">{PROFILE.title}</span> · {PROFILE.bio}
      </div>
      <div class="stamps">
        <span class="cc-pour">◉ POURED {yyyy}.{mo}.{da}</span>
        <span class="material">CONCRETE · CAST IN PLACE · CLASS C30/37</span>
      </div>
    </div>
```

- [ ] **Step 2: 対応する CSS を追加**

`<style>` ブロック内、`.cc-north` の media query ルールの**直後**に以下を挿入する：

```css
  /* TITLE BLOCK */
  .cc-titleblock {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 24px;
    align-items: end;
    padding-bottom: 18px;
  }
  .cc-titleblock .meta {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--ink-soft);
    display: grid;
    gap: 4px;
  }
  .cc-titleblock .meta .row {
    display: flex;
    gap: 14px;
  }
  .cc-titleblock .meta b {
    color: var(--ink);
    font-weight: 600;
  }
  .cc-titleblock .sheet {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10px;
    letter-spacing: 0.2em;
    text-align: right;
    color: var(--ink-soft);
    line-height: 1.7;
  }
  .cc-titleblock .sheet .num {
    font-size: 26px;
    letter-spacing: 0.04em;
    color: var(--ink);
    font-weight: 500;
    line-height: 1;
  }

  /* HERO */
  .cc-hero {
    padding: 24px 0 40px;
    position: relative;
  }
  .cc-hero .label {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10px;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: var(--ink-soft);
    margin-bottom: 28px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .cc-hero .label::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--rule);
    opacity: 0.35;
  }
  .cc-hero h1 {
    font-family: 'Inter', 'Helvetica Neue', sans-serif;
    font-weight: 200;
    font-size: clamp(56px, 14vw, 168px);
    line-height: 0.88;
    letter-spacing: -0.04em;
    color: var(--ink);
    margin: 0;
    text-transform: uppercase;
    font-stretch: 75%;
  }
  .cc-hero h1 .ja {
    display: block;
    font-size: clamp(11px, 1.4vw, 16px);
    letter-spacing: 0.5em;
    font-weight: 400;
    color: var(--ink-soft);
    margin-top: 16px;
    text-transform: none;
  }
  .cc-hero .role {
    margin-top: 26px;
    font-size: 13px;
    letter-spacing: 0.04em;
    color: var(--ink-soft);
    max-width: 52ch;
    line-height: 1.6;
    font-weight: 400;
  }
  .cc-hero .role .accent {
    color: var(--rust);
    border-bottom: 1px solid var(--rust);
    padding-bottom: 1px;
  }
  .cc-hero .stamps {
    margin-top: 22px;
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
  }
  .cc-hero .stamps .material {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10px;
    letter-spacing: 0.25em;
    color: var(--ink-soft);
    text-transform: uppercase;
  }
  .cc-pour {
    display: inline-grid;
    grid-auto-flow: column;
    gap: 10px;
    align-items: center;
    padding: 6px 12px;
    border: 1.5px solid var(--rust);
    color: var(--rust);
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    transform: rotate(-2deg);
    background: rgba(232, 226, 214, 0.5);
  }
```

- [ ] **Step 3: ビルドと目視確認**

Run: `npm run build`

Expected: ビルド成功。

`npm run dev` 起動後、`http://localhost:4321/#concrete` を `chrome-devtools-mcp` で確認：

- 上部に**タイトルブロック**：左に PROJ./DRWG./LOC.、右に大きく `A-101` と日付・REV.
- 右側スペースに**北方位コンパス**（Task 6 で追加済み）
- `A · ELEVATION · 立面` の eyebrow
- 巨大な uppercase 名前 `NAOKI YOKOMACHI`、その下に小さく `横町 直樹`
- `Software Engineer / AI Engineer`（錆色下線）+ bio が続く
- `◉ POURED 2026.04.28` の錆色枠（少し回転）+ 右に `CONCRETE · CAST IN PLACE · CLASS C30/37`
- 時計部分は `--:--` のまま（Task 12 でスクリプト追加）

- [ ] **Step 4: コミット**

```bash
git add src/components/themes/ConcreteTheme.astro
git commit -m "feat(concrete): TITLE BLOCK + HERO セクション (PROJ./DRWG./LOC. + 巨大タイトル + POURED)"
```

---

## Task 8: Section A-A' cut + PLAN grid (LINKS) + scale bar

**Files:**
- Modify: `src/components/themes/ConcreteTheme.astro`

- [ ] **Step 1: 座標生成ヘルパーを frontmatter に追加**

`src/components/themes/ConcreteTheme.astro` の frontmatter を以下に置き換える（`gridCoord` ヘルパーを追加）：

```astro
---
import { PROFILE, LINKS, OUTPUTS } from '../../data/profile.ts';
import LinkIcons from '../icons/LinkIcons.astro';

const now = new Date();
const yyyy = now.getFullYear();
const mo = String(now.getMonth() + 1).padStart(2, '0');
const da = String(now.getDate()).padStart(2, '0');

const gridCoord = (i: number) => {
  const col = String.fromCharCode(65 + (i % 4));
  const row = Math.floor(i / 4) + 1;
  return `${col}${row}`;
};
---
```

- [ ] **Step 2: HERO の `</div>` 直後に PLAN セクションを追加**

`</div>` (`cc-hero` の閉じタグ) の**直後**に以下を挿入する：

```astro
    <div>
      <div class="cc-cut">
        <div class="badge">A<span class="arrow"></span></div>
        <div class="line" />
        <span class="cc-cut-label">SECTION A — A'</span>
        <div class="line" />
        <div class="badge">A'<span class="arrow"></span></div>
      </div>

      <div class="cc-sec">
        <div class="marker">B</div>
        <div class="cc-sec-label">PLAN · 平面図 · LINKS</div>
        <div class="rule" />
        <div class="count">{LINKS.length} ROOMS</div>
      </div>

      <div class="cc-dim">
        <div class="tick" />
        <div class="line"><span class="num">2400</span></div>
        <div class="tick" />
        <div class="line"><span class="num">2400</span></div>
        <div class="tick" />
        <div class="line"><span class="num">2400</span></div>
        <div class="tick" />
        <div class="line"><span class="num">2400</span></div>
        <div class="tick" />
      </div>

      <div class="cc-plan-grid">
        {LINKS.map((l, i) => (
          <a
            href={l.url}
            class="cc-room"
            data-cc-room
            data-cc-label={l.label}
            data-cc-handle={l.handle}
            data-cc-url={l.url}
            target={l.url.startsWith('mailto:') ? undefined : '_blank'}
            rel={l.url.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
          >
            <div class="hatch" />
            <div>
              <div class="coord">
                <span class="dot" />
                <span>{gridCoord(i)} · {String(i + 1).padStart(2, '0')}</span>
                <span class="ext" />
              </div>
              <div class="label">{l.label}</div>
            </div>
            <div class="meta">
              <span>{l.category}</span>
              <span class="icon"><LinkIcons id={l.id} /></span>
            </div>
            <div class="area">{(12 + i * 3).toFixed(1)} m²</div>
            <svg class="swing" viewBox="0 0 44 44" aria-hidden="true">
              <path d="M0 44 L0 0" stroke="currentColor" stroke-width="1" />
              <path d="M0 44 A 44 44 0 0 1 44 0" fill="none" stroke="currentColor" stroke-width="0.5" stroke-dasharray="2 2" />
              <path d="M0 44 A 30 30 0 0 1 30 14" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.5" />
            </svg>
          </a>
        ))}
      </div>

      <div class="cc-scale">
        <div>SCALE</div>
        <div class="bars">
          <span /><span /><span /><span /><span /><span />
        </div>
        <div>0 — 5m</div>
        <div class="cc-scale-spacer" />
        <div>1 : 50</div>
      </div>
    </div>
```

`data-cc-*` 属性は Task 12 で hover-readout のスクリプトが読む予定。

- [ ] **Step 3: 対応する CSS を追加**

`<style>` ブロック内、`.cc-pour` ルールの**直後**に以下を挿入する：

```css
  /* Section cut marker — A——A' */
  .cc-cut {
    display: flex;
    align-items: center;
    gap: 0;
    margin: 8px 0;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10px;
    letter-spacing: 0.25em;
    color: var(--ink);
  }
  .cc-cut .badge {
    width: 26px;
    height: 26px;
    border: 1.5px solid var(--ink);
    display: grid;
    place-items: center;
    font-weight: 700;
    font-size: 10px;
    background: var(--paper);
    position: relative;
    flex-shrink: 0;
  }
  .cc-cut .badge::before,
  .cc-cut .badge::after {
    content: '';
    position: absolute;
    width: 7px;
    height: 1.5px;
    background: var(--ink);
  }
  .cc-cut .badge::before {
    left: -10px;
    top: 50%;
    transform: translateY(-50%);
  }
  .cc-cut .badge::after {
    right: -10px;
    top: 50%;
    transform: translateY(-50%);
  }
  .cc-cut .badge .arrow {
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-bottom: 7px solid var(--ink);
  }
  .cc-cut .line {
    flex: 1;
    height: 1.5px;
    background-image: repeating-linear-gradient(to right, var(--ink) 0 8px, transparent 8px 16px);
  }
  .cc-cut-label {
    padding: 0 10px;
  }

  /* Section heading */
  .cc-sec {
    display: flex;
    align-items: baseline;
    gap: 14px;
    margin-bottom: 24px;
  }
  .cc-sec .marker {
    width: 24px;
    height: 24px;
    border: 1.5px solid var(--ink);
    border-radius: 50%;
    display: grid;
    place-items: center;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10px;
    font-weight: 700;
    flex-shrink: 0;
  }
  .cc-sec-label {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 11px;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: var(--ink);
    font-weight: 500;
  }
  .cc-sec .rule {
    flex: 1;
    height: 1px;
    background: var(--rule);
    opacity: 0.6;
  }
  .cc-sec .count {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10px;
    letter-spacing: 0.2em;
    color: var(--ink-soft);
  }

  /* Dimension line */
  .cc-dim {
    display: flex;
    align-items: center;
    gap: 0;
    margin-bottom: 6px;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 9px;
    letter-spacing: 0.2em;
    color: var(--ink-soft);
  }
  .cc-dim .tick {
    width: 1px;
    height: 7px;
    background: var(--rule);
  }
  .cc-dim .line {
    flex: 1;
    height: 1px;
    background: var(--rule);
    position: relative;
  }
  .cc-dim .num {
    padding: 0 6px;
    background: var(--paper);
    position: absolute;
    left: 50%;
    top: -1px;
    transform: translate(-50%, -50%);
  }

  /* PLAN — links arranged as floor-plan rooms */
  .cc-plan-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1px;
    background: var(--rule);
    border: 1.5px solid var(--rule);
    position: relative;
  }
  @media (max-width: 720px) {
    .cc-plan-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .cc-room {
    position: relative;
    background: var(--paper);
    padding: 22px 18px 20px;
    min-height: 152px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    color: var(--ink);
    text-decoration: none;
    transition: background 0.25s ease, color 0.25s ease;
    overflow: hidden;
    cursor: pointer;
  }
  .cc-room::before {
    content: '';
    position: absolute;
    inset: 6px;
    border: 1px dashed transparent;
    pointer-events: none;
    transition: border-color 0.25s ease;
  }
  .cc-room::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      linear-gradient(var(--ink-soft), var(--ink-soft)) 0 0/8px 1px no-repeat,
      linear-gradient(var(--ink-soft), var(--ink-soft)) 0 0/1px 8px no-repeat,
      linear-gradient(var(--ink-soft), var(--ink-soft)) 100% 0/8px 1px no-repeat,
      linear-gradient(var(--ink-soft), var(--ink-soft)) 100% 0/1px 8px no-repeat,
      linear-gradient(var(--ink-soft), var(--ink-soft)) 0 100%/8px 1px no-repeat,
      linear-gradient(var(--ink-soft), var(--ink-soft)) 0 100%/1px 8px no-repeat,
      linear-gradient(var(--ink-soft), var(--ink-soft)) 100% 100%/8px 1px no-repeat,
      linear-gradient(var(--ink-soft), var(--ink-soft)) 100% 100%/1px 8px no-repeat;
    opacity: 0.55;
  }
  .cc-room:hover {
    background: var(--ink);
    color: var(--paper);
  }
  .cc-room:hover::before {
    border-color: rgba(232, 226, 214, 0.25);
  }
  .cc-room:hover::after {
    filter: invert(1) brightness(2);
    opacity: 0.35;
  }

  .cc-room .coord {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 9px;
    letter-spacing: 0.25em;
    color: var(--ink-soft);
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .cc-room .coord .dot {
    width: 5px;
    height: 5px;
    border: 1px solid currentColor;
    border-radius: 50%;
    display: inline-block;
    flex: 0 0 auto;
  }
  .cc-room .coord .ext {
    flex: 1;
    height: 1px;
    background: currentColor;
    opacity: 0.35;
  }
  .cc-room:hover .coord {
    color: var(--concrete);
  }

  .cc-room .label {
    font-family: 'Inter', 'Helvetica Neue', sans-serif;
    font-weight: 500;
    font-size: 17px;
    letter-spacing: -0.01em;
    line-height: 1.15;
  }

  .cc-room .meta {
    display: flex;
    justify-content: space-between;
    align-items: end;
    margin-top: 10px;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 9px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--ink-soft);
  }
  .cc-room:hover .meta {
    color: var(--concrete);
  }
  .cc-room .icon {
    width: 22px;
    height: 22px;
    opacity: 0.85;
  }

  .cc-room .area {
    position: absolute;
    left: 18px;
    bottom: 8px;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 8px;
    letter-spacing: 0.2em;
    color: var(--ink-soft);
    opacity: 0.7;
  }
  .cc-room:hover .area {
    color: var(--concrete);
    opacity: 0.8;
  }

  .cc-room .swing {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 44px;
    height: 44px;
    pointer-events: none;
    opacity: 0.4;
  }
  .cc-room:hover .swing {
    opacity: 0.65;
  }

  .cc-room .hatch {
    position: absolute;
    left: 0;
    top: 0;
    width: 28px;
    height: 28px;
    pointer-events: none;
    opacity: 0.25;
    background-image: repeating-linear-gradient(45deg, currentColor 0 1px, transparent 1px 4px);
    color: var(--ink);
    clip-path: polygon(0 0, 100% 0, 0 100%);
  }
  .cc-room:hover .hatch {
    opacity: 0.35;
    color: var(--concrete);
  }

  /* Scale bar */
  .cc-scale {
    display: flex;
    align-items: end;
    gap: 18px;
    margin-top: 24px;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 9px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--ink-soft);
  }
  .cc-scale .bars {
    display: flex;
    height: 8px;
  }
  .cc-scale .bars span {
    width: 28px;
    height: 100%;
  }
  .cc-scale .bars span:nth-child(odd) {
    background: var(--ink);
  }
  .cc-scale .bars span:nth-child(even) {
    background: var(--paper);
    border-top: 1px solid var(--ink);
    border-bottom: 1px solid var(--ink);
  }
  .cc-scale .bars span:first-child {
    border-left: 1px solid var(--ink);
  }
  .cc-scale .bars span:last-child {
    border-right: 1px solid var(--ink);
  }
  .cc-scale-spacer {
    flex: 1;
  }
```

- [ ] **Step 4: ビルドと目視確認**

Run: `npm run build`

Expected: ビルド成功（LinkIcons の import が解決され、19 件すべて `category` を持つので型エラー無し）。

`npm run dev` 起動後、`http://localhost:4321/#concrete` を `chrome-devtools-mcp` で確認：

- HERO の下に**A — A' 断面マーカー**（◯A───◯A' の dashed line）
- `B PLAN · 平面図 · LINKS  19 ROOMS` のセクションヘッダー
- 4列グリッドで19件のリンクが配置（mobile 390px では2列）
- 各 room に：座標 (A1·01, B2·05 等) / リンク名 / category (code/social等) / アイコン / `12.0 m²` / 右下のドアスイング 1/4 円弧 / 左上のハッチング
- room hover で背景が黒く反転、文字が paper 色に
- 下に**スケールバー** `SCALE ▮▯▮▯▮▯ 0—5m  1:50`

- [ ] **Step 5: コミット**

```bash
git add src/components/themes/ConcreteTheme.astro
git commit -m "feat(concrete): SECTION A-A' + PLAN grid (19 rooms with category) + scale bar"
```

---

## Task 9: Section B-B' cut + INDEX (OUTPUTS) grid

**Files:**
- Modify: `src/components/themes/ConcreteTheme.astro`

- [ ] **Step 1: PLAN セクションの閉じ `</div>` の直後に INDEX セクションを追加**

`src/components/themes/ConcreteTheme.astro` の `cc-scale` を含む `<div>` ブロックの**閉じ `</div>` の直後**（つまり PLAN ブロック全体の閉じ後）に以下を挿入する：

```astro
    <div>
      <div class="cc-cut">
        <div class="badge">B<span class="arrow"></span></div>
        <div class="line" />
        <span class="cc-cut-label">SECTION B — B'</span>
        <div class="line" />
        <div class="badge">B'<span class="arrow"></span></div>
      </div>

      <div class="cc-sec">
        <div class="marker">C</div>
        <div class="cc-sec-label">INDEX · 索引 · OUTPUTS</div>
        <div class="rule" />
        <div class="count">NOW</div>
      </div>

      <div class="cc-index">
        {OUTPUTS.map((o) => (
          <a href={o.url} class="cc-index-cell" target="_blank" rel="noopener noreferrer">
            <div class="lbl">▣ {o.badge}</div>
            <div class="val">{o.title}</div>
            <div class="sub">{o.subtitle}</div>
          </a>
        ))}
      </div>
    </div>
```

- [ ] **Step 2: 対応する CSS を `<style>` に追加**

`<style>` ブロック内、`.cc-scale-spacer` ルールの**直後**に以下を挿入する：

```css
  /* INDEX (OUTPUTS) — 2x2 legend-style grid */
  .cc-index {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1px;
    background: var(--rule);
    border: 1.5px solid var(--rule);
  }
  @media (max-width: 720px) {
    .cc-index {
      grid-template-columns: 1fr;
    }
  }
  .cc-index-cell {
    background: var(--paper);
    padding: 18px 18px 20px;
    display: grid;
    gap: 6px;
    text-decoration: none;
    color: var(--ink);
    transition: color 0.2s ease;
  }
  .cc-index-cell:hover {
    color: var(--rust);
  }
  .cc-index-cell .lbl {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 9px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--ink-soft);
  }
  .cc-index-cell:hover .lbl {
    color: var(--rust);
  }
  .cc-index-cell .val {
    font-family: 'Inter', 'Helvetica Neue', sans-serif;
    font-size: 14px;
    line-height: 1.5;
    font-weight: 400;
    color: var(--ink);
  }
  .cc-index-cell:hover .val {
    color: var(--rust);
  }
  .cc-index-cell .sub {
    font-size: 11px;
    color: var(--ink-soft);
    margin-top: 3px;
    letter-spacing: 0.04em;
  }
```

- [ ] **Step 3: ビルドと目視確認**

Run: `npm run build`

Expected: ビルド成功。

`npm run dev` 起動後、`http://localhost:4321/#concrete` を `chrome-devtools-mcp` で確認：

- PLAN の下に **B — B' 断面マーカー**
- `C INDEX · 索引 · OUTPUTS  NOW` のセクションヘッダー
- 2列グリッドに4件の OUTPUTS が表示（mobile 1列）
  - `▣ ARTICLE` / `Strands Agents Skill...` / `Zenn`
  - `▣ TALK` / `AI Agent Builders Meetup #2` / `Connpass`
  - `▣ REPO` / `n-yokomachi/tonari...` / `GitHub`
  - `▣ SLIDE` / `Strands Agents × Amazon Bedrock...` / `SpeakerDeck`
- cell hover で文字色が黒→錆色 `#8a3a1f` に変化、リンクとして機能

- [ ] **Step 4: コミット**

```bash
git add src/components/themes/ConcreteTheme.astro
git commit -m "feat(concrete): SECTION B-B' + INDEX (OUTPUTS) 2x2 グリッド"
```

---

## Task 10: Footer + hover readout

**Files:**
- Modify: `src/components/themes/ConcreteTheme.astro`

- [ ] **Step 1: INDEX セクションの閉じ `</div>` の直後に Footer を追加**

INDEX を含む `<div>` ブロックの**閉じ `</div>` の直後**（`.cc-stage` の最後の要素として）に以下を挿入する：

```astro
    <div class="cc-foot">
      <div class="cc-foot-left">
        <div><b>VIVIBIO</b> · NFC PROFILE · @{PROFILE.handle}</div>
        <div>MATERIAL: PLASTER + CONCRETE / 漆喰・コンクリート</div>
        <div>FINISH: BOARD-FORMED, BRUSHED</div>
      </div>
      <div class="cc-foot-stamp">
        <div>SHEET <b>A-101</b></div>
        <div>OF 04</div>
        <div>DRAWN BY <b>@{PROFILE.handle}</b></div>
        <div><span data-cc-clock>--:--</span> · UTC+09</div>
      </div>
    </div>
```

- [ ] **Step 2: `.cc-stage` の閉じ `</div>` の直後（`.cc` の最後の要素として）に hover readout を追加**

`.cc-stage` を閉じる `</div>` の直後に以下を挿入する（`.cc` の閉じ `</div>` の直前）：

```astro
  <div class="cc-readout" data-cc-readout>
    <span class="pip" />
    <span class="text"></span>
    <span class="url"></span>
  </div>
```

- [ ] **Step 3: 対応する CSS を `<style>` に追加**

`<style>` ブロック内、`.cc-index-cell .sub` ルールの**直後**に以下を挿入する：

```css
  /* FOOTER */
  .cc-foot {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 24px;
    align-items: end;
    padding-top: 24px;
    border-top: 1.5px solid var(--rule);
  }
  .cc-foot-left {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--ink-soft);
    line-height: 1.7;
  }
  .cc-foot-left b {
    color: var(--ink);
  }
  .cc-foot-stamp {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 9px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--ink-soft);
    text-align: right;
    line-height: 1.7;
  }
  .cc-foot-stamp b {
    color: var(--ink);
  }

  /* Hover readout — concrete plaque popup */
  .cc-readout {
    position: fixed;
    left: 50%;
    bottom: 64px;
    transform: translate(-50%, 0);
    z-index: 80;
    pointer-events: none;
    background: var(--ink);
    color: var(--paper);
    padding: 10px 18px;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10px;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    opacity: 0;
    transition: opacity 0.25s, transform 0.25s;
    display: flex;
    align-items: center;
    gap: 14px;
    box-shadow: 0 6px 18px rgba(40, 30, 15, 0.35);
  }
  .cc-readout.on {
    opacity: 1;
    transform: translate(-50%, -8px);
  }
  .cc-readout .pip {
    width: 6px;
    height: 6px;
    background: var(--rust);
  }
  .cc-readout .url {
    opacity: 0.55;
  }
```

- [ ] **Step 4: ビルドと目視確認**

Run: `npm run build`

Expected: ビルド成功。

`npm run dev` 起動後、`http://localhost:4321/#concrete` を `chrome-devtools-mcp` で確認：

- ページ最下部に**フッター**：
  - 左: `VIVIBIO · NFC PROFILE · @yoko` / `MATERIAL: PLASTER + CONCRETE / 漆喰・コンクリート` / `FINISH: BOARD-FORMED, BRUSHED`
  - 右: `SHEET A-101` / `OF 04` / `DRAWN BY @yoko` / `--:-- · UTC+09`
- hover-readout は CSS 上は描画されているが `opacity:0` で見えない（Task 12 でスクリプト追加）

- [ ] **Step 5: コミット**

```bash
git add src/components/themes/ConcreteTheme.astro
git commit -m "feat(concrete): Footer (sheet stamp + drawn-by @yoko) と hover-readout プラーク"
```

---

## Task 11: 装飾紙片3枚（s1: FACADE / s2: ROOF / s3: STAIR）

**Files:**
- Modify: `src/components/themes/ConcreteTheme.astro`

- [ ] **Step 1: 紙片3枚の HTML を `.cc-ties` の直後に追加**

`src/components/themes/ConcreteTheme.astro` の `.cc-ties` の閉じ `</div>` の**直後**に以下を挿入する：

```astro
  <div class="cc-scrap s1" aria-hidden="true">
    <span class="cc-tape t1" />
    <span class="cc-tape t2" />
    <div class="cc-scrap-h">FACADE — NORTH</div>
    <div class="cc-scrap-meta">SK-04 / 1:50</div>
    <div class="cc-scrap-note">check void above<br />opening — verify<br />head height 2100</div>
  </div>

  <div class="cc-scrap s2" aria-hidden="true">
    <span class="cc-tape t1" />
    <div class="cc-scrap-h">ROOF — PLAN</div>
    <div class="cc-scrap-meta">A-205 / rev. 01</div>
    <div class="cc-scrap-note">parapet 600<br />slope 1:50 ok?<br />drain at NE corner</div>
  </div>

  <div class="cc-scrap s3" aria-hidden="true">
    <span class="cc-tape t1" />
    <span class="cc-tape t2" />
    <div class="cc-scrap-h">STAIR — SECTION</div>
    <div class="cc-scrap-meta">SK-11 / 1:20</div>
    <div class="cc-scrap-note">14 risers ok?<br />180 × 260 typ.<br />handrail @ 850</div>
  </div>
```

- [ ] **Step 2: 対応する CSS を `<style>` に追加**

`<style>` ブロック内、`.cc-readout .url` ルールの**直後**に以下を挿入する：

```css
  /* Paper scraps — beige notes scattered across the page */
  .cc-scrap {
    position: absolute;
    z-index: 1;
    pointer-events: none;
    background: #d4cab2;
    color: rgba(26, 24, 21, 0.78);
    padding: 14px 16px 16px;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    opacity: 0.78;
    box-shadow:
      0 1px 0 rgba(0, 0, 0, 0.05),
      2px 4px 0 rgba(40, 32, 20, 0.08),
      6px 10px 18px rgba(40, 32, 20, 0.12);
  }
  .cc-scrap.s1 {
    left: -6%;
    top: 200px;
    width: 420px;
    min-height: 320px;
    transform: rotate(-6deg);
    clip-path: polygon(2% 0, 96% 1%, 99% 7%, 100% 96%, 94% 100%, 4% 99%, 1% 92%, 0 6%);
  }
  .cc-scrap.s2 {
    right: -5%;
    top: 680px;
    width: 460px;
    min-height: 360px;
    transform: rotate(4deg);
    clip-path: polygon(1% 2%, 95% 0, 100% 8%, 99% 95%, 96% 100%, 5% 98%, 0 90%, 2% 5%);
  }
  .cc-scrap.s3 {
    left: -3%;
    top: 1300px;
    width: 400px;
    min-height: 320px;
    transform: rotate(-3deg);
    clip-path: polygon(3% 1%, 97% 0, 99% 6%, 100% 94%, 95% 100%, 2% 99%, 0 88%, 1% 4%);
  }
  .cc-scrap-h {
    font-size: 13px;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    font-weight: 700;
    color: rgba(26, 24, 21, 0.85);
    border-bottom: 1px solid rgba(26, 24, 21, 0.35);
    padding-bottom: 10px;
    margin-bottom: 14px;
  }
  .cc-scrap-meta {
    font-size: 10px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: rgba(26, 24, 21, 0.55);
    margin-bottom: 26px;
  }
  .cc-scrap-note {
    font-family: 'Caveat', 'Comic Sans MS', cursive;
    font-size: 26px;
    line-height: 1.35;
    color: rgba(138, 58, 31, 0.65);
    transform: rotate(-1deg);
  }

  /* Masking-tape strips */
  .cc-tape {
    position: absolute;
    width: 56px;
    height: 16px;
    background: linear-gradient(180deg, rgba(220, 210, 180, 0.85), rgba(200, 188, 156, 0.75));
    box-shadow: 0 1px 2px rgba(40, 32, 20, 0.12);
    opacity: 0.8;
  }
  .cc-tape::before,
  .cc-tape::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    width: 4px;
    background: repeating-linear-gradient(45deg, transparent 0 2px, rgba(0, 0, 0, 0.08) 2px 3px);
  }
  .cc-tape::before {
    left: -2px;
  }
  .cc-tape::after {
    right: -2px;
  }
  .cc-scrap .cc-tape.t1 {
    top: -8px;
    left: 16px;
    transform: rotate(-4deg);
  }
  .cc-scrap .cc-tape.t2 {
    bottom: -8px;
    right: 24px;
    transform: rotate(6deg);
    width: 48px;
  }

  @media (max-width: 720px) {
    .cc-scrap.s1 {
      left: -12%;
      top: 220px;
      width: 280px;
      min-height: 220px;
    }
    .cc-scrap.s2 {
      right: -14%;
      top: 640px;
      width: 300px;
      min-height: 240px;
    }
    .cc-scrap.s3 {
      left: -8%;
      top: 1180px;
      width: 270px;
      min-height: 220px;
    }
    .cc-scrap-h {
      font-size: 11px;
    }
    .cc-scrap-note {
      font-size: 20px;
    }
  }
```

- [ ] **Step 3: ビルドと目視確認**

Run: `npm run build`

Expected: ビルド成功。

`npm run dev` 起動後、`http://localhost:4321/#concrete` を `chrome-devtools-mcp` で確認：

- 画面の左右に**3枚のベージュ紙片**が斜めに配置：
  - s1: 左上 (`top: 200px`) `FACADE — NORTH` / `SK-04 / 1:50` / 手書き風メモ3行（錆色 Caveat）
  - s2: 右中 (`top: 680px`) `ROOF — PLAN` / `A-205 / rev. 01` / `parapet 600 / slope 1:50 ok? / drain at NE corner`
  - s3: 左下 (`top: 1300px`) `STAIR — SECTION` / `SK-11 / 1:20` / 手書きメモ
- 各紙片に**マスキングテープ片**（上端や下端）、**torn-edge clip-path** で破れたような縁
- 紙片は `pointer-events: none` でリンク操作を奪わない
- モバイル emulation (390px) で紙片が小さくなり位置調整されている

- [ ] **Step 4: コミット**

```bash
git add src/components/themes/ConcreteTheme.astro
git commit -m "feat(concrete): 装飾紙片3枚 (FACADE / ROOF / STAIR) + マスキングテープ"
```

---

## Task 12: スクリプト（lazy init + clock 1分更新 + hover readout + マウス視差）

**Files:**
- Modify: `src/components/themes/ConcreteTheme.astro`

- [ ] **Step 1: ファイル末尾（`</style>` の直後）に `<script>` ブロックを追加**

`src/components/themes/ConcreteTheme.astro` の最後の `</style>` の直後に以下を追加する：

```astro
<script>
  function initConcreteEffects() {
    if ((window as any).__concreteInited) return;
    (window as any).__concreteInited = true;

    // ----- Clock 1分更新 (TITLE BLOCK 右、Footer 右) -----
    const clockEls = document.querySelectorAll<HTMLElement>('[data-cc-clock]');
    if (clockEls.length > 0) {
      const updateClock = () => {
        const d = new Date();
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        const text = `${hh}:${mm}`;
        clockEls.forEach((el) => {
          el.textContent = text;
        });
      };
      updateClock();
      setInterval(updateClock, 60_000);
    }

    // ----- Hover readout (room hover/touchstart で表示) -----
    const readout = document.querySelector<HTMLElement>('[data-cc-readout]');
    const readoutText = readout?.querySelector<HTMLElement>('.text');
    const readoutUrl = readout?.querySelector<HTMLElement>('.url');
    const rooms = document.querySelectorAll<HTMLElement>('[data-cc-room]');
    if (readout && readoutText && readoutUrl) {
      const showReadout = (el: HTMLElement) => {
        const label = el.dataset.ccLabel ?? '';
        const handle = el.dataset.ccHandle ?? '';
        const url = el.dataset.ccUrl ?? '';
        readoutText.textContent = `${label} · ${handle}`;
        readoutUrl.textContent = `→ ${url}`;
        readout.classList.add('on');
      };
      const hideReadout = () => {
        readout.classList.remove('on');
      };
      rooms.forEach((el) => {
        el.addEventListener('mouseenter', () => showReadout(el));
        el.addEventListener('mouseleave', hideReadout);
        el.addEventListener('focus', () => showReadout(el));
        el.addEventListener('blur', hideReadout);
        el.addEventListener('touchstart', () => showReadout(el), { passive: true });
      });
    }

    // ----- マウス視差 (cc-surface を ±6px 動かす) -----
    const cc = document.querySelector<HTMLElement>('.cc');
    if (cc) {
      const onMove = (e: PointerEvent) => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const nx = (e.clientX / w - 0.5) * 2; // -1..1
        const ny = (e.clientY / h - 0.5) * 2;
        const px = (nx * 6).toFixed(2);
        const py = (ny * 6).toFixed(2);
        cc.style.setProperty('--par-x', `${px}px`);
        cc.style.setProperty('--par-y', `${py}px`);
      };
      window.addEventListener('pointermove', onMove);
    }
  }

  // 初期 data-theme が concrete のときは即時、そうでなければ MutationObserver で待つ
  if (document.documentElement.dataset.theme === 'concrete') {
    initConcreteEffects();
  } else {
    const observer = new MutationObserver(() => {
      if (document.documentElement.dataset.theme === 'concrete') {
        initConcreteEffects();
        observer.disconnect();
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }
</script>
```

- [ ] **Step 2: ビルドと動作確認**

Run: `npm run build`

Expected: ビルド成功（TS 型エラー無し）。

`npm run dev` 起動後、`http://localhost:4321/#concrete` を `chrome-devtools-mcp` で確認：

- TITLE BLOCK の右と Footer の右の `--:--` が**現在の HH:MM** に置き換わっている
- room（PLAN グリッドの各タイル）にマウスをホバーすると、**画面下中央**に黒いプラークが出現し `GitHub · n-yokomachi  → https://github.com/n-yokomachi` 等のテキストを表示
- room から離れるとプラークが消える
- マウスをページ内で移動すると、**プラスター背景がわずかに視差移動**（±6px、滑らか transition）
- 60秒間放置すると clock が次の分に更新される
- スイッチャーで他テーマに切替→戻すと clock や hover が引き続き機能（再初期化はガードで一回のみ）
- コンソールエラー無し

- [ ] **Step 3: コミット**

```bash
git add src/components/themes/ConcreteTheme.astro
git commit -m "feat(concrete): スクリプト (clock 1分更新 / hover readout / マウス視差)"
```

---

## Task 13: 全体動作確認 + リグレッションチェック

**Files:** （変更なし、確認のみ）

- [ ] **Step 1: フルビルド**

Run: `npm run build`

Expected: ビルド成功、警告なし。`dist/` に出力されている。

- [ ] **Step 2: 4テーマ全切替確認**

`npm run dev` 起動後、`chrome-devtools-mcp` で以下のURLを順に navigate して各テーマが正常に動作することを確認：

- `http://localhost:4321/` → Minimal（既存通り、Hero/Links/Output/Footer 表示）
- `http://localhost:4321/#glitch` → Glitch（既存通り、RGB シフト・パーティクル・ロケット）
- `http://localhost:4321/#particle` → Particle（既存通り、ネビュラ・星・接続線）
- `http://localhost:4321/#concrete` → Concrete（新規、すべての要素が表示）
- スイッチャーで concrete → minimal → glitch → particle → concrete と一周しても破綻しない
- localStorage に保存されたテーマがリロード後も保持される

- [ ] **Step 3: モバイル emulation 確認**

`chrome-devtools-mcp` で 390×844 (iPhone 14) にエミュレートし以下を確認：

- `#concrete` で：
  - PLAN グリッドが2列
  - INDEX が1列
  - 紙片3枚が小さくなり位置調整されている
  - 縦書き SIDE LABEL が非表示
  - 北方位コンパスが小さく右上に
  - 手で操作してスイッチャーが展開、4ボタン全て表示
  - room タップで hover-readout が出現

- [ ] **Step 4: コンソールエラーチェック**

`chrome-devtools-mcp` で `list_console_messages` を呼び出し、4テーマすべてでエラー・警告が無いことを確認。

- [ ] **Step 5: Lighthouse（任意）**

`chrome-devtools-mcp` の `lighthouse_audit` で `#concrete` を計測し、Performance/Accessibility が大幅悪化していないこと（既存 Minimal と比較して許容範囲）を確認。

- [ ] **Step 6: 最終確認＋コミット（変更があれば）**

実装中に追加修正が必要だった部分（オープンクエスチョンに記載した位置調整・視差振幅微調整など）があればこのタイミングで修正してコミット。なければスキップ。

```bash
# 修正があった場合のみ:
git add -p
git commit -m "fix(concrete): 動作確認後の微調整 (具体的な内容を記載)"
```

---

## 完了の定義

- [ ] 上記タスク 1〜13 のすべての step が `- [x]` でチェック済み
- [ ] `npm run build` が成功
- [ ] 4 テーマ (minimal / glitch / particle / concrete) が双方向に切替可能で破綻しない
- [ ] Concrete の全要素（TITLE BLOCK / HERO / PLAN / INDEX / Footer / 装飾紙片 / 背景幾何 / hover readout / clock / マウス視差）が想定通り動作
- [ ] モバイル(390×844)で2列グリッド・1列 INDEX・紙片サイズ縮小が機能
- [ ] コンソールエラーなし
- [ ] 既存テーマ(Minimal / Glitch / Particle) が無変更で表示・動作とも回帰なし
