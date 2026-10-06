// Nook Mascot Universe — Multi-Species Cute Mascot System
// 65+ Authentic Spritesheet Characters & Companions from https://github.com/r2dapps/cute-mascot

export const CUTE_MASCOT_IDS = [
  'afro', 'astronaut', 'bald', 'ballerina', 'bear', 'beard', 'builder', 'bunny',
  'cap', 'cat', 'chef', 'clockwork', 'crt', 'cube', 'deer', 'dino', 'droid',
  'drone', 'fox', 'fox-ink', 'fox-paper', 'fox-pixel', 'fox-riso', 'fox-sketch',
  'frog', 'gearbot', 'glasses', 'grandpa', 'granny', 'granny-paper', 'hamster',
  'hedgehog', 'hijabi', 'hijabi-paper', 'kamran', 'knight', 'knight-paper', 'koala',
  'lantern', 'mouse', 'nurse', 'otter', 'owl', 'panda', 'panda-paper', 'penguin',
  'pirate', 'postbot', 'postbot-paper', 'pug', 'raccoon', 'radio', 'redpanda',
  'robot', 'rocket', 'scientist', 'scout', 'sheep', 'sikh', 'skater', 'sloth',
  'tiger', 'toaster', 'tv', 'wizard'
] as const;

export type CuteMascotId = typeof CUTE_MASCOT_IDS[number];
export type MascotCategory = 'all' | 'animals' | 'people' | 'bots' | 'paper' | 'classic';

export type MascotSpecies = 
  | 'pip' | 'kiko' | 'milo' | 'boba' | 'nori' | 'aero' | 'nova'
  | CuteMascotId
  | string;

export interface MascotProfile {
  id: MascotSpecies;
  name: string;
  speciesName: string;
  category: MascotCategory;
  tagline: string;
  avatarIcon: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  abilityId: string;
  abilityName: string;
  abilityIcon: string;
  abilityDescription: string;
  hasSpriteSheet: boolean;
  defaultSound?: 'boop' | 'sparkle' | 'blush' | 'dizzy' | 'sleepy' | 'teleport';
  voicePitch: number;
  voiceRate: number;
}

// Category mappings
const CATEGORY_MAP: Record<string, MascotCategory> = {
  // Animals
  bear: 'animals', bunny: 'animals', cat: 'animals', deer: 'animals', dino: 'animals',
  fox: 'animals', frog: 'animals', hamster: 'animals', hedgehog: 'animals', koala: 'animals',
  mouse: 'animals', otter: 'animals', owl: 'animals', panda: 'animals', penguin: 'animals',
  pug: 'animals', raccoon: 'animals', redpanda: 'animals', sheep: 'animals', sloth: 'animals',
  tiger: 'animals',
  // People & Roles
  afro: 'people', astronaut: 'people', bald: 'people', ballerina: 'people', beard: 'people',
  builder: 'people', cap: 'people', chef: 'people', glasses: 'people', grandpa: 'people',
  granny: 'people', hijabi: 'people', kamran: 'people', knight: 'people', nurse: 'people',
  pirate: 'people', scientist: 'people', scout: 'people', sikh: 'people', skater: 'people',
  wizard: 'people',
  // Bots & Gadgets
  clockwork: 'bots', crt: 'bots', cube: 'bots', droid: 'bots', drone: 'bots',
  gearbot: 'bots', lantern: 'bots', postbot: 'bots', radio: 'bots', robot: 'bots',
  rocket: 'bots', toaster: 'bots', tv: 'bots',
  // Paper & Art styles
  'fox-ink': 'paper', 'fox-paper': 'paper', 'fox-pixel': 'paper', 'fox-riso': 'paper',
  'fox-sketch': 'paper', 'granny-paper': 'paper', 'hijabi-paper': 'paper',
  'knight-paper': 'paper', 'panda-paper': 'paper', 'postbot-paper': 'paper'
};

const ICONS_MAP: Record<string, string> = {
  bear: '🐻', bunny: '🐰', cat: '🐱', deer: '🦌', dino: '🦖', fox: '🦊', frog: '🐸',
  hamster: '🐹', hedgehog: '🦔', koala: '🐨', mouse: '🐭', otter: '🦦', owl: '🦉',
  panda: '🐼', penguin: '🐧', pug: '🐶', raccoon: '🦝', redpanda: '🐾', sheep: '🐑',
  sloth: '🦥', tiger: '🐯', afro: '🕺', astronaut: '👨‍🚀', bald: '🧑‍🦲', ballerina: '🩰',
  beard: '🧔', builder: '👷', cap: '🧢', chef: '👨‍🍳', glasses: '👓', grandpa: '👴',
  granny: '👵', hijabi: '🧕', kamran: '👨‍💻', knight: '🛡️', nurse: '🩺', pirate: '🏴‍☠️',
  scientist: '🔬', scout: '🏕️', sikh: '👳', skater: '🛹', wizard: '🧙',
  clockwork: '⚙️', crt: '📺', cube: '🎲', droid: '🤖', drone: '🛸', gearbot: '🦾',
  lantern: '🏮', postbot: '📬', radio: '📻', robot: '🤖', rocket: '🚀', toaster: '🍞',
  tv: '📺', 'fox-ink': '🖋️', 'fox-paper': '📜', 'fox-pixel': '👾', 'fox-riso': '🎨',
  'fox-sketch': '✏️', 'granny-paper': '👵', 'hijabi-paper': '🧕', 'knight-paper': '⚔️',
  'panda-paper': '🐼', 'postbot-paper': '✉️'
};

const COLOR_PALETTES: Record<string, { primary: string; secondary: string; accent: string }> = {
  fox: { primary: '#F77F00', secondary: '#FFF1E6', accent: '#D62828' },
  cat: { primary: '#D8B4E2', secondary: '#F3E8FF', accent: '#9333EA' },
  robot: { primary: '#06B6D4', secondary: '#0F172A', accent: '#38BDF8' },
  bunny: { primary: '#F472B6', secondary: '#FDF2F8', accent: '#EC4899' },
  dino: { primary: '#10B981', secondary: '#ECFDF5', accent: '#059669' },
  frog: { primary: '#84CC16', secondary: '#F7FEE7', accent: '#65A30D' },
  panda: { primary: '#334155', secondary: '#F8FAFC', accent: '#0EA5E9' },
  bear: { primary: '#92400E', secondary: '#FEF3C7', accent: '#D97706' },
  wizard: { primary: '#8B5CF6', secondary: '#EDE9FE', accent: '#6D28D9' },
  astronaut: { primary: '#3B82F6', secondary: '#EFF6FF', accent: '#1D4ED8' }
};

const DEFAULT_PALETTE = { primary: '#E07A5F', secondary: '#FDF6EE', accent: '#C9664E' };

export const formatCharName = (id: string): string => {
  return id
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// 1. Classic Nook Companions
const CLASSIC_ROSTER: MascotProfile[] = [
  {
    id: 'pip',
    name: 'Pip',
    speciesName: 'Mochi Dumpling',
    category: 'classic',
    tagline: 'Quiet, squishy dumpling companion.',
    avatarIcon: '🥟',
    primaryColor: '#F5E6D3',
    secondaryColor: '#F2C4A8',
    accentColor: '#E07A5F',
    abilityId: 'action-hunt',
    abilityName: 'Action Item Hunter',
    abilityIcon: '🎯',
    abilityDescription: 'Automatically tracks, categorizes, and celebrates completed meeting action items.',
    hasSpriteSheet: false,
    defaultSound: 'boop',
    voicePitch: 1.3,
    voiceRate: 1.05,
  },
  {
    id: 'kiko',
    name: 'Kiko',
    speciesName: 'Kitsune Fox',
    category: 'animals',
    tagline: 'Alert orange fox with fluffy tail.',
    avatarIcon: '🦊',
    primaryColor: '#F77F00',
    secondaryColor: '#FFF1E6',
    accentColor: '#D62828',
    abilityId: 'tldr',
    abilityName: 'Instant TL;DR',
    abilityIcon: '⚡',
    abilityDescription: 'Whispers an instant executive recap of recent discussions.',
    hasSpriteSheet: true,
    defaultSound: 'sparkle',
    voicePitch: 1.2,
    voiceRate: 1.15,
  },
  {
    id: 'milo',
    name: 'Milo',
    speciesName: 'Calico Boba Cat',
    category: 'animals',
    tagline: 'Gentle lavender cat with twitching ears.',
    avatarIcon: '🐱',
    primaryColor: '#D8B4E2',
    secondaryColor: '#F3E8FF',
    accentColor: '#9333EA',
    abilityId: 'focus-shield',
    abilityName: 'Focus Shield (DND)',
    abilityIcon: '🌙',
    abilityDescription: 'Mutes all system alerts for peaceful focus sessions.',
    hasSpriteSheet: true,
    defaultSound: 'sleepy',
    voicePitch: 1.1,
    voiceRate: 0.95,
  },
  {
    id: 'boba',
    name: 'Boba',
    speciesName: 'Matcha Tree Frog',
    category: 'animals',
    tagline: 'Bouncy frog wearing a lotus leaf cap.',
    avatarIcon: '🐸',
    primaryColor: '#80B918',
    secondaryColor: '#D4E09B',
    accentColor: '#55A630',
    abilityId: 'coffee-break',
    abilityName: 'Hydration Chime',
    abilityIcon: '☕',
    abilityDescription: 'Prompts stretch & hydration intervals during long recordings.',
    hasSpriteSheet: true,
    defaultSound: 'blush',
    voicePitch: 0.9,
    voiceRate: 1.0,
  },
  {
    id: 'nori',
    name: 'Nori',
    speciesName: 'Tuxedo Penguin',
    category: 'animals',
    tagline: 'Dapper navy penguin with waddling flippers.',
    avatarIcon: '🐧',
    primaryColor: '#1E293B',
    secondaryColor: '#F8FAFC',
    accentColor: '#0EA5E9',
    abilityId: 'obsidian-export',
    abilityName: 'Obsidian Markdown Sync',
    abilityIcon: '📓',
    abilityDescription: 'Compiles clean frontmatter markdown notes into your local vault.',
    hasSpriteSheet: true,
    defaultSound: 'sparkle',
    voicePitch: 1.0,
    voiceRate: 1.1,
  },
  {
    id: 'aero',
    name: 'Aero',
    speciesName: 'Cyber Orb Drone',
    category: 'bots',
    tagline: 'Neon cybernetic drone with LED expressions.',
    avatarIcon: '🤖',
    primaryColor: '#06B6D4',
    secondaryColor: '#0F172A',
    accentColor: '#38BDF8',
    abilityId: 'deep-synthesis',
    abilityName: 'Ollama Deep Synthesis',
    abilityIcon: '🧠',
    abilityDescription: 'Runs local Qwen/Llama multi-pass logical synthesis.',
    hasSpriteSheet: true,
    defaultSound: 'teleport',
    voicePitch: 1.4,
    voiceRate: 1.2,
  },
  {
    id: 'nova',
    name: 'Nova',
    speciesName: 'Cosmic Star Bunny',
    category: 'animals',
    tagline: 'Pastel lilac rabbit with celestial star ears.',
    avatarIcon: '🐰',
    primaryColor: '#F472B6',
    secondaryColor: '#FDF2F8',
    accentColor: '#EC4899',
    abilityId: 'brainstorm',
    abilityName: 'Brainstorm Spark',
    abilityIcon: '✨',
    abilityDescription: 'Offers creative prompts and counter-perspectives.',
    hasSpriteSheet: true,
    defaultSound: 'sparkle',
    voicePitch: 1.5,
    voiceRate: 1.05,
  },
];

// 2. Generate 65 Cute-Mascot Profiles
const GENERATED_CUTE_MASCOTS: MascotProfile[] = CUTE_MASCOT_IDS.map((id) => {
  const category = CATEGORY_MAP[id] || 'animals';
  const name = formatCharName(id);
  const icon = ICONS_MAP[id] || '✨';
  const palette = COLOR_PALETTES[id] || DEFAULT_PALETTE;

  let abilityName = 'Meeting Presence';
  let abilityIcon = '✨';
  let abilityDesc = 'Keeps you mindful, focused, and calm during long meetings.';
  let sound: MascotProfile['defaultSound'] = 'boop';

  if (category === 'animals') {
    abilityName = 'Calm Heartbeat';
    abilityIcon = '🐾';
    abilityDesc = 'Spawns soothing tactile feedback and purrs during tense debates.';
    sound = 'blush';
  } else if (category === 'bots') {
    abilityName = 'Zero-Telemetry Sentinel';
    abilityIcon = '⚡';
    abilityDesc = 'Guards your mic and local storage against network exfiltration.';
    sound = 'teleport';
  } else if (category === 'people') {
    abilityName = 'Colleague Co-Pilot';
    abilityIcon = '🤝';
    abilityDesc = 'Observes key speakers and tags assignments to specific humans.';
    sound = 'boop';
  } else if (category === 'paper') {
    abilityName = 'Obsidian Origami';
    abilityIcon = '📜';
    abilityDesc = 'Formats markdown transcripts with clean callouts and tags.';
    sound = 'sparkle';
  }

  return {
    id,
    name,
    speciesName: `${name} ${category === 'bots' ? 'Unit' : 'Companion'}`,
    category,
    tagline: `Sweet ${name.toLowerCase()} companion for your desktop notch.`,
    avatarIcon: icon,
    primaryColor: palette.primary,
    secondaryColor: palette.secondary,
    accentColor: palette.accent,
    abilityId: `ability-${id}`,
    abilityName,
    abilityIcon,
    abilityDescription: abilityDesc,
    hasSpriteSheet: true,
    defaultSound: sound,
    voicePitch: 1.1 + (id.length % 5) * 0.1,
    voiceRate: 1.0 + (id.length % 3) * 0.05,
  };
});

// Deduplicate roster ensuring all 65 cute mascots + classics are present
const existingIds = new Set(CLASSIC_ROSTER.map((m) => m.id));
export const MASCOT_ROSTER: MascotProfile[] = [
  ...CLASSIC_ROSTER,
  ...GENERATED_CUTE_MASCOTS.filter((m) => !existingIds.has(m.id)),
];
