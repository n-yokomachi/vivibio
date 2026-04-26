# vivibio – Minimal テーマ実装設計

_Date: 2026-04-26_

## 概要

NFCカードに書き込んで配布する個人自己紹介サイト `vivibio` の **Minimal テーマ**を実装する。
Claude Design (claude.ai/design) で作成されたプロトタイプの Minimal バリアントを、Astro + TypeScript で再構築し、Cloudflare Pages にデプロイする。

## 技術スタック

| 項目 | 採用 |
|---|---|
| フレームワーク | Astro |
| 言語 | TypeScript |
| ホスティング | Cloudflare Pages |
| パッケージマネージャ | npm |

プロトタイプは React + Babel UMD だが、Minimal テーマは静的コンテンツ＋ホバー効果のみで動的要素が不要なため、純粋な Astro コンポーネント（`.astro`）で実装する。React アイランドは不要。

## ビジュアル仕様

### カラーパレット
- 背景: `#f7f6f3`（暖色オフホワイト）
- 文字: `#1a1a1a`
- アクセント: `#ff5733`
- ボーダー: `rgba(26,26,26,.1)` 系
- ミュート文字: `rgba(26,26,26,.5)` / `.7`

### タイポグラフィ
- Sans: Inter（400-900）
- Mono: JetBrains Mono（400, 500, 700）
- Google Fonts CDN から読み込み

### レイアウト
- max-width: 640px、中央寄せ
- padding: `28px 22px 64px`
- スマホファースト、PC でも崩れない

## 画面構成

### 1. トップバー
- 左: GitHubアバター画像（円形、32px）+ ハンドル `@n-yokomachi`（mono）
- 右: **ステータス表示は削除**

### 2. ヒーロー
- アイブロウ: `— hello,`
- 大見出し: `I'm Naoki Yokomachi.` + `A software engineer / AI engineer.`（イタリック・ミュート）
- 英語Bio + 日本語Bio
- メタ情報: Based in / Currently（**Pronouns 削除**）

### 3. Links セクション
- ヘッダー: "Links" + 件数（`19`）
- グリッド: `auto-fill, minmax(110px, 1fr)`
- 各カード: SVGアイコン + ラベル
- ホバー: `translateY(-2px)` + 軽い影

### 4. Output セクション（旧 Now を改修）
- ヘッダー: "Output" + 今日の日付
- **カードリスト形式**（縦積み）
- 4枚: ARTICLE / TALK / REPO / SLIDE
- 各カード: バッジ + タイトル + サブテキスト（公開日・サイト名等）+ クリックでリンク先へ
- 初期は仮データ、後で実コンテンツに差し替え

### 5. フッター
- 左: ハンドル
- 中央: アクセントドット（`#ff5733`）
- 右: ©年

## データ構造

`src/data/profile.ts` に集約：

```ts
export const PROFILE = {
  name, nameJa, handle,
  title,
  location,
  bio, bioJa,
  avatarUrl,           // GitHubアバター
  githubId,            // 45911707
};

export const LINKS: LinkItem[] = [...];  // 19件
export const OUTPUTS: OutputItem[] = [...];  // 4件 (placeholder)
```

### LINKS データ（実データ19件）

| id | label | handle | url |
|---|---|---|---|
| github | GitHub | n-yokomachi | https://github.com/n-yokomachi |
| x | X | @_cityside | https://twitter.com/_cityside |
| huggingface | HuggingFace | yokomachi | https://huggingface.co/yokomachi |
| zenn | Zenn | yokomachi | https://zenn.dev/yokomachi |
| qiita | Qiita | yokomachi | https://qiita.com/yokomachi |
| devto | Dev.to | yokomachi | https://dev.to/yokomachi |
| speakerdeck | SpeakerDeck | yokomachi | https://speakerdeck.com/yokomachi |
| linkedin | LinkedIn | yokomachi | https://www.linkedin.com/in/yokomachi/ |
| credly | Credly | yokomachi | https://www.credly.com/users/yokomachi |
| lapras | Lapras | yokomachi | https://lapras.com/public/yokomachi |
| connpass | Connpass | duplicate1984 | https://connpass.com/user/duplicate1984/ |
| figma | Figma | yokomachi | https://www.figma.com/@yokomachi |
| 16p | 16Personalities | - | https://www.16personalities.com/ja/プロフィール/ffd619bb32c18 |
| duolingo | Duolingo | yokomachi1 | https://www.duolingo.com/profile/yokomachi1 |
| bukulog | ブクログ | yokomachi1 | https://booklog.jp/users/yokomachi1 |
| filmarks | Filmarks | yokomachi | https://filmarks.com/users/yokomachi |
| discord | Discord | - | https://discordapp.com/users/750727153871618069 |
| atcoder | AtCoder | yokomachi | https://atcoder.jp/users/yokomachi |
| email | Email | asterism.mihono@gmail.com | mailto:asterism.mihono@gmail.com |

## SVG アイコン

プロトタイプの SVG はモノグラム的で品質にばらつきがあるため、**全 19 個を新規に再設計**する。

### デザイン規約
- viewBox: `0 0 24 24`
- size: 22×22
- fill: `currentColor`
- stroke-width: 1.6（線画系の場合）
- 各ブランドの公式マークやロゴモチーフを参考にしつつ、太さ・シルエットの統一感を優先
- 小さく描画されても識別できる単純化

### 対象アイコン（19種）
GitHub, X, HuggingFace, Zenn, Qiita, Dev.to, SpeakerDeck, LinkedIn, Credly, Lapras, Connpass, Figma, 16Personalities, Duolingo, ブクログ, Filmarks, Discord, AtCoder, Email

実装は `src/components/icons/` 以下に各アイコン1ファイル、または1つの `LinkIcons.astro` に集約。

## ファイル構成

```
vivibio/
├── README.md / README.en.md / LICENSE  (作成済み)
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── public/
│   └── favicon.svg
├── src/
│   ├── data/
│   │   └── profile.ts            # PROFILE / LINKS / OUTPUTS
│   ├── components/
│   │   ├── icons/
│   │   │   └── LinkIcons.astro   # 19個のSVGアイコン
│   │   ├── TopBar.astro
│   │   ├── Hero.astro
│   │   ├── Links.astro
│   │   ├── Output.astro
│   │   └── Footer.astro
│   ├── layouts/
│   │   └── BaseLayout.astro      # フォント読み込み・base CSS
│   ├── styles/
│   │   └── minimal.css           # Minimal テーマ専用CSS
│   └── pages/
│       └── index.astro
└── wrangler.toml or _routes.json # Cloudflare Pages 設定
```

## デプロイ

- ビルド: `npm run build` → `dist/`
- Cloudflare Pages: `dist/` を静的配信
- カスタムドメインは後日設定

## 範囲外（Out of scope）

- Particles / Cyber / Glitch などの他テーマ
- テーマ切替UI、Tweaksパネル、ジャイロ反応、タップ波紋
- ダークモード切替（Minimal は元々ライト基調なので不要）
- 多言語切替（Bio に英語/日本語両方併記する方式で対応済み）
- 認証・DB・マルチユーザー対応
