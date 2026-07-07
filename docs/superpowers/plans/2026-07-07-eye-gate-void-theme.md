# Eye Gate 入口画面 + Void テーマ 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 目のアスキーアート入口画面（毎回表示・瞳がカーソル追従・カーソル光源演出・enter で入場）と第5テーマ「void」を追加し、ThemeTutorial を廃止、SEO 用 JSON-LD を導入する。

**Architecture:** 入口はテーマ機構から独立した全画面固定オーバーレイ（`EyeGate.astro`）。新テーマ void は既存のテーマペイン機構（`data-theme` 切替）の5つ目として追加。既存のハッシュ切替・localStorage 保存は温存し、初期テーマ判定のみ `hash > 'void'` に変更する。

**Tech Stack:** Astro 5 / TypeScript / vanilla DOM（ライブラリ追加なし）/ CSS mask + clip-path + requestAnimationFrame

**Spec:** `docs/superpowers/specs/2026-07-07-eye-gate-void-theme-design.md`

## Global Constraints

- テストフレームワークは導入されていない。各タスクの検証は `npm run build` と dev サーバー（`npm run dev`、http://localhost:4321）で行う
- `src/data/eyeArt.ts` 内の「空白」はすべて U+2800（⠀ 点字空白）。ASCII スペースに置換してはならない（エディタの trailing-whitespace 除去にも注意）
- アクセントカラーは CSS 変数 `--void-accent: #ff4d9e`。BaseLayout の `:root` で定義し、void テーマと EyeGate で共有する
- `<title>` は「Vivibio - yoko's Profile」のまま変更しない（SEO ワードを title に入れない）
- コミットメッセージは既存リポジトリの流儀 `type(scope): 日本語要約`。AI ツール名・モデル名の帰属表記（Co-Authored-By 等）は一切入れない
- `mask-image` は `-webkit-mask-image` と併記する

---

### Task 1: 目のアートデータ `eyeArt.ts` を追加

**Files:**
- Create: `src/data/eyeArt.ts`

**Interfaces:**
- Consumes: なし
- Produces: `EYE_OUTLINE: string`（目の輪郭レイヤー、100桁×50行の点字アート）、`EYE_PUPIL: string`（瞳レイヤー、同一グリッド）。全行が U+2800 で64桁に揃えてある。Task 4 の EyeGate が import する

- [ ] **Step 1: ファイルを作成する**

`src/data/eyeArt.ts` を以下の内容で**一字一句そのまま**作成する（テンプレートリテラル内は点字文字。コピー時に改変しないこと）:

```ts
// Braille eye art for the entrance gate (EyeGate).
// Source: https://emojicombos.com/eye-ascii-art (the same art used on the
// site this gate pays homage to).
// Split into a static outline layer and a movable pupil (iris) layer at
// braille-dot level. Both layers share the same 100x50 character grid
// (every line padded to 100 chars with U+2800) so they align exactly
// when stacked.

export const EYE_OUTLINE = `⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡇⠀⠀⠀⠈⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡇⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠄⢰⠇⠀⠀⠠⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠠⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⢸⠀⠀⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠠⠀⠀⠀⠁⠀⠀⠀⠀⡇⢸⢸⡇⠇⢀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠀⠀⠇⢀⡇⢸⣸⠀⠀⠀⠀⠀⠀⠀⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⢀⠀⠃⢸⢠⢸⣿⢸⠀⠀⠀⠠⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠁⠀⠀⠐⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡀⠰⠀⠀⠀⠀⠀⠀⠀⠀⠄⠀⠀⠀⠀⢸⢸⢠⠀⣾⢸⢸⣿⢸⢀⢠⠀⡆⡇⠀⠀⠐⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠁⠀⠀⠀⠀⢃⠀⢀⠀⠀⠀⢀⠀⠀⠀⠀⠀⠁⠘⢸⢸⠀⡏⣿⢸⣿⢸⡘⢸⡀⡇⡇⡀⠀⠀⠀⠄⠀⠀⠀⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⠀⢄⠀⠀⢀⠀⠀⢢⡀⠀⠀⠀⢰⠀⣸⢸⢴⣇⡟⣾⣿⢸⣿⢸⡇⡇⡇⡇⠰⠀⠀⠀⠈⠀⠀⠀⠀⠀⠀⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠀⠐⢄⠘⢄⠀⠣⡀⠀⠑⢄⠀⠱⣄⠁⡄⠆⣇⢿⢸⣾⣿⣇⣿⣿⣼⣿⣸⢷⡇⣼⢀⠀⠀⣠⠊⠀⣠⠆⠀⠀⠀⠁⠡⠎⠀⠈⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠢⠀⠀⠀⡑⢄⠀⠁⠀⠑⢄⠙⢦⡀⠢⠙⡦⣈⢧⡻⣜⠼⣜⢯⣿⣿⣿⣿⣿⣿⣿⣿⣼⣹⢣⢣⢡⠞⣁⣴⠞⡁⠀⠀⠀⡠⠀⠀⠤⠀⠀⠀⠀⠀⡠⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠑⠠⡈⠒⠥⣀⠀⠐⠄⡉⠢⣝⡲⢬⡪⠎⠃⠙⠛⠚⠛⠛⠋⠉⠉⠉⠉⠉⠙⠛⠛⠛⠛⠛⠓⢾⣫⠥⡺⠕⣀⠤⡊⠀⢠⠀⢀⡠⠂⢀⡠⠊⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠀⠀⠀⠀⠀⠒⠤⣀⠑⠢⠬⣽⣒⠤⠈⠒⡦⢭⡟⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⡳⢻⣭⠖⣋⠠⣀⡴⠞⡩⠄⠚⠁⠀⠀⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠀⠀⢀⡀⠈⠀⠀⠀⠈⠁⠒⠀⠬⠍⠛⠛⣚⣩⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠛⢶⣬⣓⣒⢛⣃⣉⠠⠔⠀⠠⠂⠁⠀⠀⠀⠠⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠂⠠⠀⠀⠀⠈⠁⠐⠢⠤⣁⣒⣒⣛⣂⣶⡟⠟⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⠀⠈⠻⢯⣟⣂⣂⣒⣒⣒⣈⡩⠥⠐⠈⠁⠀⠀⠠⠀⠈⠉⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠀⠀⠀⠀⠈⠉⠉⠉⠀⠐⠒⣒⣛⣿⣿⣛⠉⠀⠀⠠⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⣷⠀⠀⠀⠉⣛⠒⢲⠆⠡⠤⠤⠤⠒⠒⠀⠈⠀⠀⠀⠀⠀⢀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡀⠀⠀⠈⠀⡀⠠⠤⠐⠒⠒⣒⠒⠚⠳⠼⠛⠿⣶⣥⡠⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⠃⠀⢀⣴⣶⠿⠛⢿⣽⣛⠋⣉⣉⠉⠒⠒⠒⠂⠐⠀⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠠⠀⠀⠒⠀⠩⠉⠀⠉⠉⢑⡚⢛⢋⠸⠝⠿⣮⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⢀⣠⣾⡻⠯⠭⣉⡙⠓⠚⠥⢄⡀⠀⠀⠈⠉⠐⠒⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠀⠀⠤⠄⠀⠤⠐⠀⠈⢉⡠⠄⣀⠤⠒⣈⡭⠾⢙⡷⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣤⡶⢿⣟⠯⢍⡛⠶⡤⠉⠑⠢⢄⠀⠀⠉⠀⠂⠠⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠀⠒⡡⠔⠈⠀⠢⠋⠁⠂⠀⣡⠴⢃⣵⢟⡟⣷⣾⣿⣶⣶⣤⣤⣤⣴⣶⣦⣬⡷⣶⢿⢯⡳⣌⠢⢍⠛⠦⠌⠑⠠⠀⠀⠲⠤⡉⠢⠀⠈⠀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠠⠀⠀⠀⠀⠀⠀⠊⠀⠀⠀⠀⠄⠀⠀⠁⠘⢁⢀⠔⠁⠁⣽⢣⣇⡏⡏⣿⡟⣿⣿⢿⣿⣿⢸⡵⢹⣯⠆⠑⢜⢣⡀⠉⠢⣈⠂⠀⠀⠀⠀⠀⠀⠂⡀⠀⠀⠀⠑⢄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠂⠀⠀⠀⠀⠀⠀⠀⠔⠀⠀⡠⠈⠀⠀⠀⣰⠑⢸⣹⢹⢿⣿⡇⣿⣿⢸⡟⢸⠈⣷⠁⠙⢇⠀⠀⠀⠙⢦⡀⠈⠃⢄⠀⠀⠀⠐⠀⠀⠀⠀⠀⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠐⠀⡀⠁⠀⠀⠀⠀⠀⠀⠀⠁⠃⠇⢸⢸⢸⠸⡏⡇⢸⣿⢸⣧⢨⠀⡝⡏⠀⠈⠂⠀⠀⠀⢀⠀⠀⠀⡀⠑⡀⠀⠀⠀⠈⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠒⠀⠀⠀⠀⠀⠀⡸⢸⢸⠀⣧⢿⢸⣿⠀⣿⠈⠀⠇⡇⠀⠀⠀⠐⠀⠀⠀⠀⠀⠀⠀⠀⠈⠄⠀⠀⠀⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠀⢀⠀⢁⠘⠀⡀⠸⡌⢸⣿⠀⡏⠀⢀⠀⡄⠀⣤⠀⠀⠀⠐⠀⠀⠀⠀⠀⢠⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠐⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⠀⡀⠇⠸⠃⢸⣿⠀⠇⠀⠀⢰⠀⠀⠀⠀⠀⠀⠀⠈⠀⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡀⠀⢀⠀⠀⠀⠁⠀⠂⠸⡟⠀⠀⠀⠀⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠠⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠁⠀⠀⠀⠀⠀⠂⠀⠀⠀⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡇⠤⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡇⠀⠀⠀⠀⠀⠈⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀`;

export const EYE_PUPIL = `⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⢤⠤⠄⡠⠤⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠤⣄⡠⢤⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠘⣩⠰⠊⠁⠀⠀⠀⢀⡀⡀⠀⠀⠀⠀⠀⠀⢀⠀⠉⠓⢮⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡄⠋⠁⣀⣴⣶⠏⣠⡞⣡⣶⣶⣶⡄⠀⠀⠀⠀⠀⠻⣷⣦⣀⠈⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣤⣾⣿⣿⡏⢠⢶⡃⢿⣿⣿⠿⠁⠀⠀⠀⠀⠀⠀⢹⣿⣿⣷⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣾⣿⣿⣿⣿⡅⢊⠎⣹⠀⠉⠁⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⣿⡏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⢿⣿⣿⣿⣇⠀⠘⠄⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣮⣿⣿⣿⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠐⠄⡈⠛⠿⣿⣄⠈⠀⠁⠂⠄⠀⠀⠀⠀⠀⠀⢀⣼⣿⠿⠛⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠺⣤⣂⠀⣉⠑⠀⠀⠀⠀⠀⠀⠀⠀⠀⠐⠊⣉⠠⡀⠈⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀`;
```

- [ ] **Step 2: チェックサムで内容を検証する**

Run: `md5 -q src/data/eyeArt.ts`
Expected: `c06689f323729e1eb60514c618afb2f6`

一致しない場合はコピー時に文字が化けている。以下で診断できる（ASCII スペース混入と桁ズレの検出）:

```bash
python3 - <<'EOF'
import re
src = open('src/data/eyeArt.ts', encoding='utf-8').read()
arts = re.findall(r'`([^`]*)`', src, re.S)
assert len(arts) == 2, f'expected 2 template literals, got {len(arts)}'
for name, art in zip(['EYE_OUTLINE', 'EYE_PUPIL'], arts):
    lines = art.split('\n')
    assert len(lines) == 50, f'{name}: {len(lines)} lines (expected 50)'
    for i, l in enumerate(lines):
        assert len(l) == 100, f'{name} line {i}: {len(l)} chars (expected 100)'
        assert ' ' not in l, f'{name} line {i}: contains ASCII space'
print('eyeArt.ts OK')
EOF
```

- [ ] **Step 3: ビルドが通ることを確認する**

Run: `npm run build`
Expected: exit 0（このファイルはまだどこからも import されていないが、構文エラー検出のため実行する）

- [ ] **Step 4: コミット**

```bash
git add src/data/eyeArt.ts
git commit -m "feat(gate): 入口画面用の目の点字アートデータを追加"
```

---

### Task 2: VoidTheme を作成しテーマ機構へ統合

**Files:**
- Create: `src/components/themes/VoidTheme.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/components/ThemeSwitcher.astro`

**Interfaces:**
- Consumes: `src/data/profile.ts` の `PROFILE` / `LINKS` / `OUTPUTS`（既存。変更しない）
- Produces: テーマ id `'void'`（`data-theme="void"` のペイン、ThemeSwitcher の選択肢、初期テーマ）。CSS 変数 `--void-accent`（Task 4 の EyeGate が参照）

- [ ] **Step 1: VoidTheme コンポーネントを作成する**

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

- [ ] **Step 2: index.astro に void ペインを追加する**

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

- [ ] **Step 3: BaseLayout を void 対応にする**

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

- [ ] **Step 4: ThemeSwitcher に VOID を追加する**

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

- [ ] **Step 5: ビルドと表示を検証する**

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

- [ ] **Step 6: コミット**

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

- [ ] **Step 1: index.astro から参照を除去する**

`src/pages/index.astro` から次の2行を削除:

```astro
import ThemeTutorial from '../components/ThemeTutorial.astro';
```

```astro
  <ThemeTutorial />
```

- [ ] **Step 2: ThemeSwitcher からチュートリアル用フックを除去する**

`src/components/ThemeSwitcher.astro` の script 内から次のブロック（コメント含む）を削除:

```ts
  // Expose applyTheme so the first-visit tutorial (ThemeTutorial.astro) can
  // settle on the target theme and update aria-current + localStorage in one go.
  ;(window as unknown as { vivibioApplyTheme?: (t: ThemeId) => void }).vivibioApplyTheme = (t) => {
    if (isAllowed(t)) applyTheme(t);
  };
```

- [ ] **Step 3: コンポーネントを削除する**

```bash
git rm src/components/ThemeTutorial.astro
```

- [ ] **Step 4: 参照が残っていないことを確認しビルドする**

```bash
grep -ri 'ThemeTutorial\|vivibioApplyTheme' src/ ; echo "grep exit: $?"
```

Expected: 出力なし、`grep exit: 1`

Run: `npm run build`
Expected: exit 0

- [ ] **Step 5: コミット**

```bash
git add src/pages/index.astro src/components/ThemeSwitcher.astro
git commit -m "refactor(theme): 初回テーマツアー(ThemeTutorial)を廃止"
```

---

### Task 4: EyeGate の静的構造と enter 遷移

**Files:**
- Create: `src/components/EyeGate.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `src/data/eyeArt.ts` の `EYE_OUTLINE` / `EYE_PUPIL`（Task 1）、CSS 変数 `--void-accent`（Task 2）
- Produces: 全画面オーバーレイ `#eye-gate`。id `gate-eye` / `gate-pupil` / `gate-enter` は Task 5 のアニメーションが参照する

- [ ] **Step 1: EyeGate コンポーネントを作成する**

`src/components/EyeGate.astro` を以下の内容で作成する:

```astro
---
import { EYE_OUTLINE, EYE_PUPIL } from '../data/eyeArt';
---

<div class="gate" id="eye-gate" role="dialog" aria-modal="true" aria-label="entrance">
  <div class="gate-eye" id="gate-eye">
    <pre class="art art-dim" aria-hidden="true">{EYE_OUTLINE}</pre>
    <pre class="art art-lit" aria-hidden="true">{EYE_OUTLINE}</pre>
    <div class="socket" aria-hidden="true">
      <pre class="art art-pupil" id="gate-pupil">{EYE_PUPIL}</pre>
    </div>
  </div>
  <button class="gate-enter" id="gate-enter" type="button">[ enter ]</button>
</div>

<style>
  .gate {
    position: fixed;
    inset: 0;
    z-index: 300;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 40px;
    background: #000;
    transition: opacity 0.5s ease;
  }
  .gate.leaving {
    opacity: 0;
    pointer-events: none;
  }

  .gate-eye {
    position: relative;
    --mx: 50%;
    --my: 48.5%;
  }
  .art {
    margin: 0;
    font-family: ui-monospace, 'JetBrains Mono', monospace;
    font-size: clamp(4px, 1.5vmin, 9px);
    line-height: 1.05;
    letter-spacing: 0;
    user-select: none;
  }
  .art-dim {
    color: #3a3a3a;
  }
  /* カーソルを光源として周縁が浮かび上がるレイヤー。
     マスク中心は Task 5 の rAF ループが --mx / --my で動かす。 */
  .art-lit {
    position: absolute;
    inset: 0;
    color: #cfcfcf;
    -webkit-mask-image: radial-gradient(circle 24vmin at var(--mx) var(--my), #000 0%, transparent 70%);
    mask-image: radial-gradient(circle 24vmin at var(--mx) var(--my), #000 0%, transparent 70%);
    animation: gate-shimmer 3.6s ease-in-out infinite;
  }
  /* 目の開口部。瞳がまぶたからはみ出さないよう楕円で切る。
     中心・半径はアートの目の開口部（中心 x50% y48.5%）に合わせてある。 */
  .socket {
    position: absolute;
    inset: 0;
    clip-path: ellipse(17% 9.5% at 50% 48.5%);
  }
  .art-pupil {
    color: var(--void-accent);
    transform: translate(var(--px, 0%), var(--py, 0%));
    will-change: transform;
  }
  @keyframes gate-shimmer {
    0%,
    100% {
      opacity: 0.85;
    }
    50% {
      opacity: 1;
    }
  }

  .gate-enter {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 14px;
    letter-spacing: 0.2em;
    color: #9a9a9a;
    background: none;
    border: none;
    padding: 12px 20px;
    cursor: pointer;
    transition: color 0.2s ease;
  }
  .gate-enter:hover,
  .gate-enter:focus-visible {
    color: var(--void-accent);
  }

  @media (prefers-reduced-motion: reduce) {
    .gate {
      transition: none;
    }
    .art-lit {
      animation: none;
    }
  }
</style>

<noscript>
  <style>
    #eye-gate {
      display: none;
    }
  </style>
</noscript>

<script>
  const gate = document.getElementById('eye-gate');
  const enterBtn = document.getElementById('gate-enter');

  if (gate && enterBtn) {
    // ゲート表示中は本体をスクロールさせない（JS 無効時はゲート自体が消えるのでロックも掛からない）
    document.body.style.overflow = 'hidden';
    enterBtn.focus();

    let left = false;
    const leave = () => {
      if (left) return;
      left = true;
      document.body.style.overflow = '';
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gate.style.display = 'none';
        return;
      }
      gate.classList.add('leaving');
      gate.addEventListener('transitionend', (e) => {
        if (e.target === gate && e.propertyName === 'opacity') gate.style.display = 'none';
      });
    };

    enterBtn.addEventListener('click', leave);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !left) leave();
    });
  }
</script>
```

- [ ] **Step 2: index.astro に組み込む**

`src/pages/index.astro` の import 群に追加:

```astro
import EyeGate from '../components/EyeGate.astro';
```

`<ThemeSwitcher />` の後に追加:

```astro
  <EyeGate />
```

- [ ] **Step 3: 検証する**

Run: `npm run build`
Expected: exit 0

dev サーバーで http://localhost:4321/ を開き確認:
- 黒背景中央に目のアート（輪郭=暗グレー、瞳=ピンク）と `[ enter ]` が表示され、本体は見えない
- ゲート表示中にスクロールできない
- `[ enter ]` クリックで 0.5s フェードして void テーマ本体が現れ、スクロールが戻る
- リロードして Enter キーでも同様に入場できる
- http://localhost:4321/#glitch では enter 後に glitch テーマが表示される

- [ ] **Step 4: コミット**

```bash
git add src/components/EyeGate.astro src/pages/index.astro
git commit -m "feat(gate): 目のアスキーアート入口画面を追加"
```

---

### Task 5: EyeGate のアニメーション（瞳追従・光源・アイドル）

**Files:**
- Modify: `src/components/EyeGate.astro`

**Interfaces:**
- Consumes: Task 4 の DOM（`#eye-gate` / `#gate-eye` / `#gate-pupil` / `#gate-enter`）と CSS 変数 `--mx` / `--my` / `--px` / `--py`
- Produces: なし（自己完結）

- [ ] **Step 1: script ブロックを差し替える**

`src/components/EyeGate.astro` の `<script>` ブロック全体を以下に置き換える（Task 4 の enter 処理を含む完全版）:

```ts
<script>
  const gate = document.getElementById('eye-gate');
  const eye = document.getElementById('gate-eye');
  const pupil = document.getElementById('gate-pupil');
  const enterBtn = document.getElementById('gate-enter');

  if (gate && eye && pupil && enterBtn) {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ゲート表示中は本体をスクロールさせない（JS 無効時はゲート自体が消えるのでロックも掛からない）
    document.body.style.overflow = 'hidden';
    enterBtn.focus();

    // ---- enter ----
    let left = false;
    let rafId = 0;
    const leave = () => {
      if (left) return;
      left = true;
      document.body.style.overflow = '';
      cancelAnimationFrame(rafId);
      if (reduced) {
        gate.style.display = 'none';
        return;
      }
      gate.classList.add('leaving');
      gate.addEventListener('transitionend', (e) => {
        if (e.target === gate && e.propertyName === 'opacity') gate.style.display = 'none';
      });
    };
    enterBtn.addEventListener('click', leave);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !left) leave();
    });

    // ---- 視線追従と光源（reduced-motion 時は静止画のまま） ----
    if (!reduced) {
      let tx = 0.5; // 目標座標（viewport 正規化 0..1）
      let ty = 0.45;
      let cx = tx; // 現在値（lerp でなめらかに追従）
      let cy = ty;
      let lastInput = -Infinity; // 初期状態はアイドル（視線が泳ぐ）から始める
      let rect = eye.getBoundingClientRect();

      window.addEventListener('resize', () => {
        rect = eye.getBoundingClientRect();
      });
      const onPoint = (e: PointerEvent) => {
        tx = e.clientX / window.innerWidth;
        ty = e.clientY / window.innerHeight;
        lastInput = performance.now();
      };
      window.addEventListener('pointermove', onPoint, { passive: true });
      window.addEventListener('pointerdown', onPoint, { passive: true });

      const tick = (t: number) => {
        if (left) return;
        // 4秒入力が無ければリサジュー曲線で視線が泳ぐ（タッチ端末は常時こちらが主体）
        if (t - lastInput > 4000) {
          tx = 0.5 + 0.4 * Math.sin(t / 2900);
          ty = 0.45 + 0.35 * Math.sin(t / 4100 + 1.2);
        }
        cx += (tx - cx) * 0.09;
        cy += (ty - cy) * 0.09;

        // 瞳: 画面中央基準の相対位置を単位円にクランプして % 移動。
        // 3.5% / 2.0% は socket の楕円内に収まるよう調整した可動域。
        let dx = cx * 2 - 1;
        let dy = cy * 2 - 0.9;
        const norm = Math.hypot(dx, dy);
        if (norm > 1) {
          dx /= norm;
          dy /= norm;
        }
        pupil.style.setProperty('--px', (dx * 3.5).toFixed(2) + '%');
        pupil.style.setProperty('--py', (dy * 2.0).toFixed(2) + '%');

        // 光源: カーソル位置をアートのローカル座標へ変換してマスク中心に設定
        const mx = cx * window.innerWidth - rect.left;
        const my = cy * window.innerHeight - rect.top;
        eye.style.setProperty('--mx', mx.toFixed(1) + 'px');
        eye.style.setProperty('--my', my.toFixed(1) + 'px');

        rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);
    }
  }
</script>
```

- [ ] **Step 2: 検証する**

Run: `npm run build`
Expected: exit 0

dev サーバーで http://localhost:4321/ を開き確認:
- マウスを動かすと瞳（ピンク）が遅れ気味に追従し、カーソル側の周縁ドットが明るく浮かぶ
- 瞳が目の開口部（socket）の外へはみ出さない
- 4秒放置すると視線がゆっくり泳ぎ始め、マウスを動かすと追従に戻る
- enter 後にコンソールエラーが無い（rAF は leave で停止する実装。DevTools の Performance で確認する場合、enter 後に Animation Frame が発火しないこと）
- DevTools の Rendering → Emulate CSS prefers-reduced-motion: reduce でリロード → 目は静止、enter は即時切替
- デバイスツールバーでモバイル表示（タッチ）→ 視線が泳ぎ、タップ位置に視線が向く

調整が必要な場合（勘所）:
- 瞳のはみ出し・可動域: script の `3.5` / `2.0`（%）と style の `.socket` の `ellipse(17% 9.5% at 50% 48.5%)` を対で調整
- 光の広がり: `.art-lit` の `circle 24vmin` と `transparent 70%`
- 追従のぬるさ: lerp 係数 `0.09`（大きいほど機敏）

- [ ] **Step 3: コミット**

```bash
git add src/components/EyeGate.astro
git commit -m "feat(gate): 瞳のカーソル追従と光源・アイドルアニメーションを追加"
```

---

### Task 6: SEO（JSON-LD Person + meta description）

**Files:**
- Modify: `src/layouts/BaseLayout.astro`

**Interfaces:**
- Consumes: `src/data/profile.ts` の `PROFILE` / `LINKS`
- Produces: `<script type="application/ld+json">`（schema.org Person）、強化された meta description。`<title>` は変更しない

- [ ] **Step 1: frontmatter を更新する**

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

- [ ] **Step 2: head に JSON-LD を追加する**

`<meta name="twitter:card" content="summary" />` の直後に追加:

```astro
    <script type="application/ld+json" set:html={personJsonLd} />
```

- [ ] **Step 3: 検証する**

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

- [ ] **Step 4: コミット**

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

- [ ] **Step 1: クリーンビルド**

Run: `npm run build`
Expected: exit 0、エラー・警告なし

- [ ] **Step 2: スペックの検証計画を全項目確認する**

dev サーバーを起動し、ブラウザで以下をすべて確認する:

1. `/` アクセス → ゲート表示 → 瞳追従・光源 → enter → void テーマ着地
2. ゲート表示中スクロール不可、enter 後スクロール可
3. `/#glitch` → enter 後 glitch に着地
4. ThemeSwitcher で void ⇔ 既存4テーマを往復（切替アニメーション正常、void の VOID ボタンがアクティブ表示になる）
5. テーマ切替後にリロード → 再びゲート → enter → void（保存テーマに引きずられない）
6. モバイルエミュレーション（縦画面・タッチ）: アートが画面内に収まる、視線が泳ぐ、タップで視線が向く、void テーマの行レイアウトが崩れない
7. prefers-reduced-motion: reduce → ゲートは静止画 + enter のみ、フェードなし即時切替
8. コンソールにエラーが出ていない

- [ ] **Step 3: 問題があれば修正してコミット、なければ完了**

修正した場合:

```bash
git add -A
git commit -m "fix(gate): 総合検証で見つかった問題を修正"
```
