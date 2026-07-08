# Eye Gate 入口画面 + Void テーマ 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 元動画から実測抽出した目のアスキーアート入口画面（毎回表示・波アニメーション完全再生・瞳がカーソル追従・enter で入場）と第5テーマ「void」を追加し、ThemeTutorial を廃止、SEO 用 JSON-LD を導入する。

**Architecture:** 入口はテーマ機構から独立した全画面固定オーバーレイ（`EyeGate.astro`）。目は canvas にブレイル文字格子（文字14×30px・ドット3×3px）でデバイスピクセル等倍描画し、`public/eye-gate-data.json`（動画実測データ）をステップ時刻駆動で再生する。新テーマ void は既存のテーマペイン機構（`data-theme` 切替）の5つ目として追加。既存のハッシュ切替・localStorage 保存は温存し、初期テーマ判定のみ `hash > 'void'` に変更する。

**Tech Stack:** Astro 5 / TypeScript / vanilla DOM（ライブラリ追加なし）/ Canvas 2D + requestAnimationFrame

**Spec:** `docs/superpowers/specs/2026-07-07-eye-gate-void-theme-design.md`

## Global Constraints

- テストフレームワークは導入されていない。各タスクの検証は `npm run build` と dev サーバー（`npm run dev`、http://localhost:4321）で行う
- アクセントカラーは CSS 変数 `--void-accent: #ff4d9e`。BaseLayout の `:root` で定義し、void テーマと EyeGate（enter ボタン hover）で共有する。瞳・グレーの色は動画実測値（`rgb(238,96,195)` / `rgb(76,76,76)`）のハードコードで、変数を参照しない
- `public/eye-gate-data.json` のスキーマ・数値（ステップ数214等）は変更しない。再生成する場合は spec の抽出パイプラインに従う
- `<title>` は「Vivibio - yoko's Profile」のまま変更しない（SEO ワードを title に入れない）
- コミットメッセージは既存リポジトリの流儀 `type(scope): 日本語要約`。AI ツール名・モデル名の帰属表記（Co-Authored-By 等）は一切入れない

---

### Task 1: 再生データ `public/eye-gate-data.json` を追加

**Files:**
- Create: `public/eye-gate-data.json`

**Interfaces:**
- Consumes: なし（元動画からの抽出パイプラインで生成済みの成果物。生成方法は spec「アートデータの作成」参照）
- Produces: EyeGate（Task 4）が `fetch('/eye-gate-data.json')` で読む JSON。スキーマ:
  - `nr` / `nc`: グリッド行数 103 / 列数 110
  - `master`: 全期間で点灯するグレーセル一覧 `"x,y;x,y;..."`（4093 セル）
  - `init`: 先頭ステップの点灯ビット列（master と同順の `0`/`1`）
  - `steps`: `"<表示時間ms b36>.<XORデルタ(masterインデックス b36, カンマ区切り)>|..."` × 214 ステップ。
    先頭ステップのデルタは「最終→先頭」のラップ差分
  - `states`: 視線状態 6 種 `[{dy, dx, cells: "x,y;..."}]`（rest 座標系の静的パターン）
  - `hole`: 瞳クリップ用の穴 `"y:l-r,l-r;..."`（行ごとインターバル）
  - `blink`: `"stepIdx:env;..."`（瞬きエンベロープ、記載なしは 1.0）
  - `holeMid`: 瞬きの潰し中心行（58.0）

- [x] **Step 1: データファイルの存在と整合を確認する**

生成済みの `public/eye-gate-data.json`（約303KB、gzip 約138KB）がリポジトリ作業ツリーに置かれている。
次で健全性を確認する:

```bash
python3 - << 'EOF'
import json
d = json.load(open('public/eye-gate-data.json'))
assert d['nr'] == 103 and d['nc'] == 110
assert len(d['master'].split(';')) == 4093
assert len(d['steps'].split('|')) == 214
assert len(d['states']) == 6
print('ok:', len(d['init']), 'bits,', len(d['blink'].split(';')), 'blink entries')
EOF
```

Expected: `ok: 4093 bits, 40 blink entries`

- [x] **Step 2: コミット**

```bash
git add public/eye-gate-data.json
git commit -m "feat(eye-gate): 元動画から実測抽出した再生データを追加"
```

### Task 2: VoidTheme を作成しテーマ機構へ統合

**Files:**
- Create: `src/components/themes/VoidTheme.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/components/ThemeSwitcher.astro`

**Interfaces:**
- Consumes: `src/data/profile.ts` の `PROFILE` / `LINKS` / `OUTPUTS`（既存。変更しない）
- Produces: テーマ id `'void'`（`data-theme="void"` のペイン、ThemeSwitcher の選択肢、初期テーマ）。CSS 変数 `--void-accent`（Task 4 の EyeGate が参照）

- [x] **Step 1: VoidTheme コンポーネントを作成する**

`src/components/themes/VoidTheme.astro` を以下の内容で作成する:

```astro
---
import { PROFILE, LINKS, OUTPUTS } from '../../data/profile';

const CATEGORY_ORDER = ['code', 'writing', 'talks', 'social', 'creds', 'design', 'self', 'contact'];
const sortedLinks = [...LINKS].sort(
  (a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category)
);
---

<div class="void">
  <header class="vd-head">
    <h1 class="vd-name">
      <span class="vd-prompt" aria-hidden="true">&gt;</span>
      {PROFILE.name} ({PROFILE.handle}) — {PROFILE.title}
    </h1>
    <p class="vd-bio">{PROFILE.bio}</p>
  </header>

  <section aria-label="links">
    <h2 class="vd-rule">-- links --------------------------------</h2>
    <ul class="vd-list">
      {
        sortedLinks.map((l) => (
          <li>
            <a class="vd-row vd-lrow" href={l.url} target="_blank" rel="noopener noreferrer">
              <span class="vd-cat">{l.category}</span>
              <span class="vd-label">{l.label}</span>
              <span class="vd-handle">{l.handle}</span>
            </a>
          </li>
        ))
      }
    </ul>
  </section>

  <section aria-label="outputs">
    <h2 class="vd-rule">-- outputs ------------------------------</h2>
    <ul class="vd-list">
      {
        OUTPUTS.map((o) => (
          <li>
            <a class="vd-row vd-orow" href={o.url} target="_blank" rel="noopener noreferrer">
              <span class="vd-cat">{o.badge}</span>
              <span class="vd-title">{o.title}</span>
            </a>
          </li>
        ))
      }
    </ul>
  </section>

  <footer class="vd-status">
    <span class="vd-dot" aria-hidden="true"></span>
    <span>tokyo, japan</span>
  </footer>
</div>

<style>
  .void {
    max-width: 640px;
    margin: 0 auto;
    padding: 72px 20px 56px;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 12px;
    line-height: 1.9;
    color: #9a9a9a;
  }
  .vd-head {
    margin-bottom: 40px;
  }
  .vd-name {
    margin: 0 0 12px;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: #eee;
  }
  .vd-prompt {
    color: var(--void-accent);
  }
  .vd-bio {
    margin: 0;
    max-width: 52ch;
  }
  .vd-rule {
    margin: 36px 0 10px;
    font-size: 11px;
    font-weight: 400;
    letter-spacing: 0.08em;
    color: #555;
    white-space: nowrap;
    overflow: hidden;
  }
  .vd-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .vd-row {
    display: grid;
    grid-template-columns: 9ch 14ch 1fr;
    gap: 0 16px;
    padding: 1px 0;
    text-decoration: none;
    color: #9a9a9a;
    transition: color 0.15s ease;
  }
  .vd-orow {
    grid-template-columns: 9ch 1fr;
  }
  .vd-cat {
    color: #555;
    transition: color 0.15s ease;
  }
  .vd-handle,
  .vd-title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .vd-row:hover,
  .vd-row:focus-visible,
  .vd-row:hover .vd-cat,
  .vd-row:focus-visible .vd-cat {
    color: var(--void-accent);
  }
  .vd-status {
    margin-top: 48px;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #555;
    font-size: 11px;
  }
  .vd-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #3adb76;
    box-shadow: 0 0 6px rgba(58, 219, 118, 0.8);
  }
  @media (max-width: 520px) {
    .vd-lrow {
      grid-template-columns: 13ch 1fr;
    }
    .vd-lrow .vd-cat {
      display: none;
    }
  }
</style>
```

- [x] **Step 2: index.astro に void ペインを追加する**

`src/pages/index.astro` の import 群に追加:

```astro
import VoidTheme from '../components/themes/VoidTheme.astro';
```

`<BaseLayout>` 直下、minimal ペインの**前**に追加:

```astro
  <main class="theme-pane" data-theme="void">
    <VoidTheme />
  </main>
```

- [x] **Step 3: BaseLayout を void 対応にする**

`src/layouts/BaseLayout.astro` に対して以下 5 箇所を変更する。

(1) `theme-color` メタを黒に:

```html
<meta name="theme-color" content="#000000" />
```

(2) head 内のインラインスクリプト（初期テーマ判定）を差し替え。localStorage 参照を廃止し、`hash > 'void'` に:

```html
<script is:inline>
  (function () {
    try {
      var hash = location.hash.slice(1);
      var allowed = ['void', 'minimal', 'glitch', 'particle', 'concrete'];
      document.documentElement.dataset.theme = allowed.indexOf(hash) >= 0 ? hash : 'void';
    } catch (e) {
      document.documentElement.dataset.theme = 'void';
    }
  })();
</script>
```

(3) head の末尾（`</head>` の直前）に JS 無効時のフォールバックを追加。JS が無いと `data-theme` が付かず全ペインが不可視になるため、void ペインだけ強制表示する:

```html
<noscript>
  <style>
    .theme-pane[data-theme='void'] {
      position: relative;
      height: auto;
      overflow: visible;
      opacity: 1;
      visibility: visible;
    }
  </style>
</noscript>
```

(4) グローバルスタイルのフォールバック body（テーマ属性が付く前の初期描画）をダークに変更し、`--void-accent` と void テーマの body スタイルを追加。既存の

```css
      /* Fallback before data-theme attribute is set (no-JS / pre-script paint) */
      body {
        background: #f7f6f3;
        color: #1a1a1a;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
      }
```

を次に差し替える:

```css
      :root {
        --void-accent: #ff4d9e;
      }
      /* Fallback before data-theme attribute is set (no-JS / pre-script paint).
         The entry gate paints black first, so the fallback is dark. */
      body {
        background: #000;
        color: #9a9a9a;
        font-family: 'JetBrains Mono', ui-monospace, monospace;
      }
      :root[data-theme='void'] body {
        background: #000;
        color: #9a9a9a;
        font-family: 'JetBrains Mono', ui-monospace, monospace;
      }
```

(5) アクティブペインのセレクタリスト（`.theme-pane` の表示ルール）の先頭に void の行を追加:

```css
      :root[data-theme='void'] .theme-pane[data-theme='void'],
      :root[data-theme='minimal'] .theme-pane[data-theme='minimal'],
```

- [x] **Step 4: ThemeSwitcher に VOID を追加する**

`src/components/ThemeSwitcher.astro` に対して以下 6 箇所を変更する。

(1) frontmatter の themes 配列の先頭に追加:

```js
const themes = [
  { id: 'void', label: 'VOID' },
  { id: 'minimal', label: 'MINIMAL' },
  ...
```

(2) アイコン群の先頭（`{t.id === 'minimal' && (` の前）に目のアイコンを追加:

```jsx
{t.id === 'void' && (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
    <path d="M2.5 12C5 7.5 8.5 5.5 12 5.5s7 2 9.5 6.5c-2.5 4.5-6 6.5-9.5 6.5S5 16.5 2.5 12Z" />
    <circle cx="12" cy="12" r="2.6" fill="#ff4d9e" stroke="none" />
  </svg>
)}
```

(3) ボタンの初期 aria-current を void 基準に変更:

```jsx
<button class="ts-btn" data-theme-target={t.id} aria-current={t.id === 'void' ? 'true' : 'false'}>
```

(4) アクティブ時のボーダー色 CSS を追加（既存の glitch 用ルールの前に）:

```css
  :root[data-theme='void'] .ts-btn[aria-current='true'] {
    border-color: #ff4d9e;
    box-shadow: -4px 0 16px rgba(255, 77, 158, 0.25);
  }
```

(5) script の ALLOWED に void を追加:

```ts
const ALLOWED = ['void', 'minimal', 'glitch', 'particle', 'concrete'] as const;
```

(6) script 内の初期化フォールバックを `'minimal'` から `'void'` に変更:

```ts
const initial = isAllowed(root.dataset.theme ?? null) ? (root.dataset.theme as ThemeId) : 'void';
```

- [x] **Step 5: ビルドと表示を検証する**

Run: `npm run build`
Expected: exit 0

Run: `npm run dev` をバックグラウンドで起動し、

```bash
curl -s http://localhost:4321/ | grep -c 'data-theme="void"'
```

Expected: `1`（void ペイン）

ブラウザで http://localhost:4321/ を開き確認:
- 黒背景に `> Naoki Yokomachi (yoko) — Software Engineer / AI Engineer` と bio、links 20件、outputs 4件、緑ドットの `tokyo, japan` が表示される
- リンク行 hover で行全体がピンク `#ff4d9e` になる
- 右端 ThemeSwitcher に VOID（目のアイコン）が先頭で表示され、既存4テーマと相互に切替できる
- テーマを glitch に切り替えてからリロード → void に戻る（保存テーマを初期判定に使わない）
- http://localhost:4321/#glitch を開く → glitch が表示される（ハッシュ優先）

- [x] **Step 6: コミット**

```bash
git add src/components/themes/VoidTheme.astro src/pages/index.astro src/layouts/BaseLayout.astro src/components/ThemeSwitcher.astro
git commit -m "feat(theme): 黒背景ターミナル風の void テーマを追加し既定テーマに設定"
```

---

### Task 3: ThemeTutorial を廃止

**Files:**
- Delete: `src/components/ThemeTutorial.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/components/ThemeSwitcher.astro`

**Interfaces:**
- Consumes: なし
- Produces: なし（削除のみ。`window.vivibioApplyTheme` フックも消える — 参照元は ThemeTutorial だけなので安全）

- [x] **Step 1: index.astro から参照を除去する**

`src/pages/index.astro` から次の2行を削除:

```astro
import ThemeTutorial from '../components/ThemeTutorial.astro';
```

```astro
  <ThemeTutorial />
```

- [x] **Step 2: ThemeSwitcher からチュートリアル用フックを除去する**

`src/components/ThemeSwitcher.astro` の script 内から次のブロック（コメント含む）を削除:

```ts
  // Expose applyTheme so the first-visit tutorial (ThemeTutorial.astro) can
  // settle on the target theme and update aria-current + localStorage in one go.
  ;(window as unknown as { vivibioApplyTheme?: (t: ThemeId) => void }).vivibioApplyTheme = (t) => {
    if (isAllowed(t)) applyTheme(t);
  };
```

- [x] **Step 3: コンポーネントを削除する**

```bash
git rm src/components/ThemeTutorial.astro
```

- [x] **Step 4: 参照が残っていないことを確認しビルドする**

```bash
grep -ri 'ThemeTutorial\|vivibioApplyTheme' src/ ; echo "grep exit: $?"
```

Expected: 出力なし、`grep exit: 1`

Run: `npm run build`
Expected: exit 0

- [x] **Step 5: コミット**

```bash
git add src/pages/index.astro src/components/ThemeSwitcher.astro
git commit -m "refactor(theme): 初回テーマツアー(ThemeTutorial)を廃止"
```

---

### Task 4: EyeGate（canvas 再生エンジン）

**Files:**
- Create: `src/components/EyeGate.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `public/eye-gate-data.json`（Task 1）、CSS 変数 `--void-accent`（Task 2、enter ボタンの hover 色のみ）
- Produces: 全画面オーバーレイ `#eye-gate`。enter で自身をフェードアウトして本体（void テーマ）を露出する。他タスクから参照される API はない

実装はプレビュー v69（検証済み: グレー再生セルと元動画の照合で偽陽性ゼロ、間隙構造・色・瞬き同期・視線状態を機械照合済み）をそのまま移植する。挙動の意味は spec「EyeGate の設計」を参照。

- [x] **Step 1: EyeGate コンポーネントを作成する**

`src/components/EyeGate.astro` を以下の内容で作成する（コード一式）:

```astro
<div class="gate" id="eye-gate" role="dialog" aria-modal="true" aria-label="entrance">
  <canvas id="eye-canvas" aria-hidden="true"></canvas>
  <button class="gate-enter" id="gate-enter" type="button" aria-label="enter to yoko's portfolio">[ enter to yoko's portfolio ]</button>
</div>
<noscript><style>#eye-gate { display: none; }</style></noscript>

<style>
  .gate {
    position: fixed;
    inset: 0;
    z-index: 300;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    background: #000;
    transition: opacity 0.5s ease;
  }
  .gate.leaving {
    opacity: 0;
    pointer-events: none;
  }
  .gate.gone {
    display: none;
  }
  #eye-canvas {
    display: block;
  }
  .gate-enter {
    margin-top: 36px;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 13px;
    letter-spacing: 0.18em;
    color: #777;
    background: none;
    border: none;
    padding: 8px 20px;
    cursor: pointer;
    transition: color 0.2s ease;
  }
  .gate-enter:hover,
  .gate-enter:focus-visible {
    color: var(--void-accent);
  }
  .gate-enter:focus-visible {
    outline: 1px solid var(--void-accent);
    outline-offset: 4px;
  }
  .gate-enter:focus:not(:focus-visible) {
    outline: none;
  }
</style>

<script>
  // Eye Gate: 元動画(https://x.com/mathdroid/status/2074130147935219713)から
  // 実測抽出した再生データによる入口演出。
  //  - 格子: ブレイル文字セル14x30px(2x4ドット、ドット3x3px)をデバイスピクセル等倍描画
  //  - 周囲: ネイティブVFRステップ再生(表示時間は実測、100ms上限)
  //  - 瞳: 視線状態パターンのモーフ + カーソル追従 + 再生同期瞬き
  const gate = document.getElementById('eye-gate');
  const canvas = document.getElementById('eye-canvas');
  const enterBtn = document.getElementById('gate-enter');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const prevOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';

  let left = false;
  let rafId = 0;

  function leave() {
    if (left) return;
    left = true;
    cancelAnimationFrame(rafId);
    document.body.style.overflow = prevOverflow;
    if (reduced) {
      gate.classList.add('gone');
      return;
    }
    gate.classList.add('leaving');
    gate.addEventListener('transitionend', () => gate.classList.add('gone'), { once: true });
  }
  enterBtn.addEventListener('click', leave);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !left) leave();
  });

  fetch('/eye-gate-data.json')
    .then((res) => res.json())
    .then((data) => { if (!left) initEye(data); })
    .catch(() => { /* データ取得失敗時もゲート自体(enter)は機能する */ });

  function initEye(data) {
    const NR = data.nr, NC = data.nc;
    // 実測格子(動画ネイティブ = dpr2相当): 文字セル14x30px, セル内 x{0,5.5} y{0,5.65,11.3,16.95}, ドット3px。
    // 見かけのサイズをモニターの dpr に依らず一定(CSSで文字セル7x15px)に保つため、
    // dpr に応じて整数スケールした格子で描画する。
    let CW = 14, CH = 30, SUBX = [0, 5], SUBY = [0, 6, 11, 17];
    let PADX = 14, PADY = 16, DOT = 3;
    const HOLE_MID = data.holeMid;
    const PINK = 'rgb(238,96,195)';
    const GRAY = 'rgb(76,76,76)';
    const RX_L = -12, RX_R = 10, RY_U = -6, RY_D = 7;
    const REST_DY = -2;

    function hash01(a, b) {
      const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453123;
      return s - Math.floor(s);
    }

    const master = data.master.split(';').map((s) => s.split(',').map(Number));
    const state = new Uint8Array(master.length);
    for (let i = 0; i < master.length; i++) state[i] = data.init.charCodeAt(i) - 48;
    const stepDur = [], stepDelta = [];
    for (const part of data.steps.split('|')) {
      const di = part.indexOf('.');
      stepDur.push(Math.min(parseInt(part.slice(0, di), 36), 100));
      const body = part.slice(di + 1);
      stepDelta.push(body ? body.split(',').map((v) => parseInt(v, 36)) : []);
    }
    const NF = stepDur.length;
    const stepEnd = [];
    { let acc = 0; for (const du of stepDur) { acc += du; stepEnd.push(acc); } }
    const LOOP_MS = stepEnd[NF - 1];

    const STATES = data.states.map((s) => ({
      dy: s.dy, dx: s.dx,
      keys: s.cells.split(';').map((c) => {
        const [x, y] = c.split(',').map(Number);
        return y * 256 + x;
      }),
    }));

    const HOLE = {};
    for (const seg of data.hole.split(';')) {
      const [y, runs] = seg.split(':');
      HOLE[+y] = runs.split(',').map((r) => r.split('-').map(Number));
    }
    function inHole(x, y) {
      const runs = HOLE[y];
      if (!runs) return false;
      for (const [a, b] of runs) if (x >= a && x <= b) return true;
      return false;
    }

    const BLINK_ENV = new Array(NF).fill(1);
    for (const seg of data.blink.split(';')) {
      const [f, v] = seg.split(':');
      BLINK_ENV[+f] = +v;
    }

    let pupilKey = '';
    let pupilList = [];
    const ctx = canvas.getContext('2d');
    const bx = (k) => PADX + CW * ((k + 1) >> 1) + SUBX[(k + 1) & 1];
    const by = (n) => PADY + CH * (((n + 1) / 4) | 0) + SUBY[(n + 1) % 4];
    let W0 = 0, H0 = 0, OFFX = 0, OFFY = 0;
    let xpx = (k) => bx(k);
    let ypx = (n) => by(n);
    function computeLayout() {
      // dpr2 実測値を基準に、dpr に比例した整数格子を組む(常にドット単位でクリスプ)
      const sc = (window.devicePixelRatio || 1) / 2;
      CW = Math.max(4, Math.round(14 * sc));
      CH = Math.max(8, Math.round(30 * sc));
      SUBX = [0, Math.round(5.5 * sc)];
      SUBY = [0, Math.round(5.65 * sc), Math.round(11.3 * sc), Math.round(16.95 * sc)];
      DOT = Math.max(1, Math.round(3 * sc));
      PADX = CW; PADY = Math.round(CH / 2);
      // アートをキャンバス中心に揃えるオフセット。
      // 右側の羽根はセルも点灯頻度も疎な非対称形のため、知覚上の中心として
      // 全セル等重みの重心(質量中心と外接矩形中心の中間)を使う。
      let minY = 1e9, maxY = -1e9, sumX = 0;
      for (const [x, y] of master) {
        minY = Math.min(minY, y); maxY = Math.max(maxY, y);
        sumX += bx(x) + DOT / 2;
      }
      W0 = bx(NC - 1) + DOT + PADX;
      H0 = by(NR - 1) + DOT + PADY;
      OFFX = Math.round(W0 / 2 - sumX / master.length);
      OFFY = Math.round(H0 / 2 - (by(minY) + by(maxY) + DOT) / 2);
      xpx = (k) => bx(k) + OFFX;
      ypx = (n) => by(n) + OFFY;
    }
    function resizeCanvas() {
      const dpr = window.devicePixelRatio || 1;
      computeLayout();
      pupilKey = '';
      canvas.width = W0;
      canvas.height = H0;
      const cssW = W0 / dpr, cssH = H0 / dpr;
      const f = Math.min(1, window.innerWidth * 0.96 / cssW, window.innerHeight * 0.88 / cssH);
      canvas.style.width = (cssW * f) + 'px';
      canvas.style.height = (cssH * f) + 'px';
    }
    window.addEventListener('resize', resizeCanvas);

    let tx = 0.5, ty = 0.5, cx = 0.5, cy = 0.5;
    let lastInput = -Infinity;
    let frameIdx = 0;
    const t0 = performance.now();

    function onPoint(e) {
      tx = e.clientX / window.innerWidth;
      ty = e.clientY / window.innerHeight;
      lastInput = performance.now();
    }

    function drawPupil(loopFrame) {
      const r = canvas.getBoundingClientRect();
      const ecx = (r.left + r.right) / 2 / window.innerWidth;
      const ecy = (r.top + r.bottom) / 2 / window.innerHeight;
      let gx = (cx - ecx) * 2;
      let gy = (cy - ecy) * 2;
      gx = Math.max(-1, Math.min(1, gx));
      gy = Math.max(-1, Math.min(1, gy));
      const sx = gx < 0 ? -gx * RX_L : gx * RX_R;
      const sy = gy < 0 ? -gy * RY_U : gy * RY_D;
      const ds = STATES.map((st) => ({ st, d: (st.dx - sx) ** 2 + (st.dy - sy) ** 2 }));
      ds.sort((a, b) => a.d - b.d);
      const near = ds.slice(0, 3);
      let wsum = 0;
      for (const n of near) { n.w = Math.exp(-n.d / 20); wsum += n.w; }
      const vote = new Map();
      for (const n of near) {
        const w = n.w / wsum;
        for (const key of n.st.keys) {
          vote.set(key, (vote.get(key) || 0) + w);
        }
      }
      const ox = Math.round(sx), oy = Math.round(sy) + REST_DY;
      const env = BLINK_ENV[loopFrame];
      if (env <= 0.02) return;
      const key0 = ox + ',' + oy + ',' + Math.round(sx * 4) + ',' + Math.round(sy * 4) + ',' + env;
      if (key0 !== pupilKey) {
        pupilKey = key0;
        pupilList = [];
        for (const [key, v] of vote) {
          if (v < 0.35 + 0.4 * hash01((key % 256) * 1.7 + 0.3, (key >> 8) * 2.3 + 5.1)) continue;
          const x = key % 256, y = (key / 256) | 0;
          const ax = x + ox;
          let ay = y + oy;
          if (env < 1) ay = Math.round(HOLE_MID + (ay - HOLE_MID) * env);
          if (!inHole(ax, ay)) continue;
          pupilList.push(xpx(ax), ypx(ay));
        }
      }
      ctx.fillStyle = PINK;
      for (let i = 0; i < pupilList.length; i += 2) {
        ctx.fillRect(pupilList[i], pupilList[i + 1], DOT, DOT);
      }
    }

    function drawGray() {
      ctx.fillStyle = GRAY;
      for (let i = 0; i < master.length; i++) {
        if (!state[i]) continue;
        ctx.fillRect(xpx(master[i][0]), ypx(master[i][1]), DOT, DOT);
      }
    }

    function draw(now) {
      if (left) return;
      const loopT = (now - t0) % LOOP_MS;
      let target = 0;
      while (target < NF - 1 && stepEnd[target] <= loopT) target++;
      let guard = 0;
      while (frameIdx !== target && guard++ <= NF) {
        frameIdx = (frameIdx + 1) % NF;
        for (const i of stepDelta[frameIdx]) state[i] ^= 1;
      }

      if (performance.now() - lastInput > 4000) {
        const r0 = canvas.getBoundingClientRect();
        tx = (r0.left + r0.right) / 2 / window.innerWidth + 0.28 * Math.sin(now / 3600);
        ty = (r0.top + r0.bottom) / 2 / window.innerHeight + 0.22 * Math.sin(now / 5100 + 1.2);
      }
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawPupil(frameIdx);
      drawGray();
      rafId = requestAnimationFrame(draw);
    }

    resizeCanvas();
    if (reduced) {
      const r = canvas.getBoundingClientRect();
      cx = (r.left + r.right) / 2 / window.innerWidth;
      cy = (r.top + r.bottom) / 2 / window.innerHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawPupil(0);
      drawGray();
      return;
    }
    window.addEventListener('pointermove', onPoint, { passive: true });
    window.addEventListener('pointerdown', onPoint, { passive: true });
    rafId = requestAnimationFrame(draw);
  }
</script>
```

- [x] **Step 2: index.astro に組み込む**

`src/pages/index.astro` の frontmatter に import を追加し、`<main>`（テーマペイン群）の直前に配置する:

```astro
import EyeGate from '../components/EyeGate.astro';
```

```astro
<EyeGate />
```

- [x] **Step 3: ビルド確認**

Run: `npm run build`
Expected: エラーなし

- [x] **Step 4: コミット**

```bash
git add src/components/EyeGate.astro src/pages/index.astro
git commit -m "feat(eye-gate): 動画実測再生の入口画面を追加"
```

### Task 5: EyeGate 実機検証

**Files:** なし（検証のみ）

- [x] **Step 1: dev サーバーで基本動作を確認する**

Run: `npm run dev` → http://localhost:4321

確認項目:
- 黒背景に目のアートが表示され、波アニメーションが途切れなく流れる（100ms超の停止がない）
- ドットが 3×3px でシャープに描画される（にじみ・融合がない）。2ドット列ごとの縦間隙・4ドット行ごとの横間隙が見える
- カーソル移動で瞳が追従し、方向によって瞳の模様（リングと黒中心）が変わる
- 約9.5秒ループ内で2回、グレーの瞼が閉じるのと同時にピンクの瞳が潰れて消える（瞬き）
- ゲート表示中は本体がスクロールしない

- [x] **Step 2: enter 遷移を確認する**

- `[ enter ]` クリック / Enter キーで 0.5s フェードアウト → void テーマ本体
- 遷移後にスクロールが復帰し、rAF が停止している（Performance パネルで CPU が落ち着くこと）

- [x] **Step 3: reduced-motion とフォールバックを確認する**

- DevTools → Rendering → prefers-reduced-motion: reduce で静止画 + enter のみになる
- DevTools → Network タブで eye-gate-data.json をブロックしてリロード → 黒背景 + enter だけでも入場できる

### Task 6: SEO（JSON-LD Person + meta description）

**Files:**
- Modify: `src/layouts/BaseLayout.astro`

**Interfaces:**
- Consumes: `src/data/profile.ts` の `PROFILE` / `LINKS`
- Produces: `<script type="application/ld+json">`（schema.org Person）、強化された meta description。`<title>` は変更しない

- [x] **Step 1: frontmatter を更新する**

`src/layouts/BaseLayout.astro` の frontmatter を以下に差し替える（title の既定値は変更しない）:

```astro
---
import { PROFILE, LINKS } from '../data/profile';

interface Props {
  title?: string;
  description?: string;
}

const {
  title = "Vivibio - yoko's Profile",
  description = 'vivibio — digital business card of Naoki Yokomachi (横町直樹 / yoko / _cityside / yokomachi), Software Engineer / AI Engineer based in Tokyo, Japan.',
} = Astro.props;

// SEO: schema.org Person（検索エンジン向けの不可視データ。
// 対象ワード naoki yokomachi / 横町直樹 / yoko / _cityside / yokomachi をここで担う）
const SAME_AS_IDS = ['github', 'x', 'huggingface', 'zenn', 'qiita', 'devto', 'speakerdeck', 'linkedin', 'note'];
const personJsonLd = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: PROFILE.name,
  alternateName: ['横町直樹', '横町 直樹', 'yoko', 'yokomachi', '_cityside'],
  jobTitle: PROFILE.title,
  url: Astro.site?.href ?? 'https://vivibio.pages.dev',
  sameAs: LINKS.filter((l) => SAME_AS_IDS.includes(l.id)).map((l) => l.url),
});
---
```

- [x] **Step 2: head に JSON-LD を追加する**

`<meta name="twitter:card" content="summary" />` の直後に追加:

```astro
    <script type="application/ld+json" set:html={personJsonLd} />
```

- [x] **Step 3: 検証する**

Run: `npm run build`
Expected: exit 0

```bash
python3 - <<'EOF'
import re, json
html = open('dist/index.html', encoding='utf-8').read()
m = re.search(r'<script type="application/ld\+json">(.*?)</script>', html, re.S)
assert m, 'JSON-LD not found'
data = json.loads(m.group(1))
assert data['@type'] == 'Person'
assert data['name'] == 'Naoki Yokomachi'
for alt in ['横町直樹', '横町 直樹', 'yoko', 'yokomachi', '_cityside']:
    assert alt in data['alternateName'], alt
assert len(data['sameAs']) == 9
print('JSON-LD OK')
assert '_cityside / yokomachi' in html, 'meta description not updated'
# Astro は式内の ' を &#39; にエスケープすることがあるため正規表現で照合する
assert re.search(r"<title>Vivibio - yoko(?:'|&#39;)s Profile</title>", html), 'title must stay clean'
print('meta OK')
EOF
```

Expected: `JSON-LD OK` と `meta OK`

- [x] **Step 4: コミット**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "feat(seo): schema.org Person の JSON-LD と description を強化"
```

---

### Task 7: 総合検証

**Files:**
- なし（回帰が見つかった場合のみ修正してコミット）

**Interfaces:**
- Consumes: Task 1〜6 の成果すべて
- Produces: 検証済みの完成状態

- [x] **Step 1: クリーンビルド**

Run: `npm run build`
Expected: exit 0、エラー・警告なし

- [x] **Step 2: スペックの検証計画を全項目確認する**

dev サーバーを起動し、ブラウザで以下をすべて確認する:

1. `/` アクセス → ゲート表示 → 再生 + 瞳追従 → enter → void テーマ着地
2. ゲート表示中スクロール不可、enter 後スクロール可
3. `/#glitch` → enter 後 glitch に着地
4. ThemeSwitcher で void ⇔ 既存4テーマを往復（切替アニメーション正常、void の VOID ボタンがアクティブ表示になる）
5. テーマ切替後にリロード → 再びゲート → enter → void（保存テーマに引きずられない）
6. モバイルエミュレーション（縦画面・タッチ）: アートが画面内に収まる、視線が泳ぐ、タップで視線が向く、void テーマの行レイアウトが崩れない
7. prefers-reduced-motion: reduce → ゲートは静止画 + enter のみ、フェードなし即時切替
8. コンソールにエラーが出ていない

- [x] **Step 3: 問題があれば修正してコミット、なければ完了**

修正した場合:

```bash
git add -A
git commit -m "fix(gate): 総合検証で見つかった問題を修正"
```
