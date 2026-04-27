# Particle Theme & @yoko Handle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** vivibio に深宇宙観測室をモチーフとした Particle テーマを追加し、合わせて全テーマで `@yoko` ハンドルと Footer 文言を統一する。

**Architecture:** 既存の `data-theme` 属性 + CSS パターンを踏襲。Particle は Glitch と同じ「自己完結型テーマファイル + Canvas + lazy init」構成。データ層は `PROFILE.handle: 'yoko'` を追加するのみで他は無変更（DRY）。

**Tech Stack:** Astro 5 / TypeScript / Vanilla JS（React 不使用） / Canvas API / CSS

**Spec:** `docs/superpowers/specs/2026-04-27-vivibio-particle-theme-design.md`

**Reference:** `tmp/particle-ref/vivibio/project/theme-particles.jsx`（参照デザインの React 実装）

---

## Verification Approach

このプロジェクトはユニットテストフレームワークを持たない Astro 静的サイトですわ。各タスクの検証は以下の組み合わせで行いますの：

- **ビルド**: `npm run build` で型・構文エラー無し
- **目視**: `npm run dev` 起動 + `chrome-devtools-mcp` でナビゲート・スクリーンショット
- **動作**: コンソールエラー無し、テーマ切替が機能、アニメーションが滑らか

「TDD の代わりに build + visual」のサイクルで進めますわ。

---

## File Structure

### 新規作成

- `src/components/themes/ParticleTheme.astro` — 自己完結型 Particle テーマ（HTML + scoped CSS + inline script）

### 修正

- `src/data/profile.ts` — `handle: 'yoko'` を PROFILE に追加
- `src/components/Hero.astro` — `@yoko` 行を name 下に追加（Minimal）
- `src/components/Footer.astro` — brand を `vivibio / @yoko` に変更（Minimal）
- `src/components/themes/GlitchTheme.astro` — `gl-line` に `@yoko` を埋め込み、ASCII フッターに文言追加
- `src/layouts/BaseLayout.astro` — inline script の `allowed` 配列に `particle` 追加、body CSS に Particle 用ルール追加
- `src/components/ThemeSwitcher.astro` — `themes` / `ALLOWED` 配列に particle 追加、SVG アイコン追加、active 枠スタイル追加
- `src/pages/index.astro` — `ParticleTheme` を import + マウント

### 変更なし（DRY 維持）

- `src/data/profile.ts` の LINKS / OUTPUTS（構造変更なし）
- `src/components/icons/LinkIcons.astro`（共有・無変更）
- `src/components/{TopBar,Links,Output}.astro`（Minimal 専用・無変更）

---

## Task 1: PROFILE に `handle: 'yoko'` を追加

**Files:**
- Modify: `src/data/profile.ts`

- [ ] **Step 1: 既存の PROFILE を確認**

Run: `cat src/data/profile.ts | head -30`

Expected: `PROFILE` オブジェクトが定義されており、`name`, `nameJa`, `title`, `location`, `bio`, `bioJa`, `currently`, `avatarUrl`, `githubId` が含まれる。`handle` フィールドはまだ存在しない。

- [ ] **Step 2: `handle: 'yoko'` を nameJa の直下に挿入**

`src/data/profile.ts` の `nameJa: '横町 直樹',` の直後（次行）に以下を追加：

```ts
  handle: 'yoko',
```

挿入後の PROFILE 先頭部分は次のようになる：

```ts
export const PROFILE = {
  name: 'Naoki Yokomachi',
  nameJa: '横町 直樹',
  handle: 'yoko',
  title: 'Software Engineer / AI Engineer',
  location: 'Tokyo, Japan',
  // ...以下既存のまま
} as const;
```

- [ ] **Step 3: 型エラー無く build できるか確認**

Run: `npm run build`

Expected: `0 errors` でビルド完了。`PROFILE.handle` を参照しているコードはまだ無いので警告も出ない。

- [ ] **Step 4: コミット**

```bash
git add src/data/profile.ts
git commit -m "feat(profile): 共通ハンドル handle: 'yoko' を PROFILE に追加"
```

---

## Task 2: Minimal Footer に `vivibio / @yoko` を反映

**Files:**
- Modify: `src/components/Footer.astro`

- [ ] **Step 1: 既存 Footer を確認**

Run: `cat src/components/Footer.astro`

Expected: `vivibio` ブランドと `©{year}` を表示するシンプルな構成。`PROFILE` は import されていない。

- [ ] **Step 2: Footer.astro を完全に書き換え**

`src/components/Footer.astro` を以下で置き換える：

```astro
---
import { PROFILE } from '../data/profile.ts';

const year = new Date().getFullYear();
---

<footer class="mn-foot">
  <span class="brand mn-mono">vivibio / @{PROFILE.handle}</span>
  <span class="mn-acc" aria-hidden="true">●</span>
  <span class="mn-mono">©{year}</span>
</footer>

<style>
  .mn-foot {
    margin-top: 64px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 11px;
    color: rgba(26, 26, 26, 0.4);
    letter-spacing: 0.04em;
  }
  .brand {
    font-weight: 500;
  }
  .mn-mono {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
  }
  .mn-acc {
    color: #ff5733;
  }
</style>
```

主な変更: `<span class="brand mn-mono">vivibio</span>` → `<span class="brand mn-mono">vivibio / @{PROFILE.handle}</span>`、および `import { PROFILE }` を追加。スタイルは無変更。

- [ ] **Step 3: build を回して型エラーが無いことを確認**

Run: `npm run build`

Expected: ビルド成功。

- [ ] **Step 4: コミット**

```bash
git add src/components/Footer.astro
git commit -m "feat(minimal): Footer 文言を 'vivibio / @yoko ● ©2026' に統一"
```

---

## Task 3: Minimal Hero に `@yoko` 行を追加

**Files:**
- Modify: `src/components/Hero.astro`

- [ ] **Step 1: 既存 Hero を確認**

Run: `cat src/components/Hero.astro`

Expected: `<h1 class="mn-name">I'm <span class="hl">{PROFILE.name}</span>.</h1>` の下に `mn-title`（PROFILE.title）が続く構成。

- [ ] **Step 2: `mn-name` の直下に `mn-handle` 行を追加**

`src/components/Hero.astro` の `<h1 class="mn-name">...</h1>` の**閉じタグの直後**に以下を挿入する：

```astro
  <p class="mn-handle">@{PROFILE.handle}</p>
```

挿入後の `<section class="mn-hero">` 構造は次のようになる：

```astro
<section class="mn-hero">
  <div class="mn-eye">— hello,</div>
  <h1 class="mn-name">
    I'm <span class="hl">{PROFILE.name}</span>.
  </h1>
  <p class="mn-handle">@{PROFILE.handle}</p>
  <p class="mn-title">{PROFILE.title}</p>
  <p class="mn-sub">{PROFILE.bio}</p>
  <p class="mn-sub-ja">{PROFILE.bioJa}</p>

  <div class="mn-meta">
    <!-- 既存のまま -->
  </div>
</section>
```

- [ ] **Step 3: スタイルを `<style>` ブロックに追加**

`<style>` ブロックの末尾（`}` の前、つまり既存の `.mn-meta div b` ブロックの直後）に以下を追加：

```css
  .mn-handle {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 11px;
    letter-spacing: 0.14em;
    color: rgba(26, 26, 26, 0.5);
    margin: 6px 0 0;
    font-weight: 500;
  }
```

- [ ] **Step 4: ビルドと目視確認**

Run: `npm run build`

Expected: ビルド成功、エラー無し。

その後 `npm run dev` を起動し、`http://localhost:4321/` を `chrome-devtools-mcp` で開いて以下を確認：

- 名前 `Naoki Yokomachi.` の直下に小さな mono フォントで `@yoko` が表示されている
- Footer に `vivibio / @yoko ● ©2026` が表示されている

- [ ] **Step 5: コミット**

```bash
git add src/components/Hero.astro
git commit -m "feat(minimal): Hero の名前下に @yoko ハンドル行を追加"
```

---

## Task 4: Glitch テーマの `gl-line` と ASCII フッターに `@yoko` を反映

**Files:**
- Modify: `src/components/themes/GlitchTheme.astro`

- [ ] **Step 1: 既存の該当行を grep で確認**

Run: `grep -n "gl-line\|END_OF_TRANSMISSION\|gl-ascii" src/components/themes/GlitchTheme.astro | head -20`

Expected: `gl-line` の `<div>` が hero 直下に、`gl-ascii` の `<pre>` が末尾近くに見つかる。

- [ ] **Step 2: `gl-line` を `@yoko` を含む形に修正**

`src/components/themes/GlitchTheme.astro` 内の以下の行：

```astro
      <div class="gl-mono gl-line">
        // {PROFILE.title.toLowerCase()} · {PROFILE.location.toLowerCase()}
      </div>
```

を、以下に置き換える：

```astro
      <div class="gl-mono gl-line">
        // @{PROFILE.handle} · {PROFILE.title.toLowerCase()} · {PROFILE.location.toLowerCase()}
      </div>
```

- [ ] **Step 3: ASCII フッターの中央行を更新**

`src/components/themes/GlitchTheme.astro` 内の：

```astro
    <pre class="gl-ascii">{asciiTop}
   END_OF_TRANSMISSION  ::  <span data-glitch-day>{dayPad}</span>
{asciiBottom}</pre>
```

を、以下に置き換える：

```astro
    <pre class="gl-ascii">{asciiTop}
   vivibio / @{PROFILE.handle} :: END_OF_TRANSMISSION :: <span data-glitch-day>{dayPad}</span>
{asciiBottom}</pre>
```

- [ ] **Step 4: ビルドと目視確認**

Run: `npm run build`

Expected: ビルド成功。

`npm run dev` 起動後、`http://localhost:4321/#glitch` を `chrome-devtools-mcp` で開いて以下を確認：

- 名前直下のラインに `// @yoko · software engineer / ai engineer · tokyo, japan` が表示
- ページ末尾の ASCII ブロック内中央行に `vivibio / @yoko :: END_OF_TRANSMISSION :: 27` が表示（27 は今日の日）
- 横スクロールバーが出ていないこと（`gl-ascii` の `overflow-x: auto` で対応済み）

- [ ] **Step 5: コミット**

```bash
git add src/components/themes/GlitchTheme.astro
git commit -m "feat(glitch): gl-line と ASCII フッターに @yoko を埋め込み"
```

---

## Task 5: BaseLayout の `allowed` 配列と body CSS に particle を追加

**Files:**
- Modify: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: inline script の `allowed` 配列を更新**

`src/layouts/BaseLayout.astro` 内の：

```js
          var allowed = ['minimal', 'glitch'];
```

を：

```js
          var allowed = ['minimal', 'glitch', 'particle'];
```

に変更する。

- [ ] **Step 2: body CSS に `particle` テーマ用ルールを追加**

`<style is:global>` ブロック内の以下の行のすぐ下：

```css
      :root[data-theme='glitch'] body {
        background: #07010d;
        color: #fff;
        font-family: 'Space Grotesk', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      }
```

に続けて、以下を挿入する：

```css
      :root[data-theme='particle'] body {
        background: #05080e;
        color: #e2efff;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
      }
```

- [ ] **Step 3: theme-pane の表示切替セレクタに particle を追加**

`<style is:global>` 内の：

```css
      :root[data-theme='minimal'] .theme-pane[data-theme='minimal'],
      :root[data-theme='glitch'] .theme-pane[data-theme='glitch'] {
        display: block;
      }
```

を：

```css
      :root[data-theme='minimal'] .theme-pane[data-theme='minimal'],
      :root[data-theme='glitch'] .theme-pane[data-theme='glitch'],
      :root[data-theme='particle'] .theme-pane[data-theme='particle'] {
        display: block;
      }
```

に変更する。

- [ ] **Step 4: ビルド確認**

Run: `npm run build`

Expected: ビルド成功。`particle` テーマ用パネルはまだ存在しないので、`/#particle` に飛んでも何も表示されないが、それは Task 7-8 で解決する。

- [ ] **Step 5: コミット**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "feat(layout): BaseLayout を particle テーマ対応 (allowed/body/theme-pane)"
```

---

## Task 6: ThemeSwitcher に particle を追加

**Files:**
- Modify: `src/components/ThemeSwitcher.astro`

- [ ] **Step 1: `themes` 配列に particle を追加**

`src/components/ThemeSwitcher.astro` の冒頭：

```astro
const themes = [
  { id: 'minimal', label: 'MINIMAL' },
  { id: 'glitch', label: 'GLITCH' },
];
```

を：

```astro
const themes = [
  { id: 'minimal', label: 'MINIMAL' },
  { id: 'glitch', label: 'GLITCH' },
  { id: 'particle', label: 'PARTICLE' },
];
```

に変更する。

- [ ] **Step 2: SVG アイコンの分岐に particle を追加**

`src/components/ThemeSwitcher.astro` の `<span class="ts-icon">` ブロック内、`{t.id === 'glitch' && (...)}` の閉じカッコ `)}` の直後に、以下のブロックを追加する：

```astro
          {t.id === 'particle' && (
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <circle cx="12" cy="12" r="10" fill="none" stroke="#7ec8ff" stroke-opacity="0.25" stroke-width="0.4" />
              <circle cx="12" cy="12" r="7" fill="none" stroke="#7ec8ff" stroke-opacity="0.4" stroke-width="0.6" />
              <circle cx="12" cy="12" r="2" fill="#7ec8ff" />
              <circle cx="19" cy="12" r="1.4" fill="#e2efff" />
              <circle cx="6.5" cy="15" r="1" fill="#e2efff" opacity="0.7" />
            </svg>
          )}
```

- [ ] **Step 3: 各 ts-btn の初期 `aria-current` ロジックを修正**

`src/components/ThemeSwitcher.astro` の：

```astro
      <button class="ts-btn" data-theme-target={t.id} aria-current={t.id === 'minimal' ? 'true' : 'false'}>
```

これは初期値として minimal を current にしている。**変更なし**で OK（`particle` でも minimal が初期 fallback）。クライアントスクリプトで実際の current が再計算される。

- [ ] **Step 4: アクティブテーマ枠色のスタイル追加**

`<style>` 内の：

```css
  :root[data-theme='glitch'] .ts-btn[aria-current='true'] {
    border-color: #ff2d8d;
    box-shadow: -4px 0 16px rgba(255, 45, 141, 0.25);
  }
```

の直後に以下を追加：

```css
  :root[data-theme='particle'] .ts-btn[aria-current='true'] {
    border-color: #7ec8ff;
    box-shadow: -4px 0 16px rgba(126, 200, 255, 0.25);
  }
```

- [ ] **Step 5: クライアントスクリプトの `ALLOWED` を更新**

`<script>` ブロック内の：

```ts
  const ALLOWED = ['minimal', 'glitch'] as const;
```

を：

```ts
  const ALLOWED = ['minimal', 'glitch', 'particle'] as const;
```

に変更する。

- [ ] **Step 6: ビルドと目視確認**

Run: `npm run build`

Expected: ビルド成功。

`npm run dev` 起動 + `chrome-devtools-mcp` で確認：

- 右端のスイッチャーに3つのボタン（MINIMAL / GLITCH / PARTICLE）が縦に並んでいる
- PARTICLE ボタンにクリックすると hash が `#particle` になるが、まだテーマパネルが無いので画面は空（次タスクで埋める）

- [ ] **Step 7: コミット**

```bash
git add src/components/ThemeSwitcher.astro
git commit -m "feat(switcher): ThemeSwitcher に PARTICLE ボタンと SVG を追加"
```

---

## Task 7: ParticleTheme.astro を作成（HTML + scoped CSS、Canvas 無し）

**Files:**
- Create: `src/components/themes/ParticleTheme.astro`

このタスクではテキストコンテンツ + 装飾オーバーレイ（vignette / grain）まで作成する。Canvas は次タスク以降。

- [ ] **Step 1: 新規ファイルを作成**

`src/components/themes/ParticleTheme.astro` を以下の内容で新規作成する：

```astro
---
import { PROFILE, LINKS, OUTPUTS } from '../../data/profile';
import LinkIcons from '../icons/LinkIcons.astro';

const now = new Date();
const yyyy = now.getFullYear();
const mm = String(now.getMonth() + 1).padStart(2, '0');
const dd = String(now.getDate()).padStart(2, '0');
const dateFull = `${yyyy}.${mm}.${dd}`;
const dateMd = `${mm}.${dd}`;

const linkCount = String(LINKS.length).padStart(2, '0');
---

<div class="pa">
  <canvas class="pa-canvas" aria-hidden="true"></canvas>

  <div class="pa-content">
    <header class="pa-top">
      <span class="pa-mono pa-eye">VVB / 026</span>
      <span class="pa-bracket" data-particle-bracket>
        <span class="on"></span><span></span><span class="on"></span><span></span><span class="on"></span>
      </span>
      <span class="pa-mono pa-eye pa-clock" data-particle-clock>--:--:--</span>
    </header>

    <section class="pa-hero">
      <div class="pa-eye">— signal received</div>
      <h1 class="pa-name"><span class="glow">{PROFILE.name}</span></h1>
      <div class="pa-name-ja">{PROFILE.nameJa}</div>
      <div class="pa-handle pa-mono">@{PROFILE.handle}</div>
      <p class="pa-tagline">{PROFILE.bio}</p>
      <p class="pa-tagline-ja">{PROFILE.bioJa}</p>
      <div class="pa-coords pa-mono">
        <span>35.6762°N</span><span>·</span><span>139.6503°E</span><span>·</span><span>{PROFILE.title}</span>
      </div>
    </section>

    <section class="pa-rail">
      <div class="pa-rail-h">
        <span class="l">— links</span>
        <span class="r pa-mono">[ {linkCount} ]</span>
      </div>
      <div class="pa-links">
        {LINKS.map((l) => (
          <a
            href={l.url}
            class="pa-link"
            title={`${l.label} · ${l.handle}`}
            target={l.url.startsWith('mailto:') ? undefined : '_blank'}
            rel={l.url.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
          >
            <span class="ic"><LinkIcons id={l.id} /></span>
            <span class="lab">{l.label}</span>
          </a>
        ))}
      </div>
    </section>

    <section class="pa-rail">
      <div class="pa-rail-h">
        <span class="l">— outputs</span>
        <span class="r pa-mono">{dateFull}</span>
      </div>
      <div class="pa-outputs">
        {OUTPUTS.map((o) => (
          <a href={o.url} class="pa-out" target="_blank" rel="noopener noreferrer">
            <span class="dot" aria-hidden="true">◦</span>
            <span class="pa-mono date">{dateMd}</span>
            <span class={`pa-mono badge badge-${o.badge.toLowerCase()}`}>[{o.badge}]</span>
            <span class="title">{o.title}</span>
            <span class="sub">{o.subtitle}</span>
          </a>
        ))}
      </div>
    </section>

    <footer class="pa-foot pa-mono">
      <span>vivibio / @{PROFILE.handle}</span>
      <span>© {yyyy} ∞ vivibio</span>
    </footer>
  </div>
</div>

<style>
  .pa {
    position: relative;
    min-height: 100dvh;
    color: #e2efff;
    overflow: hidden;
  }

  /* Canvas — 全画面背景 */
  .pa-canvas {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
  }

  /* Vignette */
  .pa::before {
    content: '';
    position: fixed;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(ellipse at center, transparent 30%, rgba(0, 0, 0, 0.5) 100%);
    z-index: 1;
  }

  /* Grain */
  .pa::after {
    content: '';
    position: fixed;
    inset: 0;
    pointer-events: none;
    opacity: 0.12;
    mix-blend-mode: overlay;
    background-image: radial-gradient(circle at 1px 1px, #fff 0.5px, transparent 1px);
    background-size: 3px 3px;
    z-index: 1;
  }

  .pa-content {
    position: relative;
    z-index: 3;
    max-width: 960px;
    margin: 0 auto;
    padding: 22px;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
  }

  @media (min-width: 768px) {
    .pa-content {
      padding: 28px 32px 60px;
    }
  }

  .pa-mono {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
  }
  .pa-eye {
    font-size: 10px;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: rgba(180, 220, 255, 0.55);
  }

  /* Top bar */
  .pa-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .pa-bracket {
    display: inline-flex;
    gap: 4px;
    align-items: center;
  }
  .pa-bracket span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(180, 220, 255, 0.35);
    transition: background 0.3s ease, box-shadow 0.3s ease;
  }
  .pa-bracket span.on {
    background: #7ec8ff;
    box-shadow: 0 0 8px #7ec8ff;
  }
  .pa-clock {
    min-width: 7ch;
    text-align: right;
  }

  /* Hero — コンパクト中央寄せ */
  .pa-hero {
    padding: 60px 0 40px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  .pa-name {
    font-size: clamp(36px, 9vw, 56px);
    font-weight: 200;
    letter-spacing: 0.14em;
    line-height: 1;
    margin: 14px 0 0;
    text-transform: uppercase;
  }
  .pa-name .glow {
    text-shadow: 0 0 18px rgba(126, 200, 255, 0.6);
  }
  .pa-name-ja {
    font-size: 11px;
    letter-spacing: 0.3em;
    color: rgba(180, 220, 255, 0.55);
    margin-top: 12px;
  }
  .pa-handle {
    font-size: 11px;
    letter-spacing: 0.3em;
    color: #7ec8ff;
    margin-top: 8px;
  }
  .pa-tagline {
    font-size: 14px;
    letter-spacing: 0.04em;
    line-height: 1.55;
    max-width: 32ch;
    margin: 28px 0 0;
    color: rgba(226, 239, 255, 0.78);
    font-weight: 300;
  }
  .pa-tagline-ja {
    font-size: 11px;
    color: rgba(180, 220, 255, 0.5);
    margin: 8px 0 0;
    line-height: 1.6;
    max-width: 36ch;
    word-break: auto-phrase;
    line-break: strict;
  }
  .pa-coords {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
    margin-top: 26px;
    font-size: 10px;
    color: rgba(180, 220, 255, 0.55);
    letter-spacing: 0.14em;
  }

  /* Rail */
  .pa-rail {
    margin-top: 36px;
    padding-top: 22px;
    border-top: 1px solid rgba(180, 220, 255, 0.12);
  }
  .pa-rail-h {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 14px;
  }
  .pa-rail-h .l {
    font-size: 10px;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: rgba(180, 220, 255, 0.55);
  }
  .pa-rail-h .r {
    font-size: 10px;
    color: rgba(180, 220, 255, 0.4);
  }

  /* Links grid */
  .pa-links {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 8px;
  }
  .pa-link {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border: 1px solid rgba(180, 220, 255, 0.18);
    background: rgba(5, 8, 14, 0.4);
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);
    text-decoration: none;
    color: rgba(200, 230, 255, 0.85);
    transition: border-color 0.18s ease, color 0.18s ease, box-shadow 0.18s ease;
    min-width: 0;
  }
  .pa-link:hover,
  .pa-link:active {
    border-color: #7ec8ff;
    color: #7ec8ff;
    box-shadow: 0 0 16px rgba(126, 200, 255, 0.3), inset 0 0 16px rgba(126, 200, 255, 0.08);
  }
  .pa-link .ic {
    width: 22px;
    height: 22px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
  }
  .pa-link .lab {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
  }
  @media (min-width: 640px) {
    .pa-links {
      grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
    }
    .pa-link .lab {
      font-size: 12px;
    }
  }

  /* Outputs timeline */
  .pa-outputs {
    border-left: 1px solid rgba(180, 220, 255, 0.18);
    padding-left: 16px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .pa-out {
    display: grid;
    grid-template-columns: auto auto auto 1fr;
    grid-template-rows: auto auto;
    gap: 4px 10px;
    align-items: baseline;
    text-decoration: none;
    color: #e2efff;
    transition: color 0.18s ease;
  }
  .pa-out:hover .title,
  .pa-out:hover .dot {
    color: #7ec8ff;
  }
  .pa-out:hover .dot {
    text-shadow: 0 0 8px #7ec8ff;
  }
  .pa-out .dot {
    grid-row: 1;
    font-size: 12px;
    color: rgba(180, 220, 255, 0.7);
    transition: color 0.18s ease, text-shadow 0.18s ease;
  }
  .pa-out .date {
    grid-row: 1;
    font-size: 10px;
    color: rgba(180, 220, 255, 0.5);
    letter-spacing: 0.14em;
  }
  .pa-out .badge {
    grid-row: 1;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.1em;
  }
  .pa-out .title {
    grid-row: 1;
    grid-column: 4;
    font-size: 13px;
    line-height: 1.4;
    color: rgba(226, 239, 255, 0.95);
  }
  .pa-out .sub {
    grid-row: 2;
    grid-column: 4;
    font-size: 10px;
    color: rgba(180, 220, 255, 0.5);
    letter-spacing: 0.04em;
  }
  .badge-article { color: #7ec8ff; }
  .badge-talk    { color: #e8d27a; }
  .badge-repo    { color: #7adcb0; }
  .badge-slide   { color: #d99cff; }

  /* Footer */
  .pa-foot {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 24px;
    margin-top: 36px;
    border-top: 1px solid rgba(180, 220, 255, 0.12);
    font-size: 10px;
    color: rgba(180, 220, 255, 0.5);
    letter-spacing: 0.14em;
  }
</style>
```

- [ ] **Step 2: ビルド確認**

Run: `npm run build`

Expected: 新規ファイルが含まれてビルド成功（warning 無し）。まだ index.astro でマウントしていないので画面には出ない。

- [ ] **Step 3: コミット**

```bash
git add src/components/themes/ParticleTheme.astro
git commit -m "feat(particle): ParticleTheme.astro の HTML + scoped CSS を作成 (canvas 未実装)"
```

---

## Task 8: index.astro に ParticleTheme をマウント

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: import と JSX に ParticleTheme を追加**

`src/pages/index.astro` を以下で完全に置き換える：

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import MinimalTheme from '../components/themes/MinimalTheme.astro';
import GlitchTheme from '../components/themes/GlitchTheme.astro';
import ParticleTheme from '../components/themes/ParticleTheme.astro';
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
  <ThemeSwitcher />
</BaseLayout>
```

主な変更: `import ParticleTheme` の追加、`<main class="theme-pane" data-theme="particle">` ブロックの追加。

- [ ] **Step 2: ビルドと目視確認（Canvas 無しの状態）**

Run: `npm run build`

Expected: ビルド成功。

`npm run dev` 起動 + `chrome-devtools-mcp` で `http://localhost:4321/#particle` を開いて以下を確認：

- 背景は深ネイビー (`#05080e`)
- 上部: `VVB / 026 ●○●○● --:--:--`
- ヒーロー（中央寄せ）: 名前 / nameJa / @yoko / bio / 座標
- LINKS: 19個のタイル（アイコン + ラベル）
- OUTPUTS: 4件のタイムラインカード
- Footer: `vivibio / @yoko  © 2026 ∞ vivibio`
- スイッチャーで MINIMAL / GLITCH / PARTICLE 切替が機能

Canvas はまだ何も描かれないが、CSS の vignette + grain は機能していること。

- [ ] **Step 3: コミット**

```bash
git add src/pages/index.astro
git commit -m "feat(particle): index.astro に ParticleTheme パネルをマウント"
```

---

## Task 9: ParticleTheme — Canvas 基盤（lazy init / dpr / resize / rAF / visibility）

**Files:**
- Modify: `src/components/themes/ParticleTheme.astro`

このタスクでは Canvas を初期化する基盤と空ループまでを実装。次タスクから各レイヤーを順次足す。

- [ ] **Step 1: ファイル末尾に `<script>` ブロックを追加**

`src/components/themes/ParticleTheme.astro` の `</style>` の閉じタグの直後（ファイル末尾）に、以下の `<script>` ブロックを追加する：

```astro
<script>
  function initParticleEffects() {
    if ((window as any).__particleInited) return;
    (window as any).__particleInited = true;

    // ----- Clock + bracket signal -----
    const clockEl = document.querySelector<HTMLElement>('[data-particle-clock]');
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

    const bracket = document.querySelector<HTMLElement>('[data-particle-bracket]');
    if (bracket) {
      const dots = Array.from(bracket.querySelectorAll<HTMLElement>('span'));
      let bIdx = 0;
      setInterval(() => {
        dots.forEach((d, i) => d.classList.toggle('on', i === bIdx || i === (bIdx + 2) % 5 || i === (bIdx + 4) % 5));
        bIdx = (bIdx + 1) % 5;
      }, 500);
    }

    // ----- Canvas init -----
    const canvas = document.querySelector<HTMLCanvasElement>('.pa-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let w = 0;
    let h = 0;

    function resize() {
      if (!canvas || !ctx) return;
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    let raf = 0;
    let t = 0;
    function tick() {
      if (!ctx) return;
      t += 0.008;

      // 軽いトレイル効果のための半透明クリア
      ctx.fillStyle = 'rgba(5, 8, 14, 0.18)';
      ctx.fillRect(0, 0, w, h);

      // ここに後続のレイヤーを追加していく

      raf = requestAnimationFrame(tick);
    }

    const ro = new ResizeObserver(() => resize());
    ro.observe(canvas);

    resize();
    raf = requestAnimationFrame(tick);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else {
        raf = requestAnimationFrame(tick);
      }
    });
  }

  if (document.documentElement.dataset.theme === 'particle') {
    initParticleEffects();
  } else {
    const observer = new MutationObserver(() => {
      if (document.documentElement.dataset.theme === 'particle') {
        initParticleEffects();
        observer.disconnect();
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }
</script>
```

- [ ] **Step 2: ビルド確認**

Run: `npm run build`

Expected: ビルド成功。

`npm run dev` で `http://localhost:4321/#particle` を開いて確認：

- 時計が `HH:MM:SS` で動いている
- 上部のブラケットドットが 0.5秒ごとにシフトしている
- Canvas はまだ何も描いていないので画面は真っ暗（背景色のみ）
- コンソールエラー無し

- [ ] **Step 3: コミット**

```bash
git add src/components/themes/ParticleTheme.astro
git commit -m "feat(particle): canvas 基盤 (lazy init / clock / bracket / rAF / visibility) を実装"
```

---

## Task 10: ParticleTheme — Canvas Layer A: ネビュラ

**Files:**
- Modify: `src/components/themes/ParticleTheme.astro`

- [ ] **Step 1: tick 関数内にネビュラ描画ロジックを追加**

`src/components/themes/ParticleTheme.astro` の `<script>` 内、`function tick()` の中の **`// ここに後続のレイヤーを追加していく` コメント**を、以下のコードに置き換える：

```ts
      // ===== Layer A: Nebula =====
      // 2層のラジアルグラデーションで青紫＋紫マゼンタ。30秒周期で中心が動く。
      const nebulaT = t * 0.05;
      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      // 青紫 nebula
      const n1x = w * (0.5 + Math.cos(nebulaT) * 0.18);
      const n1y = h * (0.42 + Math.sin(nebulaT * 0.7) * 0.12);
      const g1 = ctx.createRadialGradient(n1x, n1y, 0, n1x, n1y, Math.max(w, h) * 0.5);
      g1.addColorStop(0, 'rgba(126, 200, 255, 0.10)');
      g1.addColorStop(0.4, 'rgba(90, 109, 255, 0.05)');
      g1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, w, h);

      // 紫マゼンタ nebula（薄め）
      const n2x = w * (0.5 + Math.cos(nebulaT * 0.6 + 1.7) * 0.22);
      const n2y = h * (0.5 + Math.sin(nebulaT * 0.9 + 0.8) * 0.16);
      const g2 = ctx.createRadialGradient(n2x, n2y, 0, n2x, n2y, Math.max(w, h) * 0.45);
      g2.addColorStop(0, 'rgba(164, 93, 255, 0.06)');
      g2.addColorStop(0.5, 'rgba(255, 93, 200, 0.03)');
      g2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, w, h);

      ctx.restore();

      // ここに後続のレイヤーを追加していく
```

- [ ] **Step 2: ビルドと目視確認**

Run: `npm run build`

Expected: ビルド成功。

`npm run dev` で `http://localhost:4321/#particle` を開いて：

- 画面中央付近にぼんやりとした青紫＋紫マゼンタのグラデーションが見える
- それがゆっくり位置を変える（1分くらい観察すると気付くレベル）
- コンソールエラー無し

- [ ] **Step 3: コミット**

```bash
git add src/components/themes/ParticleTheme.astro
git commit -m "feat(particle): canvas Layer A — 青紫＋紫マゼンタの脈動するネビュラ"
```

---

## Task 11: ParticleTheme — Canvas Layer B: 星のフィールド (twinkle)

**Files:**
- Modify: `src/components/themes/ParticleTheme.astro`

- [ ] **Step 1: 星配列の生成と spawn 関数を init スコープに追加**

`<script>` 内の `let raf = 0;` の **直前**（つまり `function resize()` の閉じカッコ `}` の直後）に以下を挿入する：

```ts
    type Star = { x: number; y: number; r: number; phase: number };
    const stars: Star[] = [];
    const STAR_COUNT = 100;

    function spawnStars() {
      stars.length = 0;
      for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 0.7 + 0.3,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }
```

- [ ] **Step 2: resize 後と ResizeObserver にも spawnStars を呼ぶように変更**

既存の：

```ts
    const ro = new ResizeObserver(() => resize());
    ro.observe(canvas);

    resize();
    raf = requestAnimationFrame(tick);
```

を、以下に置き換える：

```ts
    const ro = new ResizeObserver(() => {
      resize();
      spawnStars();
    });
    ro.observe(canvas);

    resize();
    spawnStars();
    raf = requestAnimationFrame(tick);
```

- [ ] **Step 3: tick 内、ネビュラの直後に Layer B を追加**

`function tick()` 内、Layer A の `// ここに後続のレイヤーを追加していく` コメントを、以下に置き換える：

```ts
      // ===== Layer B: Star field (twinkle) =====
      for (const s of stars) {
        const a = 0.3 + Math.sin(t * 1.2 + s.phase) * 0.4;
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, a)})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // ここに後続のレイヤーを追加していく
```

- [ ] **Step 4: ビルドと目視確認**

Run: `npm run build`

Expected: ビルド成功。

`npm run dev` で `http://localhost:4321/#particle` を開いて：

- ネビュラに加えて、画面全体に微小な白点（100個）がきらめいている
- 各点が周期的に明滅
- ウィンドウリサイズで星が再配置される
- コンソールエラー無し

- [ ] **Step 5: コミット**

```bash
git add src/components/themes/ParticleTheme.astro
git commit -m "feat(particle): canvas Layer B — twinkle する星のフィールド (100点)"
```

---

## Task 12: ParticleTheme — Canvas Layer C: コアパルスリング

**Files:**
- Modify: `src/components/themes/ParticleTheme.astro`

- [ ] **Step 1: tick 内に Layer C を追加**

`function tick()` 内、Layer B の直後の `// ここに後続のレイヤーを追加していく` コメントを、以下に置き換える：

```ts
      // ===== Layer C: Core pulse ring =====
      const cx = w / 2;
      const cy = h * 0.42;
      const pulse = 0.6 + Math.sin(t * 1.5) * 0.4;

      // 中央のグロー
      const coreG = ctx.createRadialGradient(cx, cy, 0, cx, cy, 180);
      coreG.addColorStop(0, `rgba(126, 200, 255, ${0.18 * pulse})`);
      coreG.addColorStop(0.5, 'rgba(90, 140, 220, 0.05)');
      coreG.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = coreG;
      ctx.fillRect(0, 0, w, h);

      // 内リング
      ctx.strokeStyle = `rgba(180, 220, 255, ${0.4 * pulse})`;
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.arc(cx, cy, 60 + pulse * 6, 0, Math.PI * 2);
      ctx.stroke();

      // 外リング
      ctx.strokeStyle = 'rgba(180, 220, 255, 0.15)';
      ctx.beginPath();
      ctx.arc(cx, cy, 100, 0, Math.PI * 2);
      ctx.stroke();

      // ここに後続のレイヤーを追加していく
```

- [ ] **Step 2: ビルドと目視確認**

Run: `npm run build`

`npm run dev` で `http://localhost:4321/#particle` を開いて：

- 画面中央少し上 (`h*0.42`) に2重のリングが描画されている
- リングが呼吸するように脈動（1.5 sin 周期）
- 中央に薄い青ハロー
- コンソールエラー無し

- [ ] **Step 3: コミット**

```bash
git add src/components/themes/ParticleTheme.astro
git commit -m "feat(particle): canvas Layer C — 中央コアの脈動2重リング"
```

---

## Task 13: ParticleTheme — Canvas Layer D: パーティクルフィールド (ドリフト + 重力)

**Files:**
- Modify: `src/components/themes/ParticleTheme.astro`

- [ ] **Step 1: パーティクル配列の生成を init スコープに追加**

`<script>` 内、stars 配列定義の直後に以下を挿入する：

```ts
    type Particle = { x: number; y: number; vx: number; vy: number; r: number; phase: number };
    const particles: Particle[] = [];

    function spawnParticles() {
      const n = Math.floor((w * h) / 14000);
      particles.length = 0;
      for (let i = 0; i < n; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.18,
          vy: (Math.random() - 0.5) * 0.18,
          r: Math.random() * 1.2 + 0.4,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }
```

- [ ] **Step 2: ResizeObserver と初期化で spawnParticles を呼ぶ**

既存の：

```ts
    const ro = new ResizeObserver(() => {
      resize();
      spawnStars();
    });
    ro.observe(canvas);

    resize();
    spawnStars();
    raf = requestAnimationFrame(tick);
```

を、以下に置き換える：

```ts
    const ro = new ResizeObserver(() => {
      resize();
      spawnStars();
      spawnParticles();
    });
    ro.observe(canvas);

    resize();
    spawnStars();
    spawnParticles();
    raf = requestAnimationFrame(tick);
```

- [ ] **Step 3: tick 内に Layer D を追加**

Layer C の直後の `// ここに後続のレイヤーを追加していく` コメントを、以下に置き換える：

```ts
      // ===== Layer D: Particle field (drift + gravity to core) =====
      for (const p of particles) {
        const dx = cx - p.x;
        const dy = cy - p.y;
        const d = Math.hypot(dx, dy) + 0.1;
        p.vx += (dx / d) * 0.0015;
        p.vy += (dy / d) * 0.0015;

        p.vx *= 0.97;
        p.vy *= 0.97;

        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x += w;
        if (p.x > w) p.x -= w;
        if (p.y < 0) p.y += h;
        if (p.y > h) p.y -= h;

        const a = 0.45 + Math.sin(t * 2 + p.phase) * 0.3;
        ctx.fillStyle = `rgba(200, 230, 255, ${Math.max(0, a)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // ここに後続のレイヤーを追加していく
```

- [ ] **Step 4: ビルドと目視確認**

Run: `npm run build`

`npm run dev` で `http://localhost:4321/#particle` を開いて：

- 画面全体に淡い青白い粒子が漂っている（個数は画面サイズに比例、1080×720 で約56個）
- 中央に向かって弱く吸い寄せられる動き
- 各粒子の輝度が脈動
- コンソールエラー無し

- [ ] **Step 5: コミット**

```bash
git add src/components/themes/ParticleTheme.astro
git commit -m "feat(particle): canvas Layer D — パーティクルフィールド (ドリフト + コア重力)"
```

---

## Task 14: ParticleTheme — Canvas Layer E: 接続線

**Files:**
- Modify: `src/components/themes/ParticleTheme.astro`

- [ ] **Step 1: tick 内に Layer E を追加**

Layer D の直後の `// ここに後続のレイヤーを追加していく` コメントを、以下に置き換える：

```ts
      // ===== Layer E: Connection lines =====
      ctx.lineWidth = 0.4;
      const LINK_DIST = 90;
      const LINK_DIST2 = LINK_DIST * LINK_DIST;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK_DIST2) {
            const a = 0.18 * (1 - Math.sqrt(d2) / LINK_DIST);
            ctx.strokeStyle = `rgba(120, 180, 240, ${a})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // ここに後続のレイヤーを追加していく
```

- [ ] **Step 2: ビルドと目視確認**

Run: `npm run build`

`npm run dev` で `http://localhost:4321/#particle` を開いて：

- 近接するパーティクル（90px 以内）が細い線で結ばれる
- 距離が近いほど線が濃く、遠いほど薄い
- 動きに追従して接続が変化
- コンソールエラー無し

- [ ] **Step 3: コミット**

```bash
git add src/components/themes/ParticleTheme.astro
git commit -m "feat(particle): canvas Layer E — パーティクル間の接続線"
```

---

## Task 15: ParticleTheme — Canvas Layer F: 星座コンステレーション

**Files:**
- Modify: `src/components/themes/ParticleTheme.astro`

8〜10秒ごとに3〜5個のパーティクルを「星座メンバー」に選び、線で繋いで一瞬表示してフェードアウト。

- [ ] **Step 1: 星座状態を init スコープに追加**

`<script>` 内、particles 配列定義の直後に以下を挿入する：

```ts
    type Constellation = {
      members: Particle[];
      // 0: idle, 1: drawing, 2: hold, 3: fading
      phase: 0 | 1 | 2 | 3;
      progress: number;  // フェーズ内 0..1
      nextAt: number;    // 次の発火時刻（t basis）
    };
    const constellation: Constellation = {
      members: [],
      phase: 0,
      progress: 0,
      nextAt: 3,  // 初回 3秒後
    };
    const CONST_DRAW = 1.5;   // 線描画にかける秒数
    const CONST_HOLD = 1.0;
    const CONST_FADE = 1.0;
```

- [ ] **Step 2: tick 内に Layer F を追加**

Layer E の直後の `// ここに後続のレイヤーを追加していく` コメントを、以下に置き換える：

```ts
      // ===== Layer F: Constellation =====
      // dt は1フレーム ~16.7ms ≒ 0.0167秒。t は 0.008/frame の論理時間なので、実時間換算が必要。
      // ここでは t を「秒の半分」と見なして扱いやすくする。
      const tSec = t / 0.008 / 60; // 概ね経過秒数

      if (constellation.phase === 0 && tSec >= constellation.nextAt) {
        // 選出: ランダムに3〜5個
        const memberCount = 3 + Math.floor(Math.random() * 3);
        const pool = particles.slice();
        for (let i = pool.length - 1; i > 0; i--) {
          const k = Math.floor(Math.random() * (i + 1));
          [pool[i], pool[k]] = [pool[k], pool[i]];
        }
        constellation.members = pool.slice(0, memberCount);
        constellation.phase = 1;
        constellation.progress = 0;
      }

      if (constellation.phase !== 0) {
        // 1 frame 進行を秒換算: rAF 60fps 仮定で 1/60秒
        constellation.progress += 1 / 60;
        const m = constellation.members;
        let alpha = 0;
        if (constellation.phase === 1) {
          // 線が伸びる: progress / CONST_DRAW で完成率
          const ratio = Math.min(1, constellation.progress / CONST_DRAW);
          alpha = 0.4 * ratio;
          if (constellation.progress >= CONST_DRAW) {
            constellation.phase = 2;
            constellation.progress = 0;
          }
        } else if (constellation.phase === 2) {
          alpha = 0.4;
          if (constellation.progress >= CONST_HOLD) {
            constellation.phase = 3;
            constellation.progress = 0;
          }
        } else if (constellation.phase === 3) {
          alpha = 0.4 * (1 - Math.min(1, constellation.progress / CONST_FADE));
          if (constellation.progress >= CONST_FADE) {
            constellation.phase = 0;
            constellation.members = [];
            constellation.nextAt = tSec + 8 + Math.random() * 2;
          }
        }

        if (alpha > 0 && m.length >= 2) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(m[0].x, m[0].y);
          // Layer F-描画範囲: phase=1 のとき progress 比に応じて部分的に伸ばす
          const drawRatio =
            constellation.phase === 1 ? Math.min(1, constellation.progress / CONST_DRAW) : 1;
          const segCount = m.length - 1;
          const drawnSegs = Math.floor(segCount * drawRatio);
          const partialT = segCount * drawRatio - drawnSegs;
          for (let i = 0; i < drawnSegs; i++) {
            ctx.lineTo(m[i + 1].x, m[i + 1].y);
          }
          if (drawnSegs < segCount && partialT > 0) {
            const a = m[drawnSegs];
            const b = m[drawnSegs + 1];
            ctx.lineTo(a.x + (b.x - a.x) * partialT, a.y + (b.y - a.y) * partialT);
          }
          ctx.stroke();

          // メンバー粒子を強調表示（白い大きな点）
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 1.4})`;
          for (const p of m) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r + 1.2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
```

- [ ] **Step 3: ビルドと目視確認**

Run: `npm run build`

`npm run dev` で `http://localhost:4321/#particle` を開いて：

- 約3秒後に最初の星座が出現（3〜5個のパーティクルが線で連結）
- 1.5秒で線が伸びる → 1秒キープ → 1秒でフェードアウト
- 完了後、約8〜10秒待つと次の星座が出現
- メンバー粒子が一瞬大きく光る
- コンソールエラー無し

- [ ] **Step 4: コミット**

```bash
git add src/components/themes/ParticleTheme.astro
git commit -m "feat(particle): canvas Layer F — 周期的に出現する星座コンステレーション"
```

---

## Task 16: ParticleTheme — マウス反発インタラクション

**Files:**
- Modify: `src/components/themes/ParticleTheme.astro`

- [ ] **Step 1: マウス座標トラッキングを init スコープに追加**

`<script>` 内、constellation 定義の直後に以下を挿入する：

```ts
    let mouse = { x: -9999, y: -9999, active: false };
    const MOUSE_REPEL_RADIUS = 100;
    const MOUSE_REPEL_FORCE = 0.4;

    const onMove = (e: MouseEvent | TouchEvent) => {
      const x = (e as TouchEvent).touches?.[0]?.clientX ?? (e as MouseEvent).clientX;
      const y = (e as TouchEvent).touches?.[0]?.clientY ?? (e as MouseEvent).clientY;
      if (typeof x === 'number' && typeof y === 'number') {
        mouse = { x, y, active: true };
      }
    };
    const onLeave = () => {
      mouse.active = false;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onLeave);
    window.addEventListener('mouseleave', onLeave);
```

- [ ] **Step 2: Layer D（パーティクル更新）にマウス反発を組み込む**

Layer D の中、`p.vx *= 0.97;` の **直前**に以下を挿入する：

```ts
        if (mouse.active) {
          const mdx = p.x - mouse.x;
          const mdy = p.y - mouse.y;
          const md = Math.hypot(mdx, mdy);
          if (md < MOUSE_REPEL_RADIUS && md > 0.1) {
            p.vx += (mdx / md) * MOUSE_REPEL_FORCE * (1 - md / MOUSE_REPEL_RADIUS);
            p.vy += (mdy / md) * MOUSE_REPEL_FORCE * (1 - md / MOUSE_REPEL_RADIUS);
          }
        }
```

これで Layer D のパーティクル更新ループは以下のような順になる：

```ts
        // 重力（コアへ）
        // マウス反発  ← 追加
        // 減衰
        // 速度上限なし（参照と同じ）
        // 積分
        // ラップ
        // 描画
```

- [ ] **Step 3: ビルドと目視確認**

Run: `npm run build`

`npm run dev` で `http://localhost:4321/#particle` を開いて：

- カーソルを Canvas 上で動かすと、近くの粒子（半径 100px）がカーソルから逃げるように散る
- カーソルから離れると重力に引かれてゆっくり中央に戻る
- カーソルが画面外に出ると（mouseleave）反発が止まる
- モバイルでもタッチで同様に動く
- コンソールエラー無し

- [ ] **Step 4: コミット**

```bash
git add src/components/themes/ParticleTheme.astro
git commit -m "feat(particle): マウス・タッチカーソルで近接パーティクルを反発"
```

---

## Task 17: 全体検証 + Lighthouse

**Files:** なし（検証のみ）

- [ ] **Step 1: クリーンビルド**

Run: `npm run build`

Expected: 0 errors / 0 warnings、`dist/` が生成される。

- [ ] **Step 2: 3テーマ間のスイッチ確認**

`npm run dev` 起動。`chrome-devtools-mcp` を使い：

1. `http://localhost:4321/` を開く → Minimal が表示、Footer に `vivibio / @yoko ●©2026`、Hero下に `@yoko`
2. 右端スイッチャーで GLITCH をクリック → URL が `#glitch` に、Glitch 表示、`gl-line` に `// @yoko · ...`、ASCII末尾に `vivibio / @yoko :: END_OF_TRANSMISSION ::`
3. 続いて PARTICLE をクリック → Particle 表示、Canvas アニメ動作、星座が周期的に出現
4. ブラウザリロード → 直前選択 (`particle`) が localStorage で復元
5. URL を `http://localhost:4321/#minimal` に手動変更 → Minimal に切替

すべてコンソールエラー無し。

- [ ] **Step 3: モバイルエミュレーション確認**

`chrome-devtools-mcp` の `emulate` で 390x844（iPhone 14）に切替：

- スイッチャーが画面右にスライドして表示
- スイッチャーをタップで全展開
- Particle テーマで横スクロールバーが出ない
- LINKS タイルが2列以上で並ぶ
- Canvas アニメが動く

- [ ] **Step 4: タブ非表示時の rAF 停止確認**

DevTools Performance パネルで rAF 動作を観察し：

- タブ非表示にすると CPU 使用が下がる（visibility で停止）
- 復帰で再開

- [ ] **Step 5: Lighthouse**

`chrome-devtools-mcp` の `lighthouse_audit` を `http://localhost:4321/#particle` に対して実行：

- Performance: 70+ 維持（参考: 既存 Glitch も Canvas 動作で多少落ちる）
- Accessibility: 90+ 維持
- 重大な warning が出ないこと

- [ ] **Step 6: 最終コミット（必要なら）**

検証で発見された軽微な調整があれば修正＆コミット。問題なければスキップ。

---

## Self-Review

仕様書 `docs/superpowers/specs/2026-04-27-vivibio-particle-theme-design.md` の各セクションを点検：

| 仕様セクション | 対応タスク |
|---|---|
| データ層変更 (handle: 'yoko') | Task 1 |
| Particle カラーパレット | Task 7（CSS）、Task 10-12（Canvas） |
| Particle タイポグラフィ | Task 7（CSS） |
| 上部バー（VVB / 026 + bracket + clock） | Task 7（HTML/CSS）、Task 9（script） |
| ヒーロー（中央寄せコンパクト + @yoko + coords） | Task 7 |
| LINKS（icon + label tile） | Task 7 |
| OUTPUTS（タイムライン縦カード） | Task 7 |
| Particle Footer | Task 7 |
| Canvas A: Nebula | Task 10 |
| Canvas B: Stars | Task 11 |
| Canvas C: Core Ring | Task 12 |
| Canvas D: Particles | Task 13 |
| Canvas E: Connections | Task 14 |
| Canvas F: Constellation | Task 15 |
| 装飾オーバーレイ（vignette + grain） | Task 7（CSS） |
| マウス反発（Q4-B） | Task 16 |
| ジャイロ反応 (out of scope) | 実装しない（仕様書範囲外） |
| ThemeSwitcher 拡張 + SVG | Task 6 |
| BaseLayout 修正 | Task 5 |
| index.astro マウント | Task 8 |
| Minimal Hero @yoko 行 | Task 3 |
| Minimal Footer 文言 | Task 2 |
| Glitch gl-line @yoko | Task 4 |
| Glitch ASCII フッター | Task 4 |
| パフォーマンス（lazy init / visibility） | Task 9 |
| 検証（build + chrome-devtools-mcp） | Task 17 |

カバレッジ問題なし ✓

placeholder スキャン: TBD/TODO 無し ✓
型一貫性: `Particle`, `Star`, `Constellation` 型は1ヶ所で定義し以後参照 ✓

---

## Notes

- 各タスクのコミットメッセージは既存リポジトリのスタイル（日本語ベース、`type(scope): 説明`）に揃える
- コミットは Co-Authored-By やツール名を含めない（ユーザー設定 CLAUDE.md 準拠）
- `npm run dev` で起動して chrome-devtools-mcp で検証する流れを各タスクの最終ステップとして必ず行う
- Canvas のレイヤー追加順は「背景→中景→前景→相互作用」となるよう設計されている
