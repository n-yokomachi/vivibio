# vivibio

オーナー（Naoki Yokomachi）のプロフィールとSNSリンクをまとめる1ページのサイト。NFCカードのデザインも含む。公開URLは `https://yokomachi.pages.dev`。

## 技術スタックとコマンド

- Astro 5 + TypeScript の静的サイト。ホスティングは Cloudflare Pages
- `npm run dev` で開発サーバー、`npm run build` で `dist/` にビルドする
- テストはない。変更後は `npm run build` が通ることと、ブラウザでの表示を確認する

## 構成

| パス | 役割 |
|---|---|
| `src/data/profile.ts` | PROFILE・CREDENTIALS・LINKS・OUTPUTS。全テーマがここを読むので、内容の更新はこのファイルだけで済む |
| `src/pages/index.astro` | 唯一のページ。全テーマのペインと EyeGate を並べる |
| `src/layouts/BaseLayout.astro` | 初期テーマの判定、meta・OGP・JSON-LD（Person と WebSite） |
| `src/components/themes/` | minimal・glitch・particle・concrete・void の5テーマ |
| `src/components/ThemeSwitcher.astro` | テーマの切り替え。許可するテーマは `ALLOWED` 配列で管理する |
| `src/components/SchemeToggle.astro` | 入口と void のライトとダークの切り替え。`vivibio-scheme` に保存する |
| `src/components/VoidFx.astro` | void の背景のロケットと粒子 |
| `src/scripts/fx/` | ロケット（`rocket.ts`）と星と粒子（`particle-field.ts`）。glitch・particle・void から使う |
| `src/components/EyeGate.astro` | 入口画面。目のアスキーアートを canvas で再生し、enter で本体に入る |
| `public/eye-gate-data.json` | EyeGate の再生データ。元動画から抽出したもので、手で編集しない |
| `public/card-designs.html`・`public/card-print.html` | NFCカードのデザイン |
| `docs/superpowers/` | 設計書（specs）と実装計画（plans）。決めた時点のスナップショットで、現行の仕様はコード |

## 挙動の決めごと

- 初期テーマは URL のハッシュ（`#glitch` など）があればそのテーマ、なければ void。localStorage への保存は続けているが初期判定には使わない
- 配色は `<html data-scheme>`（`light` か `dark`）。保存した値がなければ OS の設定に従う。ライトがあるのは入口と void だけ
- `<html data-gate>`（`open` か `closed`）で入口の開閉を公開している。右上の配色のボタンと void の背景演出はこれを見る
- void の名前の行と bio は英語と日本語の2枚のレイヤーで、カーソルの周りの円の中だけ日本語を見せる
- EyeGate は毎回表示する。JS 無効時は noscript で非表示にし、`prefers-reduced-motion` では静止画にする
- テーマを追加するときは、テーマのコンポーネント、`index.astro` のペイン、`ThemeSwitcher.astro` の `ALLOWED` とボタン、`BaseLayout.astro` の初期判定スクリプトの `allowed` 配列とペインの表示切り替えの CSS をそろえて変更する
- title は `Portfolio | Naoki Yokomachi (yoko/横町直樹)`。名前検索での上位表示を優先したオーナーの判断で氏名を入れている。ほかの検索語は JSON-LD の `alternateName` と meta description に入れる

## ファイルの扱い

- `tmp/`（検証用のスクリーンショットや参照資料）と `.superpowers/`（ビジュアルコンパニオンのモック）は `.gitignore` の対象。コミットしない
