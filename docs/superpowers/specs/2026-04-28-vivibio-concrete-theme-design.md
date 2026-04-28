# vivibio – Concrete テーマ追加 設計

_Date: 2026-04-28_

## 概要

`vivibio` に Concrete テーマを追加する。既存の Minimal / Glitch / Particle と並ぶ第4のテーマ。
モチーフは「**安藤忠雄ポスター × 建築図面 × 漆喰／コンクリート壁**」。
暖色のプラスター紙面に、ヘアラインの幾何（ルーラー・コンパス円弧・グリッド・寸法線）と
極大の condensed タイトルタイプを重ね、大胆な余白でアーキテクト・ポスター調を構成する。

参照デザイン: `https://api.anthropic.com/v1/design/h/WBX9WJ9HeIW6pud6SXn2Ow?open_file=vivibio.html`
（展開済み: `tmp/concrete-design/vivibio/project/theme-concrete.jsx`）

## 動機

- 既存3テーマは「ライト平滑（Minimal）」「ダーク放送ノイズ（Glitch）」「ダーク宇宙（Particle）」と
  すべて低彩度・現代的だが、**ライトかつ重厚・触感のある紙質**ゾーンが空いている。
  Concrete で「アーキテクト／プロダクト誌の表紙」感を埋める。
- ヘアライン幾何 × 余白 × 大型タイポは、ポートフォリオではなく**人そのものへのリンク集**という
  vivibio のコンセプトと相性がよい（情報密度より態度を伝える）。
- NFC で開いた瞬間に印象が残る、紙の名刺的な静謐さ。

## アーキテクチャ

### ルーティング・テーマID

URL ハッシュベース。テーマID は単数命名で `concrete`。

| URL | 表示 |
|---|---|
| `/` または `/#minimal` | Minimal |
| `/#glitch` | Glitch |
| `/#particle` | Particle |
| `/#concrete` | Concrete（新規） |

### ディレクトリ構成

```
src/
├── components/
│   ├── themes/
│   │   ├── MinimalTheme.astro       # 既存・無変更
│   │   ├── GlitchTheme.astro        # 既存・無変更
│   │   ├── ParticleTheme.astro      # 既存・無変更
│   │   └── ConcreteTheme.astro      # 新規・自己完結
│   ├── ThemeSwitcher.astro          # 修正（concrete 追加 + SVG）
│   ├── icons/LinkIcons.astro        # 既存・共有
│   └── （他既存コンポーネント無変更）
├── data/profile.ts                  # 修正（LinkItem に category 追加）
├── layouts/BaseLayout.astro         # 修正（allowed・body color・Caveat フォント追加）
└── pages/index.astro                # 修正（ConcreteTheme をマウント）
```

`Hero.astro` / `Links.astro` / `Output.astro` / `Footer.astro` / `TopBar.astro` は他テーマで使用中だが、
`ConcreteTheme.astro` は **scoped CSS で完全自己完結**しこれらを使わない（既存テーマと同じパターン）。

### CSS による表示切替

既存パターン踏襲：

```css
.theme-pane { display: none; }
:root[data-theme='minimal']  .theme-pane[data-theme='minimal']  { display: block; }
:root[data-theme='glitch']   .theme-pane[data-theme='glitch']   { display: block; }
:root[data-theme='particle'] .theme-pane[data-theme='particle'] { display: block; }
:root[data-theme='concrete'] .theme-pane[data-theme='concrete'] { display: block; }
```

### 初期テーマ決定ロジック（BaseLayout の inline script）

`allowed` 配列に `'concrete'` を追加するのみ。それ以外のロジックは既存のまま。

```js
var allowed = ['minimal', 'glitch', 'particle', 'concrete'];
```

## データ層変更（profile.ts）

### LinkItem に `category` を必須追加

```ts
export type LinkItem = {
  id: string;
  label: string;
  handle: string;
  url: string;
  category: 'code' | 'social' | 'writing' | 'talks' | 'creds' | 'design' | 'self' | 'contact';
};
```

19件のリンクに以下のカテゴリを付与する：

| # | id | category | 根拠 |
|---|---|---|---|
| 1 | github | code | コードホスティング |
| 2 | x | social | SNS |
| 3 | huggingface | code | AI/ML モデル・コードのホスト |
| 4 | zenn | writing | 技術ブログ |
| 5 | qiita | writing | 技術ブログ |
| 6 | devto | writing | 技術ブログ |
| 7 | speakerdeck | talks | 登壇スライド |
| 8 | linkedin | social | ビジネスSNS |
| 9 | credly | creds | 認定バッジ |
| 10 | lapras | creds | エンジニアスキル可視化 |
| 11 | connpass | talks | 勉強会プラットフォーム |
| 12 | figma | design | デザインツール |
| 13 | 16p | self | 性格診断 |
| 14 | duolingo | self | 語学学習 |
| 15 | bukulog | self | 読書ログ |
| 16 | filmarks | self | 映画ログ |
| 17 | discord | social | コミュニケーション |
| 18 | atcoder | code | 競技プログラミング |
| 19 | email | contact | 連絡先 |

`category` は Concrete テーマでのみ表示するが、TypeScript の型定義は全テーマ共通。
他テーマの実装には**参照箇所を追加しない**（既存テーマは無変更を維持）。

`PROFILE` への新フィールド追加は**行わない**（`status` / `pronouns` / `avatarInitials` 等は使わず
既存フィールドのみで構成する設計）。

## Concrete テーマ仕様

### カラーパレット

| 役割 | 値 |
|---|---|
| paper（漆喰ベース） | `#e8e2d6` |
| paper-2（深め漆喰） | `#ddd5c5` |
| concrete（暖色コンクリ） | `#b6ad9e` |
| concrete-2（風化コンクリ） | `#8b8273` |
| ink（墨黒・本文） | `#1a1815` |
| ink-soft（淡墨・副次テキスト） | `#4a463f` |
| rule（罫線） | `#2a2620` |
| rust（差し色・錆鉄） | `#8a3a1f` |
| shadow | `rgba(40,32,20,.14)` |

### タイポグラフィ

| 用途 | フォント | 設定 |
|---|---|---|
| 名前（hero h1） | Inter | weight 200, font-stretch 75%, letter-spacing -0.04em, uppercase, `clamp(56px,14vw,168px)` |
| 本文 | Inter | weight 400 |
| モノスペース（座標・寸法・ラベル） | JetBrains Mono | 既存読み込み済 |
| 手書き紙片メモ | **Caveat**（新規） | Google Fonts に追加読み込み |

#### Caveat フォント追加

`BaseLayout.astro` の `<link href="https://fonts.googleapis.com/css2?...">` に `&family=Caveat:wght@400;500` を追記。

### セクション構成（vivibio データ適応版）

参照デザインからの変更点：
- 参照の最終 LEGEND（NOW セクション）を **OUTPUTS に差し替え**（C-C' 断面）
- TITLE BLOCK の STATUS 行を**削除**（PROJ./DRWG./LOC. の3行のみ）
- Footer の DRAWN BY を **`@yoko`**（`PROFILE.handle`）に
- 各 PLAN room の `ja`（和訳行）を**省略**

```
[CROP MARKS] (4隅 fixed)
[VERTICAL RULER] 左端 24px幅 SVG目盛り
[HORIZONTAL RULER] 下端 24px高さ SVG目盛り
[SIDE LABEL]    SHEET A-101 · PROFILE PLAN · SCALE 1:50 · YYYY.MM.DD（左端縦書き）
[SCRAPS]        s1 / s2 / s3 ベージュ紙片3枚（後述）
[FORM-TIE DOTS] 8列×3段の金属止め金ドット
[CONSTRUCTION LINES] SVG 大コンパス円弧3重・放射線・三角構成・錆色角度マーク

──────── stage (max-width: 1100px) ────────

[TITLE BLOCK]
  左:  PROJ.  yoko
       DRWG.  PROFILE / NFC
       LOC.   Tokyo, Japan
  右:  A-101
       2026.04.28 · 12:34
       REV. 02 / 04
[NORTH ARROW] 右上絶対配置のコンパス SVG

[HERO]          A · ELEVATION · 立面 ────────────────
                NAOKI YOKOMACHI                        ← PROFILE.name uppercase
                横町 直樹                              ← PROFILE.nameJa
                Software Engineer / AI Engineer · I work across stacks…
                  └─ accent部 (rust下線) + 残り bio
                ◉ POURED 2026.04.28  · CONCRETE · CAST IN PLACE · CLASS C30/37

[CUT A-A']      ◯A───────── SECTION A — A' ─────────A'◯

[SECTION B]     ◯B  PLAN · 平面図 · LINKS  ─────────  19 ROOMS
[DIM LINE]      ├──2400──┼──2400──┼──2400──┼──2400──┤  (装飾)

[PLAN GRID]     19件のリンクを4列グリッド（≤720px は2列）の "部屋" 配置
                各 room (152px min-height):
                  ┌─[hatch]─────────────────────┐
                  │ [coord A1·01 ─────]         │
                  │                             │
                  │ GitHub                      │ ← l.label
                  │                             │
                  │ [code           ◉Icon]      │ ← l.category + LinkIcons
                  │ 12.0 m²        [door-swing] │ ← 装飾面積 + 1/4円弧
                  └─────────────────────────────┘
                hover: 背景 ink / 文字 paper / hatch・swing が薄く濃化

[SCALE BAR]     SCALE  ▮▯▮▯▮▯  0—5m  ……  1:50

[CUT B-B']      ◯B───────── SECTION B — B' ─────────B'◯

[SECTION C]     ◯C  INDEX · 索引 · OUTPUTS  ──────────  NOW

[OUTPUT GRID]   4件を2列グリッド（≤720px は1列）= 2×2 配置
                参照 LEGEND の `repeat(3,1fr)` ではなく `repeat(2,1fr)` にして 4件で過不足なし
                各 cell:
                  ┌─────────────────┐
                  │ ▣ ARTICLE       │  ← lbl: badge名 (mono)
                  │ Strands Agents…│  ← val: title
                  │ Zenn            │  ← subtitle
                  └─────────────────┘
                cell hover: 文字色を ink から rust に微変化（リンクとして機能）

[FOOTER]        左: VIVIBIO · NFC PROFILE · @yoko
                    MATERIAL: PLASTER + CONCRETE / 漆喰・コンクリート
                    FINISH: BOARD-FORMED, BRUSHED
                右: SHEET A-101
                    OF 04
                    DRAWN BY @yoko          ← PROFILE.handle
                    HH:MM · UTC+09          ← runtime 1分更新

[HOVER READOUT] 画面下中央 fixed の黒プラーク
                ■ GitHub · n-yokomachi    → https://github.com/n-yokomachi
                room hover/touch 時のみ opacity:1
```

### 装飾紙片3枚（cc-scrap）

ベージュ `#d4cab2`、Caveat フォントの錆色手書きメモ、上下にマスキングテープ片、torn-edge clip-path。
`pointer-events: none` で操作を奪わない。

| # | ヘッダー | 図番 | 手書きメモ | 配置 |
|---|---|---|---|---|
| s1 | `FACADE — NORTH` | `SK-04 / 1:50` | `check void above / opening — verify / head height 2100` | left:-6%, top:200px, rotate(-6deg) |
| s2 | **`ROOF — PLAN`** | **`A-205 / rev. 01`** | **`parapet 600 / slope 1:50 ok? / drain at NE corner`** | right:-5%, top:680px, rotate(4deg) |
| s3 | `STAIR — SECTION` | `SK-11 / 1:20` | `14 risers ok? / 180 × 260 typ. / handrail @ 850` | left:-3%, top:1300px, rotate(-3deg) |

s2 は参照の `STUDY PLAN` から差し替え（FACADE=外/縦、STAIR=内/縦に対し ROOF=上/水平でバランス）。
モバイル `≤720px` では幅・高さを縮小し位置も微調整（参照の media query 値を踏襲）。

### 背景レイヤー（CSS / SVG のみ。canvas 不使用）

| z-index | レイヤー | 実装 |
|---|---|---|
| 0 | `.cc-surface` plaster | radial-gradient 2層（上左明・下右暗） + linear-gradient（暖色プラスター） |
| 1 | `.cc-noise` grain | SVG `feTurbulence` 2層、`mix-blend-mode: multiply`, opacity .55 |
| 1 | `.cc-grid` engineer | linear-gradient 8px細目 + 40px主線、楕円 mask で中央以外フェード |
| 1 | `.cc-seam` pour seam | 38%/62% の水平 1px 線 |
| 1 | `.cc-ties` form-tie dots | 8列×3段の 5px ドット（金属止め金感の inset shadow） |
| 2 | `.cc-construct` | SVG 大コンパス円弧3重 (cx=720,cy=380) ・放射線4本・大円弧2本・三角構成・錆色角度マーク |
| 3 | `.cc-ruler` (左) | SVG 目盛り 90tick (5tick毎に主目盛 + 数値) |
| 3 | `.cc-ruler-h` (下) | SVG 目盛り 50tick |
| 5 | `.cc-stage` | コンテンツ本体、max-width 1100px |
| 6 | `.cc-crop` (4隅) | fixed 18px SVG カットマーク |
| 80 | `.cc-readout` | hover時のみ表示するフローティングプラーク |

### インタラクション

| 要素 | 挙動 | 実装 |
|---|---|---|
| マウス視差 | `mousemove` でカーソル位置に応じて `cc-surface` を `translate(±6px) scale(1.06)` | `pointermove` リスナーで CSS 変数 `--par-x/--par-y` を更新、CSS で `transform: translate(calc(var(--par-x)*-1), ...)` |
| iOS DeviceOrientation | **不採用**（権限ダイアログ回避、Particle 同様） | — |
| room hover | `cc-room` を `background:ink / color:paper` に反転、`hatch` `swing` `area` を強調 | CSS のみ（`:hover` / `:focus-visible`） |
| OUTPUT cell hover | 文字色を `ink → rust` に変化 | CSS のみ |
| hover readout | room hover/touchstart 時に下部プラークが `opacity:0→1` で出現、現在のリンク label/handle/url を表示 | JS で hover 状態を管理し `.cc-readout` の `data-link-*` 属性 + `.on` クラスを付与 |
| 時計表示 | TITLE BLOCK・FOOTER の `HH:MM` を 1分間隔で更新、POURED 日付・SIDE LABEL 日付は表示時点で固定 | 軽量 `setInterval(60_000)` |

### 動的要素のスクリプト構造

`<script>` ブロックは Glitch / Particle と同じ lazy init パターン：

- `data-theme === 'concrete'` のときのみ `initConcreteEffects()` を実行
- `MutationObserver` で `data-theme` 属性変更を監視
- 一度初期化したら `window.__concreteInited = true` でガード
- `visibilitychange` で必要に応じてリスナー停止（マウス視差は CPU 負荷小なので継続でも可）

スクリプトが行うこと：
1. clock 文字列の埋め込み（TITLE BLOCK 右、FOOTER 右、SIDE LABEL）
2. `cc-room` の hover/touchstart リスナーを設定し `cc-readout` を更新
3. `pointermove` リスナーで `cc-surface` の CSS 変数を更新

### パフォーマンス対策

- canvas / requestAnimationFrame は使わない（紙質の静的表現が主旨）
- マウス視差は CSS transform のみで GPU レイヤ化、JS は変数更新だけ
- SVG は viewBox + preserveAspectRatio で1度だけパース。グリッドは linear-gradient のため軽量
- `will-change` は使わず、視差移動も transition: .4s ease-out で滑らかに

## ThemeSwitcher 拡張

### 修正点（最小差分）

```ts
// ALLOWED 配列に追加
const ALLOWED = ['minimal', 'glitch', 'particle', 'concrete'] as const;

// themes 配列に追加
const themes = [
  { id: 'minimal',  label: 'MINIMAL'  },
  { id: 'glitch',   label: 'GLITCH'   },
  { id: 'particle', label: 'PARTICLE' },
  { id: 'concrete', label: 'CONCRETE' },
];
```

### Concrete 用 SVG アイコン (22×22)

建築コンパス：外円・内円・十字・中心点。墨色 `#1a1815` のヘアライン。

```html
<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
  <circle cx="12" cy="12" r="9" fill="none" stroke="#1a1815" stroke-width="1" />
  <circle cx="12" cy="12" r="5" fill="none" stroke="#1a1815" stroke-width="0.7" stroke-dasharray="1.5 2" />
  <line x1="12" y1="2.5" x2="12" y2="21.5" stroke="#1a1815" stroke-width="0.7" />
  <line x1="2.5" y1="12" x2="21.5" y2="12" stroke="#1a1815" stroke-width="0.7" />
  <circle cx="12" cy="12" r="1.4" fill="#1a1815" />
</svg>
```

### スイッチャーボタンのアクティブ枠色

```css
:root[data-theme='concrete'] .ts-btn[aria-current='true'] {
  border-color: #1a1815;
  box-shadow: -4px 0 16px rgba(40, 30, 15, 0.25);
}
```

スイッチャー本体（`background: rgba(20,20,28,.85)` のダーク）はテーマ別に変えない。
Concrete のページ上でも視認性は十分（ペーパー上にダーク半透明）。

## BaseLayout 修正

### inline script の `allowed` 配列

```js
var allowed = ['minimal', 'glitch', 'particle', 'concrete'];
```

### グローバル CSS（テーマ別 body）

```css
:root[data-theme='concrete'] body {
  background: #e8e2d6;
  color: #1a1815;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
}
```

### Caveat フォント追加

```html
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&family=Space+Grotesk:wght@400;500;700;900&family=Caveat:wght@400;500&display=swap"
  rel="stylesheet"
/>
```

`Caveat` は Concrete の紙片メモ専用。Concrete 以外のテーマでは使われないが、CSS の `@font-face` を
すべてのテーマで読み込む（テーマ切替後の遅延を避ける）。Caveat 1ウェイト×2変種なので追加コストは小。

### theme-color メタ

`#f7f6f3`（Minimal の値）のまま据え置き。テーマ別動的更新は範囲外。

## index.astro の構成

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
  <main class="theme-pane" data-theme="minimal"><MinimalTheme /></main>
  <main class="theme-pane" data-theme="glitch"><GlitchTheme /></main>
  <main class="theme-pane" data-theme="particle"><ParticleTheme /></main>
  <main class="theme-pane" data-theme="concrete"><ConcreteTheme /></main>
  <ThemeSwitcher />
</BaseLayout>
```

## DRY 維持の保証

- `profile.ts` への変更は `LinkItem.category` フィールド1個のみ。`PROFILE` / `OUTPUTS` の構造は無変更
- すべてのテーマが同じ `PROFILE` / `LINKS` / `OUTPUTS` を import
- `LinkIcons.astro` を共有（既存パターン踏襲）
- Concrete テーマは scoped CSS ですべての見た目を完結（既存テーマと同じ自己完結方針）
- 既存テーマ（Minimal/Glitch/Particle）コードは**1行も触らない**

## テスト・検証手順

1. `npm run build` 成功確認（型・構文エラー無し）
2. `npm run dev` 起動 → ブラウザで確認:
   - `localhost:4321/` → Minimal（既存通り）
   - `localhost:4321/#concrete` → Concrete 表示、TITLE BLOCK・HERO・PLAN(LINKS)・OUTPUTS・FOOTER 全て描画
   - PLAN の19件すべて表示、各 room の category 表示が正しい（Q3 表通り）
   - room hover で背景反転、hover readout 出現
   - OUTPUT cell hover で文字色変化、リンク機能
   - 紙片3枚（FACADE/ROOF/STAIR）が異なる回転角・テープ付きで表示
   - 4隅 crop marks、左ルーラー、下ルーラー、コンパス円弧、グリッド全て表示
   - マウス移動でプラスター層が微妙に視差（±6px）
   - 時計が runtime で1分ごとに更新
   - スイッチャー操作で4テーマ間を双方向切替（hash + localStorage 永続）
   - スイッチャーアクティブ枠が Concrete のとき墨色 `#1a1815`
3. モバイル emulation（390×844）で:
   - PLAN グリッドが2列
   - OUTPUT が1列
   - 紙片3枚のサイズが縮小されている
   - スイッチャータップ展開・4ボタン全て表示
4. ハッシュ手動変更（`#concrete` ↔ `#minimal`）で反応すること
5. ページリロード後にlocalStorage が効いて選択テーマが維持されること
6. コンソールエラー無し
7. Lighthouse: Performance/Accessibility 大幅悪化なし

## 範囲外（Out of Scope）

- 5つ目以降のテーマ追加
- DeviceOrientation（ジャイロ）連動
- LINKSの並び順や追加サービス
- OUTPUTS データの拡張（ja, date 等の追加フィールド）
- PROFILE への新フィールド追加（status, pronouns, avatarInitials など）
- LinkItem への ja 追加（category のみ追加）
- テーマ間トランジションアニメーション（瞬時切替で OK）
- `theme-color` メタタグのテーマ別動的更新
- アニメーション設定 UI（Tweaks パネル）
- 紙片のドラッグ・移動などの物理演算
- canvas / WebGL ベースのアニメーション

## オープンクエスチョン（実装中に判断）

- マウス視差の振幅 ±6px が体感で過剰／不足の場合は ±4〜8px の範囲で微調整
- 紙片3枚のモバイル位置が PLAN グリッドと重なる場合は `top` 値を再調整
- Caveat の手書きフォントが日本語環境で表示遅延する場合は `font-display: swap` を確認
- LinkItem.category 追加に伴って既存テーマの型エラーが出る場合（`as const` 推論等）、既存テーマ側を最小修正
