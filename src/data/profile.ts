export type LinkItem = {
  id: string;
  label: string;
  handle: string;
  url: string;
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
  handle: '@n-yokomachi',
  title: 'Software Engineer / AI Engineer',
  location: 'Tokyo, Japan',
  bio: 'I work across stacks, phases, and layers — whatever the problem needs. Currently focused on AWS and AI.',
  bioJa: '課題解決のためなら、技術・フェーズ・レイヤーを問わず何でもやります。今は AWS と AI を中心に。',
  currently: 'AWS / AI',
  avatarUrl: 'https://avatars.githubusercontent.com/u/45911707?v=4',
  githubId: 45911707,
} as const;

export const LINKS: LinkItem[] = [
  { id: 'github',      label: 'GitHub',          handle: 'n-yokomachi',         url: 'https://github.com/n-yokomachi' },
  { id: 'x',           label: 'X',               handle: '@_cityside',          url: 'https://twitter.com/_cityside' },
  { id: 'huggingface', label: 'HuggingFace',     handle: 'yokomachi',           url: 'https://huggingface.co/yokomachi' },
  { id: 'zenn',        label: 'Zenn',            handle: 'yokomachi',           url: 'https://zenn.dev/yokomachi' },
  { id: 'qiita',       label: 'Qiita',           handle: 'yokomachi',           url: 'https://qiita.com/yokomachi' },
  { id: 'devto',       label: 'Dev.to',          handle: 'yokomachi',           url: 'https://dev.to/yokomachi' },
  { id: 'speakerdeck', label: 'SpeakerDeck',     handle: 'yokomachi',           url: 'https://speakerdeck.com/yokomachi' },
  { id: 'linkedin',    label: 'LinkedIn',        handle: 'in/yokomachi',        url: 'https://www.linkedin.com/in/yokomachi/' },
  { id: 'credly',      label: 'Credly',          handle: 'yokomachi',           url: 'https://www.credly.com/users/yokomachi' },
  { id: 'lapras',      label: 'Lapras',          handle: 'yokomachi',           url: 'https://lapras.com/public/yokomachi' },
  { id: 'connpass',    label: 'Connpass',        handle: 'duplicate1984',       url: 'https://connpass.com/user/duplicate1984/' },
  { id: 'figma',       label: 'Figma',           handle: '@yokomachi',          url: 'https://www.figma.com/@yokomachi' },
  { id: '16p',         label: '16Personalities', handle: 'profile',             url: 'https://www.16personalities.com/ja/%E3%83%97%E3%83%AD%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB/ffd619bb32c18' },
  { id: 'duolingo',    label: 'Duolingo',        handle: 'yokomachi1',          url: 'https://www.duolingo.com/profile/yokomachi1' },
  { id: 'bukulog',     label: 'ブクログ',         handle: 'yokomachi1',          url: 'https://booklog.jp/users/yokomachi1' },
  { id: 'filmarks',    label: 'Filmarks',        handle: 'yokomachi',           url: 'https://filmarks.com/users/yokomachi' },
  { id: 'discord',     label: 'Discord',         handle: 'yokomachi',           url: 'https://discordapp.com/users/750727153871618069' },
  { id: 'atcoder',     label: 'AtCoder',         handle: 'yokomachi',           url: 'https://atcoder.jp/users/yokomachi' },
  { id: 'email',       label: 'Email',           handle: 'asterism.mihono',     url: 'mailto:asterism.mihono@gmail.com' },
];

export const OUTPUTS: OutputItem[] = [
  {
    id: 'output-article',
    badge: 'ARTICLE',
    title: 'Strands Agents SkillとAgentCore Code InterpreterでAWSコストの可視化ワークフローを作る',
    subtitle: 'Zenn',
    url: 'https://zenn.dev/yokomachi/articles/202603_code-interpreter-with-strands-agents-skills',
  },
  {
    id: 'output-talk',
    badge: 'TALK',
    title: 'AI Agent Builders Meetup #2',
    subtitle: 'Connpass',
    url: 'https://aibuilders.connpass.com/event/385164/',
  },
  {
    id: 'output-repo',
    badge: 'REPO',
    title: 'n-yokomachi/tonari — An AI agent standing with you',
    subtitle: 'GitHub',
    url: 'https://github.com/n-yokomachi/tonari',
  },
  {
    id: 'output-slide',
    badge: 'SLIDE',
    title: 'Strands Agents × Amazon Bedrock AgentCoreで パーソナルAIエージェントを作ろう',
    subtitle: 'SpeakerDeck',
    url: 'https://speakerdeck.com/yokomachi/building-a-personal-ai-agent-with-strands-agents-x-amazon-bedrock-agentcore-jp',
  },
];
