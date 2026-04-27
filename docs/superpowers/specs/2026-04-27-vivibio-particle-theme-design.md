# vivibio – Particle テーマ追加 設計

_Date: 2026-04-27_

## 概要

`vivibio` に Particle テーマを追加する。既存の Minimal / Glitch と並ぶ第3のテーマで、深宇宙の観測室をモチーフとした静謐かつ宇宙的な演出が中心。

合わせて、全テーマ共通の体裁修正として PROFILE にハンドル `yoko` を追加し、名前部および Footer に反映する。

参照デザイン: `https://api.anthropic.com/v1/design/h/IBgqXcanyNAEqut5Ek1WzA?open_file=vivibio.html` （展開済み: `tmp/particle-ref/vivibio/project/theme-particles.jsx`）

## 動機

- 既存 Minimal は静、Glitch は派手・放送ノイズ。中間ゾーン（**動はあるが静謐**）が空いている。Particle で「深宇宙の観測者視点」を埋める。
- パーティクル＋星雲＋星座は、AI/AWS エンジニアとしての「データ・宇宙的スケール感」のメタファとして自然。
- 名刺としての配布チャネル（NFC, URL）には `#particle` ハッシュ指定で初回からそのテーマで開ける。

## アーキテクチャ

### ルーティング・テーマID

URL ハッシュベース。テーマID は単数命名で `particle` に統一（既存 `minimal`, `glitch` と揃える）。

| URL | 表示 |
|---|---|
| `/` または `/#minimal` | Minimal |
| `/#glitch` | Glitch |
| `/#particle` | Particle（新規） |

### ディレクトリ構成

```
src/
├── components/
│   ├── themes/
│   │   ├── MinimalTheme.astro       # 既存（Footer差替えのみ）
│   │   ├── GlitchTheme.astro        # 既存（ASCII末尾文言 + @yoko 追加）
│   │   └── ParticleTheme.astro      # 新規・自己完結
│   ├── ThemeSwitcher.astro          # 修正（particle 追加）
│   ├── Hero.astro                   # 修正（@yoko 追加）
│   ├── Footer.astro                 # 修正（vivibio / @yoko ●©）
│   ├── icons/LinkIcons.astro        # 既存（共有・無変更）
│   └── （他既存コンポーネント無変更）
├── data/profile.ts                  # 修正（handle: 'yoko' 追加）
├── layouts/BaseLayout.astro         # 修正（allowed 配列に particle 追加 + dark fallback color）
└── pages/index.astro                # 修正（ParticleTheme をマウント）
```

### CSS による表示切替

既存パターン踏襲：

```css
.theme-pane { display: none; }
:root[data-theme='minimal']  .theme-pane[data-theme='minimal']  { display: block; }
:root[data-theme='glitch']   .theme-pane[data-theme='glitch']   { display: block; }
:root[data-theme='particle'] .theme-pane[data-theme='particle'] { display: block; }
```

### 初期テーマ決定ロジック（BaseLayout の inline script）

`allowed` 配列に `'particle'` を追加するのみ。それ以外のロジックは既存のまま（hash → localStorage → `'minimal'`）。

```js
var allowed = ['minimal', 'glitch', 'particle'];
```

## データ層変更（profile.ts）

### PROFILE への handle 追加

```ts
export const PROFILE = {
  name: 'Naoki Yokomachi',
  nameJa: '横町 直樹',
  handle: 'yoko',                // 新規追加（共通ハンドル）
  title: 'Software Engineer / AI Engineer',
  location: 'Tokyo, Japan',
  bio: '...',
  bioJa: '...',
  currently: 'AWS / AI',
  avatarUrl: '...',
  githubId: 45911707,
} as const;
```

`handle: 'yoko'` は **共通ハンドル**として扱う。LINKS 各要素が持つ `handle`（例: GitHub `n-yokomachi`, Zenn `yokomachi`）とは別概念で、サイト全体のサインオフ・自己紹介用。LINKS への影響なし。

## Particle テーマ仕様

### カラーパレット

| 役割 | 値 |
|---|---|
| 背景ベース | `#05080e` |
| メインアクセント（コア・hover） | `#7ec8ff` |
| 文字主 | `#e2efff` |
| 文字副 | `rgba(180,220,255,0.55)` |
| ネビュラ層1（青→紫） | `#7ec8ff` → `#5a6dff` |
| ネビュラ層2（紫→マゼンタ・薄） | `#a45dff` → `#ff5dc8` |
| 星きらめき | `#ffffff`（α可変） |
| 区切り線 | `rgba(180,220,255,0.12)` |
| バッジ ARTICLE | `#7ec8ff` |
| バッジ TALK | `#e8d27a` |
| バッジ REPO | `#7adcb0` |
| バッジ SLIDE | `#d99cff` |

### タイポグラフィ

| 用途 | フォント | 設定 |
|---|---|---|
| 名前（hero） | Inter | weight 200, letter-spacing 0.14em, uppercase, text-shadow `0 0 18px rgba(126,200,255,.6)` |
| 本文 | Inter | weight 300〜400 |
| モノスペース（座標・時計・タグ） | JetBrains Mono | (既存読み込み済み) |

`Space Grotesk`は今回未使用（Glitchで読み込み済みなので追加読み込みなし）。

### セクション構成

参照のセクション構成に、オーナー要望（Q2-C, Q3-B, @yoko, Footer統一）を反映：

```
[上部バー]    VVB / 026   ●○●○●   23:14:07
[ヒーロー]    — signal received
              NAOKI YOKOMACHI   (glow + spaced)
              横町 直樹
              @ yoko             (青mono · 0.3em)
              bio (en) / bio (ja)
              35.6762°N · 139.6503°E · Software Engineer / AI Engineer
[LINKS]       — links                         [ 19 ]
              icon + label タイル grid（auto-fill minmax 150px, gap 8px）
[OUTPUTS]     — outputs                  2026.04.27
              縦タイムラインカード4枚（左に細い垂直ライン）
              ◦ MM.DD · [BADGE] :: title  /  subtitle
[Footer]      vivibio / @yoko          © 2026 ∞ vivibio
```

#### 上部バー（pa-top）
- 左: `VVB / 026` — モノスペース 10px、letter-spacing 0.3em
- 中央: 5つのドット（オン/オフ）。`setInterval(500)` で1つずつ右にシフト → 「信号受信中」感
- 右: `clock.toLocaleTimeString('en-GB', {hour12:false})`、1秒更新（既存 Glitch の clock パターン流用）

#### ヒーロー（pa-hero）
- `padding: 60px 0 40px` のコンパクト中央寄せ（**Q3-B**）。`flex: 1` は使わず通常フロー
- eyebrow `— signal received`
- `<h1>` に `PROFILE.name` を `text-transform: uppercase`・letter-spacing 広めで描画
- `nameJa`、`@ yoko`（青mono）の3段
- bio (en/ja) は `max-width: 32ch`
- 座標バー: `35.6762°N · 139.6503°E · {PROFILE.title}`（東京固定値はテンプレートリテラルで埋め込み）

#### LINKS（pa-rail + pa-links）
- ヘッダー `— links` ／ `[ 19 ]`
- グリッド: `repeat(auto-fill, minmax(150px, 1fr))`、`gap: 8px`、**他テーマと同様アイコン＋ラベル付き**（参照ではアイコンのみだったが、オーナー要望で変更）
- タイル: 角丸無し、`border: 1px solid rgba(180,220,255,.18)`、`background: rgba(5,8,14,.4)`、`backdrop-filter: blur(2px)`
- ラベル: 11px、letter-spacing 0.04em、テキスト省略 (`text-overflow: ellipsis`)
- ホバー: 青枠 `#7ec8ff` + `box-shadow: 0 0 16px rgba(126,200,255,.3), inset 0 0 16px rgba(126,200,255,.08)`

#### OUTPUTS（pa-rail + pa-outputs、**Q2-C**）
- ヘッダー `— outputs` ／ 今日の日付 (YYYY.MM.DD)
- 縦並び 4 件、外枠 `border-left: 1px solid rgba(180,220,255,.18)`、`padding-left: 16px` でタイムライン感
- 各 row 構造:
  ```
  ◦  26.04 · [ARTICLE] :: タイトル
              subtitle (Zenn 等)
  ```
- バッジ色: ARTICLE=青, TALK=黄, REPO=緑, SLIDE=マゼンタ（彩度を Glitch より下げてくすませる）
- ホバー: 行全体の文字色が `#7ec8ff` に、`◦` マーカーが glow

#### Footer（pa-foot）
- 左: `vivibio / @{PROFILE.handle}`
- 右: `© {currentYear} ∞ vivibio`
- 上に細い区切り線 `border-top: 1px solid rgba(180,220,255,.12)`

### Canvas エフェクトの構造

単一 `<canvas class="pa-canvas">` を `position: fixed; inset: 0; z-index: 0` で全画面背景。レイヤーは描画順で重ねる。

| レイヤー | 内容 |
|---|---|
| A. ネビュラ | 2つの大きな radialGradient を別中心で配置（青紫＋紫マゼンタ）。`globalCompositeOperation = 'screen'` で発光合成。中心位置を `Math.sin(t * 0.05)` で30秒周期にゆっくり移動。3フレーム毎に更新。 |
| B. 星のフィールド | 80〜120個の極小白点（`r: 0.3〜1.0`）。各星に `phase` を持たせ `alpha = 0.3 + Math.sin(t * 1.2 + phase) * 0.4` で twinkle。位置は固定。 |
| C. コアパルスリング | 中心 `(w/2, h*0.42)` に2重リング。内 `r = 60 + pulse * 6`、外 `r = 100`。`pulse = 0.6 + Math.sin(t * 1.5) * 0.4`。背後に青ハロー radialGradient。 |
| D. パーティクルフィールド | 個数 `Math.floor((w * h) / 14000)`。微速度ドリフト + コアへの弱い重力（係数 0.0015）。マウス反発（半径100px・force 0.4）。速度減衰 `* 0.97`。トロイダルラップ。色 `rgba(200, 230, 255, alpha)`。 |
| E. 接続線 | 距離 90px 以下のパーティクル間。alpha = `0.18 * (1 - d/90)`、色 `rgba(120, 180, 240, α)`、太さ 0.4px。 |
| F. 星座（新規） | 8〜10秒ごとに3〜5個のパーティクルを「星座メンバー」に選出。1.5秒で線描画 → 1秒キープ → 1秒フェードアウト。線色 `rgba(255, 255, 255, 0.4)`、太さ 0.5px。同時アクティブは1つ。 |

### 装飾オーバーレイ（CSS擬似要素）

| 役割 | 実装 |
|---|---|
| ビネット | `.pa::before` `radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,.5) 100%)`、`z-index: 1` |
| グレイン | `.pa::after` `radial-gradient(circle at 1px 1px, #fff 0.5px, transparent 1px)`、`background-size: 3px 3px`、`opacity: .12`、`mix-blend-mode: overlay`、`z-index: 1` |

### インタラクション

| 要素 | 挙動 |
|---|---|
| **マウス/タッチ反発（Q4-B）** | カーソル付近 100px 半径の粒子を半径方向に押し出す（force 0.4） |
| **ジャイロ反応** | **採用しない**（iOS の権限ダイアログ回避のため） |
| **クリック反応** | 特になし（リンクは通常のナビゲーション） |
| **タブ非表示時** | `requestAnimationFrame` 停止（visibilitychange） |

### 動的要素のスクリプト構造

`<script>` ブロックは Glitch と同じパターンで lazy init：
- `data-theme === 'particle'` のときのみ `initParticleEffects()` 実行
- `MutationObserver` で `data-theme` 属性を監視
- 一度初期化されたら `window.__particleInited = true` でガード

### パフォーマンス対策

- 接続線描画は O(N²) なので、N（パーティクル数）が `(w*h)/14000` で上限を効かせる（例: 1920×1080 で約148個）
- 星座メンバー選出時は既存のパーティクル参照を使う（追加配列なし）
- ネビュラ層は3フレームに1回だけ再描画（DPR + screen blend のコスト低減）
- `dpr = Math.min(2, devicePixelRatio)` で 3K以上のディスプレイでも 2倍までに抑える

## ThemeSwitcher 拡張

### 修正点（最小差分）

```ts
// ALLOWED 配列に追加
const ALLOWED = ['minimal', 'glitch', 'particle'] as const;

// themes 配列に追加
const themes = [
  { id: 'minimal',  label: 'MINIMAL'  },
  { id: 'glitch',   label: 'GLITCH'   },
  { id: 'particle', label: 'PARTICLE' },
];
```

### Particle 用 SVG アイコン (22x22)

中心の小ドット + 周囲を取り巻く2つの軌道点 + 微かな軌道線。コンパクトで、minimal/glitch アイコンと並べて1目で識別可能。

```html
<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
  <circle cx="12" cy="12" r="2" fill="#7ec8ff" />
  <circle cx="12" cy="12" r="7"   fill="none" stroke="#7ec8ff" stroke-opacity="0.4" stroke-width="0.6" />
  <circle cx="12" cy="12" r="10"  fill="none" stroke="#7ec8ff" stroke-opacity="0.25" stroke-width="0.4" />
  <circle cx="19" cy="12" r="1.4" fill="#e2efff" />
  <circle cx="6.5" cy="15" r="1"  fill="#e2efff" opacity="0.7" />
</svg>
```

### スイッチャーボタンのアクティブ枠色

```css
:root[data-theme='particle'] .ts-btn[aria-current='true'] {
  border-color: #7ec8ff;
  box-shadow: -4px 0 16px rgba(126, 200, 255, 0.25);
}
```

## BaseLayout 修正

### inline script の `allowed` 配列

```js
var allowed = ['minimal', 'glitch', 'particle'];
```

### グローバル CSS（テーマ別 body）

```css
:root[data-theme='particle'] body {
  background: #05080e;
  color: #e2efff;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}
```

`theme-color` メタは Minimal の `#f7f6f3` のままにする（テーマ切替時に動的に変える対応はしない）。

## 既存テーマへの波及

### profile.ts に `handle: 'yoko'` を追加

すべてのテーマで `PROFILE.handle` を参照可能に。

### Hero.astro（Minimal）への @yoko 追加

既存の `mn-name` の下に新規行：

```astro
<p class="mn-handle">@{PROFILE.handle}</p>
```

スタイル: 11px、`JetBrains Mono`、`color: rgba(26,26,26,0.5)`、letter-spacing 0.14em、`margin-top: 6px`。

### Footer.astro（Minimal）の文言変更

```astro
<footer class="mn-foot">
  <span class="brand mn-mono">vivibio / @{PROFILE.handle}</span>
  <span class="mn-acc" aria-hidden="true">●</span>
  <span class="mn-mono">©{year}</span>
</footer>
```

`brand` のフォントウェイトはそのまま、左の文字列だけ拡張。

### GlitchTheme.astro

#### 名前部の下のラインに `@yoko` を埋め込み

既存:
```
// software engineer / ai engineer · tokyo, japan
```

変更後:
```
// @yoko · software engineer / ai engineer · tokyo, japan
```

実装: `gl-line` の中身を以下に：
```astro
<div class="gl-mono gl-line">
  // @{PROFILE.handle} · {PROFILE.title.toLowerCase()} · {PROFILE.location.toLowerCase()}
</div>
```

#### ASCII フッターの末尾に Footer 文言を追加

既存:
```
╳━━━━━━━━━━━━━━━━━━━━━━━━━━━━╳
   END_OF_TRANSMISSION  ::  026
╳━━━━━━━━━━━━━━━━━━━━━━━━━━━━╳
```

変更後（同じ ASCII 枠内に追記、サイバー感維持）:
```
╳━━━━━━━━━━━━━━━━━━━━━━━━━━━━╳
   vivibio / @yoko :: END_OF_TRANSMISSION :: 026
╳━━━━━━━━━━━━━━━━━━━━━━━━━━━━╳
```

実装: `pre.gl-ascii` の中身を更新。`@yoko` は `PROFILE.handle` 経由で埋め込む。

## index.astro の構成

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

## DRY 維持の保証

- `profile.ts` への変更は `handle` フィールド1個のみ。LINKS / OUTPUTS データの構造は無変更
- すべてのテーマが同じ `PROFILE`, `LINKS`, `OUTPUTS` を import
- `LinkIcons.astro` を共有
- 共有ハンドルは `PROFILE.handle` 1ヶ所で管理（散在させない）

## テスト・検証手順

1. `npm run build` 成功確認（型・構文エラー無し）
2. `npm run dev` 起動 → `chrome-devtools-mcp` で確認:
   - `localhost:4321/` → Minimal、Footer に `vivibio / @yoko ●©` 表示、Hero下に `@yoko` 表示
   - `localhost:4321/#particle` → Particle 表示、Canvas動作、星座が周期的に出現、マウス反発、コア脈動
   - `localhost:4321/#glitch` → Glitch、name直下のラインに `@yoko` 含む、ASCII末尾に `vivibio / @yoko ::` 含む
   - スイッチャー操作で3テーマ間を双方向切替（hash + localStorage 永続）
   - モバイル emulation（390x844）でタップ展開・3ボタン全て表示
   - コンソールエラー無し
3. ハッシュ手動変更（`#particle` ↔ `#minimal`）で反応すること
4. ページリロード後にlocalStorage が効いて選択テーマが維持されること
5. Particle で長時間放置 → メモリリーク無く滑らか（rAF + visibility 連動 OK）
6. Lighthouse: Performance/Accessibility 大幅悪化なし

## 範囲外（Out of Scope）

- 4つ目以降のテーマ追加
- ジャイロ反応（DeviceOrientation 権限取得回避のため）
- LINKSの並び順や追加サービス
- OUTPUTS データの拡張
- テーマ間トランジションアニメーション（瞬時切替で OK）
- `theme-color` メタタグのテーマ別動的更新
- アニメーション設定 UI（Tweaks パネル）
- ParticleのCanvasをWebGL化（2D Canvasで十分）

## オープンクエスチョン（実装中に判断）

- Particle のパーティクル数 `(w*h)/14000` がモバイル端末で重い場合、係数を `18000` 以上に下げる
- 星座のメンバー選出が「コアに近すぎる」と密集して醜い場合、距離閾値を入れて分散させる
- Glitch の ASCII 内文字列が長すぎて折り返しが起きる場合、ASCII 罫線の長さを伸ばす（`╳━━` を増やす）か、フォントサイズを 9px に下げる
