# Eye Gate 入口画面 + Void テーマ 設計書

作成日: 2026-07-07

## 概要

mathdroid 氏のパーソナルサイト（`ssh mathdro.id`）にインスパイアされた、目のアスキーアートによる入口画面（Eye Gate）を追加する。あわせて第5のテーマ「void」（黒背景・小さい文字・ターミナル風の情報羅列)を追加し、入口からの遷移先とする。既存の初回テーマツアー（ThemeTutorial）は廃止する。

参考: https://x.com/mathdroid/status/2074130147935219713

## 要件

| 項目 | 決定 |
|---|---|
| 入口画面の表示 | 毎回表示（全アクセス時） |
| アート | ツイート動画そのものから実測抽出したドットデータ（ブレイル端末描画: 文字セル14×30px に 2×4 ドット） |
| 周囲（グレー） | 動画の1ループをネイティブVFRタイミングで完全再生（214ステップ・各ステップ実測表示時間、長い静止は100msに圧縮、全長約9.5秒）。波・明滅は動画と同一 |
| 瞳の動き | 動画から抽出した視線状態パターン6種をカーソル方向で切替 + 平行移動 + 穴クリップ。lerp 追従、アイドル時は自動で視線が泳ぐ |
| 瞬き | 再生クロックに同期（ループ内2回、ステップ単位の実測エンベロープで潰す）。グレー側の瞼閉じ（再生データ内）と完全同期 |
| 入場方法 | `[ enter ]` ボタンクリック または Enter キー |
| 遷移先 | 常に void テーマ（ハッシュ付き直リンクのみ例外としてそのテーマへ） |
| 新テーマ | id: `void` / ラベル: `VOID`。黒背景・小文字羅列・カード+羅列の折衷 |
| アクセント | 瞳 = 動画実測 `rgb(238,96,195)`、周囲グレー = 実測フラット `rgb(76,76,76)`。void テーマのアクセントは `#df68c2` 系（実装時調整可） |
| ThemeTutorial | ファイル削除 |
| SEO | JSON-LD (Person) + meta description 強化。title はクリーンに保つ |

## アーキテクチャ（承認済み: 案A）

入口画面はテーマシステムから独立した全画面オーバーレイとして実装し、新テーマは既存のテーマペイン機構に5つ目として追加する。既存のテーマ切替・ハッシュ・永続化ロジックは温存する。

### 追加ファイル

| ファイル | 役割 |
|---|---|
| `src/components/EyeGate.astro` | 入口オーバーレイ。canvas 再生エンジン・瞳状態切替・enter 処理を自己完結 |
| `src/components/themes/VoidTheme.astro` | void テーマ本体 |
| `public/eye-gate-data.json` | 動画実測データ一式（約258KB、gzip 約97KB）。`fetch()` で読込・長期キャッシュ |

### 変更ファイル

| ファイル | 変更内容 |
|---|---|
| `src/pages/index.astro` | `<EyeGate />` と void ペイン追加、`<ThemeTutorial />` 削除 |
| `src/layouts/BaseLayout.astro` | 初期テーマ判定変更、void 用 body スタイル、theme-color を #000 に、SEO 追加 |
| `src/components/ThemeSwitcher.astro` | ALLOWED に `void` 追加、VOID ボタン追加（目モチーフの SVG アイコン） |
| `src/components/ThemeTutorial.astro` | 削除 |

### アートデータの作成（動画実測。プレビュー v67 で検証済み）

CSS/生成モデル方式は検証の結果すべて破棄し、**ツイート動画（HD 1546×1686、20fps）からの実測再現**に確定した。
元サイトはブレイル文字のターミナル描画であり、動画への格子当てはめで
文字セル 14×30px・セル内ドット位置 x={0,5.5} y={0,5.65,11.3,16.95}・ドット3×3px が
残差 0.3px 以下で一致する（110ドット列 × 103ドット行）。
「2ドット列ごとの縦の間隙」「4ドット行ごとの横の間隙」は文字セル境界であり、必ず保存する。

抽出パイプライン（使い捨てスクリプト。成果 JSON のみコミット）:

1. **格子実測**: 全フレームのドット中心（局所極大）ヒストグラムから行・列の実位置テーブルを構築
2. **周囲グレー**: 動画はVFR（端末再描画時のみフレームが記録、更新間隔中央値25ms）のため、
   ネイティブフレームを実タイムスタンプ付きで格子サンプリング（カーソル=高輝度無彩色塊と
   下部メニュー行は除外）し、連続同一パターンを統合した 214 ステップにエンコード
   （マスタセル一覧 + 初期ビット列 + ステップごとの「表示時間.XORデルタ」base36）。
   再生時は表示時間に上限100msを適用し、元動画の長い静止（最大820ms）を圧縮する
3. **瞳**: 全フレーム + デモ区間のピンクを抽出し、基準パターンとの最大重なりでフレームごとの視線シフトを推定。
   シフトでバケット化し、サンプル5フレーム以上の**視線状態6種**（rest / 左 / 右2種 / 上左 / 上右）の
   静的パターンを多数決で構築（rest 区間の瞳は完全静止＝ディザなしが実測事実）
4. **穴マスク**: 非瞬きフレームでグレーが一度も点灯しない領域（行ごとインターバル）。瞳のクリップに使用
5. **瞬きエンベロープ**: ループ内ピンク数の実測（フレーム33-39 / 189-195、0.8→0→0.3→0.72）

### EyeGate の設計

DOM は `gate`（fixed・黒背景・z-index 300）内に `<canvas>` + `[ enter ]` ボタンのみ。

- **描画**: canvas をデバイスピクセル等倍（動画ネイティブ解像度、約800×800px、CSS は /dpr）で確保し、
  ブレイル格子座標 `x = 14·⌊(k+1)/2⌋ + {0,5}`、`y = 30·⌊(n+1)/4⌋ + {0,6,11,17}` に 3×3px ドットを
  整数スナップ描画（アンチエイリアスなし）。ビューポートに収まらない場合のみ CSS 縮小
- **周囲**: rAF ループで再生クロック（ステップ実測表示時間・全長約9.5sループ）に従い
  デルタを適用して全ステップ再生。色はフラット `rgb(76,76,76)`
- **瞳**: カーソル位置を**目（canvas）の中心基準**で正規化し目標シフト（横 -12〜+10 列、縦 -6〜+7 行、
  基準位置は実測 rest から 2 行上げ）へ lerp（0.18）。視線状態6種を softmax 重み（exp(-d²/20)）で
  セル単位ブレンドし、残差を平行移動、穴マスクでクリップ。色 `rgb(238,96,195)`。
  視線移動時にパターンが離散的に切り替わるのは動画実測（移動時中央値65%/フレーム変化）どおりの挙動
- **瞬き**: 再生クロックのエンベロープで瞳を穴中央へ潰す（グレー側の瞼閉じは再生データに内在し自動同期）
- **アイドル**: 4秒無入力で目標座標が目の中心のまわりを正弦で泳ぐ
- rAF ループは enter 後（ゲート非表示化後）に必ず停止する

### enter と表示制御

- トリガー: `[ enter ]` ボタンクリック / Enter キー（document レベルでも拾う）
- 発動後: 0.5s の opacity フェードアウト → `transitionend` で `display: none`
- ゲート表示中は body スクロールロック（`overflow: hidden`）。解除は enter 時。
  ロックの付与・解除は JS で行う（JS 無効時はゲート自体が noscript で消えるため、ロックも掛からない）
- ページ読込時点で root の `data-theme` は着地テーマ（既定 void）が設定済みのため、
  フェード後のテーマ切替ちらつきは発生しない

### フォールバック・アクセシビリティ

- `prefers-reduced-motion: reduce`: 再生・追従・アイドル泳ぎを停止（フレーム0の静止描画 + enter のみ）。
  フェードアウトも即時切替
- データ `fetch()` 完了までは黒背景 + enter ボタンのみ（ゲートは元々黒のため違和感なし）。
  取得失敗時もゲートは機能し enter で本体へ進める
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
- `--void-accent` は瞳の実測ピンク `rgb(238,96,195)` と同系統に揃える（瞳側は実測値固定）

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

0. プレビュー v67 で完了済みの照合（実装移植後にリグレッション確認）:
   - グレー再生: 描画セルと動画フレームの順方向照合で偽陽性ゼロ（例: フレーム100 = 1766/1766 セル一致）
   - 構造: 列間隙 {2px,6px}・行間隙 {2,3,10px} が動画ヒストグラムと一致
   - 瞳: rest 重心が動画実測と縦1.5px 以内（基準2行上げ適用前）、瞬きがグレー側の瞼と同期
1. `npm run build` が通ること
2. ブラウザ実機確認:
   - ゲート表示 → 再生 + 瞳追従 → enter → void テーマ着地
   - スクロールロックと解除
   - rAF ループが enter 後に停止すること（Performance パネル等で確認)
3. `#glitch` 直リンクで enter 後 glitch に着地すること
4. モバイル相当（タッチ + 縦画面）とアイドル時の視線泳ぎ
5. `prefers-reduced-motion` エミュレーションで静止すること
6. ThemeSwitcher で既存4テーマ ⇔ void の往復
7. JSON-LD が Rich Results Test 等でバリデーションを通ること
