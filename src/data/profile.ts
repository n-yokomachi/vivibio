export type LinkItem = {
  id: string;
  label: string;
  handle: string;
  url: string;
  // 粒子で文字を描くときの表記。label が日本語などで描きにくいときだけ指定する
  swarmLabel?: string;
  category: 'code' | 'social' | 'writing' | 'talks' | 'creds' | 'design' | 'self' | 'contact';
};

export type OutputItem = {
  id: string;
  badge: 'ARTICLE' | 'TALK' | 'REPO' | 'SLIDE';
  title: string;
  subtitle: string;
  url: string;
};

export const PROFILE = {
  name: 'Naoki Yokomachi',
  nameJa: '横町 直樹',
  handle: 'yoko',
  title: 'Software Engineer / AI Engineer',
  location: 'Tokyo, Japan',
  bio: 'I work across stacks, phases, and layers — whatever the problem needs. Currently focused on AWS and AI. I usually go by yoko.',
  bioJa: '課題解決のためなら、技術・フェーズ・レイヤーを問わず何でもやります。今はAWSとAI分野をメインに扱っています。普段はyokoの名前で活動しています。',
  currently: 'AWS / AI',
  avatarUrl: 'https://avatars.githubusercontent.com/u/45911707?v=4',
  githubId: 45911707,
} as const;

export const CREDENTIALS = [
  'AWS Community Builders : AI Engineering',
  '2026 Japan All AWS Certifications Engineers',
] as const;

export const LINKS: LinkItem[] = [
  { id: 'github',      label: 'GitHub',          handle: 'n-yokomachi',         url: 'https://github.com/n-yokomachi',                                                                          category: 'code'    },
  { id: 'x',           label: 'X',               handle: '@_cityside',          url: 'https://twitter.com/_cityside',                                                                           category: 'social'  },
  { id: 'huggingface', label: 'HuggingFace',     handle: 'yokomachi',           url: 'https://huggingface.co/yokomachi',                                                                        category: 'code'    },
  { id: 'zenn',        label: 'Zenn',            handle: 'yokomachi',           url: 'https://zenn.dev/yokomachi',                                                                              category: 'writing' },
  { id: 'qiita',       label: 'Qiita',           handle: 'yokomachi',           url: 'https://qiita.com/yokomachi',                                                                             category: 'writing' },
  { id: 'devto',       label: 'Dev.to',          handle: 'yokomachi',           url: 'https://dev.to/yokomachi',                                                                                category: 'writing' },
  { id: 'speakerdeck', label: 'SpeakerDeck',     handle: 'yokomachi',           url: 'https://speakerdeck.com/yokomachi',                                                                       category: 'talks'   },
  { id: 'linkedin',    label: 'LinkedIn',        handle: 'in/yokomachi',        url: 'https://www.linkedin.com/in/yokomachi/',                                                                  category: 'social'  },
  { id: 'note',        label: 'note',            handle: '_cityside',           url: 'https://note.com/_cityside',                                                                              category: 'writing' },
  { id: 'credly',      label: 'Credly',          handle: 'yokomachi',           url: 'https://www.credly.com/users/yokomachi',                                                                  category: 'creds'   },
  { id: 'lapras',      label: 'Lapras',          handle: 'yokomachi',           url: 'https://lapras.com/public/yokomachi',                                                                     category: 'creds'   },
  { id: 'connpass',    label: 'Connpass',        handle: 'duplicate1984',       url: 'https://connpass.com/user/duplicate1984/',                                                                category: 'talks'   },
  { id: 'figma',       label: 'Figma',           handle: '@yokomachi',          url: 'https://www.figma.com/@yokomachi',                                                                        category: 'design'  },
  { id: '16p',         label: '16Personalities', handle: 'profile',             url: 'https://www.16personalities.com/ja/%E3%83%97%E3%83%AD%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB/ffd619bb32c18', category: 'self'    },
  { id: 'duolingo',    label: 'Duolingo',        handle: 'yokomachi1',          url: 'https://www.duolingo.com/profile/yokomachi1',                                                             category: 'self'    },
  { id: 'bukulog',     label: 'ブクログ',         handle: 'yokomachi1',          url: 'https://booklog.jp/users/yokomachi1',                                                                     category: 'self', swarmLabel: 'BOOKLOG' },
  { id: 'filmarks',    label: 'Filmarks',        handle: 'yokomachi',           url: 'https://filmarks.com/users/yokomachi',                                                                    category: 'self'    },
  { id: 'discord',     label: 'Discord',         handle: 'yokomachi',           url: 'https://discordapp.com/users/750727153871618069',                                                         category: 'social'  },
  { id: 'email',       label: 'Email',           handle: 'asterism.mihono',     url: 'mailto:asterism.mihono@gmail.com',                                                                        category: 'contact' },
];

export const OUTPUTS: OutputItem[] = [
  {
    id: 'output-article',
    badge: 'ARTICLE',
    title: 'Jevを自作感情エンジンに組み込んでLLMと性能を比べてみた',
    subtitle: 'Zenn',
    url: 'https://zenn.dev/yokomachi/articles/202609_jev-affectus',
  },
  {
    id: 'output-talk',
    badge: 'TALK',
    title: 'Tokyo | Claude Code Meetup',
    subtitle: 'Luma',
    url: 'https://luma.com/claude-7fyk?tk=nAq1Qj',
  },
  {
    id: 'output-repo',
    badge: 'REPO',
    title: 'n-yokomachi/cadenza — A Claude Code plugin for phased technical-output creation',
    subtitle: 'GitHub',
    url: 'https://github.com/n-yokomachi/cadenza',
  },
  {
    id: 'output-slide',
    badge: 'SLIDE',
    title: '正しさだけではプロジェクトは進まないから | Become an AI Agent Orchestration Engineer',
    subtitle: 'SpeakerDeck',
    url: 'https://speakerdeck.com/yokomachi/become-an-ai-agent-orchestration-engineer',
  },
];
