# Eye Gate 入口画面 + Void テーマ 設計書

作成日: 2026-07-07

## 概要

mathdroid 氏のパーソナルサイト（`ssh mathdro.id`）にインスパイアされた、目のアスキーアートによる入口画面（Eye Gate）を追加する。あわせて第5のテーマ「void」（黒背景・小さい文字・ターミナル風の情報羅列)を追加し、入口からの遷移先とする。既存の初回テーマツアー（ThemeTutorial）は廃止する。

参考: https://x.com/mathdroid/status/2074130147935219713

## 要件

| 項目 | 決定 |
|---|---|
| 入口画面の表示 | 毎回表示（全アクセス時） |
| アート | emojicombos の大判 Braille アート（50行級）を流用・加工 |
| 瞳の動き | カーソル/タッチ位置に lerp 追従。アイドル時は自動で視線が泳ぐ |
| 光の演出 | カーソルを光源として周縁のまつ毛状ドットが明るく浮かぶ + 微細なきらめき |
| 入場方法 | `[ enter ]` ボタンクリック または Enter キー |
| 遷移先 | 常に void テーマ（ハッシュ付き直リンクのみ例外としてそのテーマへ） |
| 新テーマ | id: `void` / ラベル: `VOID`。黒背景・小文字羅列・カード+羅列の折衷 |
| アクセント | ピンク/マゼンタ（`#ff4d9e` 起点、実装時に目視調整。glitch の #ff2d8d とは微差別化） |
| ThemeTutorial | ファイル削除 |
| SEO | JSON-LD (Person) + meta description 強化。title はクリーンに保つ |

## アーキテクチャ（承認済み: 案A）

入口画面はテーマシステムから独立した全画面オーバーレイとして実装し、新テーマは既存のテーマペイン機構に5つ目として追加する。既存のテーマ切替・ハッシュ・永続化ロジックは温存する。

### 追加ファイル

| ファイル | 役割 |
|---|---|
| `src/components/EyeGate.astro` | 入口オーバーレイ。アート表示・瞳追従・光源演出・enter 処理を自己完結 |
| `src/components/themes/VoidTheme.astro` | void テーマ本体 |
| `src/data/eyeArt.ts` | アートのテキストデータ（輪郭用 `EYE_OUTLINE` と瞳用 `EYE_PUPIL` の2定数） |

### 変更ファイル

| ファイル | 変更内容 |
|---|---|
| `src/pages/index.astro` | `<EyeGate />` と void ペイン追加、`<ThemeTutorial />` 削除 |
| `src/layouts/BaseLayout.astro` | 初期テーマ判定変更、void 用 body スタイル、theme-color を #000 に、SEO 追加 |
| `src/components/ThemeSwitcher.astro` | ALLOWED に `void` 追加、VOID ボタン追加（目モチーフの SVG アイコン） |
| `src/components/ThemeTutorial.astro` | 削除 |

### アートデータの作成

抽出済みの大判 Braille アート（emojicombos の eye-ascii-art、50行級のもの）をベースに、
瞳部分を空白 `⠀`（U+2800）に置換した「輪郭」と、くり抜いた「瞳」の2定数を作る。
加工は使い捨てスクリプト＋手調整で行い、結果のテキストのみ `eyeArt.ts` にコミットする。

## EyeGate の設計

### DOM 構造

```
<div class="gate">                        ← position:fixed inset:0、黒背景、z-index: 300
  <div class="gate-eye">                  ← 中央配置、サイズは vmin ベース
    <pre class="art-dim">輪郭アート</pre>    ← 常時表示、暗グレー（#3a3a3a 程度）
    <pre class="art-lit">輪郭アート</pre>    ← 明グレー。radial-gradient マスクでカーソル周辺のみ表示
    <div class="socket">                  ← 目の開口部の楕円 clip-path
      <pre class="art-pupil">瞳アート</pre>  ← アクセントピンク。transform でカーソル追従
    </div>
  </div>
  <button class="gate-enter">[ enter ]</button>
</div>
```

4層は同一グリッド・同一フォントサイズで重ね置きし、文字位置を完全に一致させる。

### アニメーション

- `pointermove` は目標座標の記録のみ。`requestAnimationFrame` ループで現在値を目標へ
  lerp（補間係数 0.1 前後）し、瞳の `transform: translate()` とライト用 CSS 変数
  `--mx` / `--my` を更新する
- 瞳の可動域は目の中心から楕円クランプ（横±6%・縦±3% 程度、実装時調整）
- ライト: `.art-lit` に `mask-image: radial-gradient(circle 22vmin at var(--mx) var(--my), #000 0%, transparent 70%)`
  （`-webkit-mask-image` 併記）
- きらめき: `.art-lit` の opacity を 3〜4 秒周期で 0.85〜1.0 に揺らす CSS keyframes。
  ドット単位のディザは軽さ優先で初期実装では省略（物足りなければ後日検討）
- アイドル: 数秒間入力がない場合とタッチ端末では、目標座標をリサジュー曲線で
  ゆっくり自動移動させ視線が泳ぐ。タッチ入力があればその位置に追従
- rAF ループは enter 後（ゲート非表示化後）に必ず停止する

### enter と表示制御

- トリガー: `[ enter ]` ボタンクリック / Enter キー（document レベルでも拾う）
- 発動後: 0.5s の opacity フェードアウト → `transitionend` で `display: none`
- ゲート表示中は body スクロールロック（`overflow: hidden`）。解除は enter 時。
  ロックの付与・解除は JS で行う（JS 無効時はゲート自体が noscript で消えるため、ロックも掛からない）
- ページ読込時点で root の `data-theme` は着地テーマ（既定 void）が設定済みのため、
  フェード後のテーマ切替ちらつきは発生しない

### フォールバック・アクセシビリティ

- `prefers-reduced-motion: reduce`: 追従・きらめき・アイドル泳ぎを停止（静止アート + enter のみ）。
  フェードアウトも即時切替
- JS 無効: `<noscript><style>.gate{display:none}</style></noscript>` で本体へ直行
- アートの `<pre>` はすべて `aria-hidden="true"`。ゲートは `role="dialog"` + `aria-label`。
  ボタンに初期フォーカス、明示ラベル（例: "enter site"）を付与

## VoidTheme の設計

### レイアウト（上部寄せ・中央1カラム・max-width 640px）

```
> Naoki Yokomachi (yoko) — Software Engineer / AI Engineer
I work across stacks, phases, and layers — whatever
the problem needs. Currently focused on AWS and AI.

-- links ------------------
code     github        n-yokomachi
code     huggingface   yokomachi
writing  zenn          yokomachi
...（LINKS 20件全件。category 順ソート: code → writing → talks → social → creds → design → self → contact）

-- outputs ----------------
ARTICLE  Strands Agents Skillと...
TALK     AI Agent Builders Meetup #2
...（OUTPUTS 4件）

● tokyo, japan               ← 緑ドットのステータス行
```

- プロフィールブロックは `> Naoki Yokomachi (yoko) — {PROFILE.title}` の1行 + `PROFILE.bio`（英語）。
  `>` のみアクセントピンク。名前とハンドル yoko は併記し、`yoko` 単独見出しと `AWS / AI` 行は置かない
- データは既存の `src/data/profile.ts`（PROFILE / LINKS / OUTPUTS）をそのまま使用
- リンク行は hover で行全体がアクセントピンクに変化
- フォント: JetBrains Mono（読込済み）。本文 11〜13px、行間広め
- 配色: 背景 #000（純黒）/ 本文 #9a9a9a / 見出し・罫線 #555 / 強調 #eee / アクセント `--void-accent`
- アクセント変数はゲートの瞳と共有する

### テーマシステムへの統合

- BaseLayout の初期テーマ判定: `hash > stored > 'minimal'` → **`hash > 'void'`** に変更。
  localStorage への保存処理は現状維持（初期判定で参照しなくなるだけ）
- ThemeSwitcher: `{ id: 'void', label: 'VOID' }` を先頭に追加。ALLOWED 配列にも追加。
  アイコンは小さな目の SVG（楕円 + 瞳）
- BaseLayout の `theme-color` メタを #000 に変更（最初に見えるのが黒いゲートのため）
- ThemeTutorial: ファイル削除 + index.astro から import 除去。
  過去訪問者の localStorage フラグ残骸は無害なので放置

## SEO 対策（サイト全体）

対象ワード: `naoki yokomachi` / `横町直樹` / `yoko` / `_cityside` / `yokomachi`

方針: **タブに表示される `<title>` は現状のままクリーンに保つ**。SEO ワードは不可視の場所に仕込む。

1. **JSON-LD 構造化データ（schema.org Person）を BaseLayout に追加**（主戦力）:
   - `name`: Naoki Yokomachi
   - `alternateName`: [横町直樹, 横町 直樹, yoko, yokomachi, _cityside]
   - `jobTitle`: Software Engineer / AI Engineer
   - `url`: サイト URL
   - `sameAs`: GitHub / X / Zenn / LinkedIn など主要プロフィールリンク（profile.ts から生成）
2. **meta description の強化**: 検索スニペット向けに名前群を自然な文章で含める
   （og:description も同期）。タブ表示には影響しない
3. **可視テキスト**: VoidTheme の「Naoki Yokomachi (yoko)」、既存テーマの「横町 直樹」で自然にカバー。
   ゲートは CSS オーバーレイのためクローラーは本体コンテンツを通常通り読める
4. meta keywords は現代の検索エンジンに無視されるため追加しない

## エッジケース

| ケース | 挙動 |
|---|---|
| `#glitch` 等ハッシュ付きアクセス | ゲート表示、裏テーマ = glitch、enter 後 glitch に着地 |
| 再訪問（テーマ保存済み） | 保存値は初期判定に使わず void に着地 |
| ゲート表示中の ThemeSwitcher | ゲートが上に被さるため操作不可（意図通り） |
| JS 無効 | ゲート非表示、本体（void）へ直行 |
| reduced-motion | 静止アート + enter のみ |

## 検証計画

1. `npm run build` が通ること
2. ブラウザ実機確認:
   - ゲート表示 → 瞳追従・ライト演出 → enter → void テーマ着地
   - スクロールロックと解除
   - rAF ループが enter 後に停止すること（Performance パネル等で確認)
3. `#glitch` 直リンクで enter 後 glitch に着地すること
4. モバイル相当（タッチ + 縦画面）とアイドル時の視線泳ぎ
5. `prefers-reduced-motion` エミュレーションで静止すること
6. ThemeSwitcher で既存4テーマ ⇔ void の往復
7. JSON-LD が Rich Results Test 等でバリデーションを通ること
