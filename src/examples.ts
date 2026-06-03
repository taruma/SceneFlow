export interface Example {
  id: string;
  title: string;
  path: string;
  description: string;
  releaseDate?: string;
  tags?: string[];
  volume?: string;
  featured?: boolean;
}

export interface ExampleSection {
  label: string;
  icon?: string;
  items: Example[];
}

export const EXAMPLE_SECTIONS: ExampleSection[] = [
  {
    label: "AI Scenes",
    icon: "film",
    items: [
      {
        id: 'expansion',
        title: 'The Expansion',
        path: '/example_the_expansion.json',
        description: 'An astrophysicist uses the principles of cosmic expansion to physically map the growing, unbridgeable distance between himself and the world around him.',
        releaseDate: '2026-03-03',
        tags: ['classic auteur', 'dreamina', 'seedance 2.0'],
        featured: true
      },
      {
        id: 'intent',
        title: 'Intent Over Rules',
        path: '/example_intent_over_rules.json',
        description: 'Two mathematicians face the reality of an AI that has evolved past rigid rules into actual reasoning',
        releaseDate: '2026-03-01',
        tags: ['classic auteur', 'dreamina', 'seedance 2.0']
      },
      {
        id: 'mosaic',
        title: 'Mosaic',
        path: '/example_mosaic.json',
        description: 'Two university colleagues walk down a classic academic corridor while discussing a newly published machine learning paper.',
        releaseDate: '2026-03-20',
        tags: ['classic auteur', 'dreamina', 'seedance 2.0']
      },
      {
        id: 'invasion',
        title: '🐸 Frog Invasion',
        path: '/example_frog_invasion.json',
        description: 'The terrifyingly funny future where you can get kicked off your own couch for having bad engagement metrics.',
        releaseDate: '2026-03-24',
        tags: ['classic auteur', 'dreamina', 'seedance 2.0']
      },
      {
        id: 'the_distance',
        title: 'The Distance',
        path: 'https://gist.githubusercontent.com/taruma/c8da62882754be561c4b69a2e06ec9ae/raw/b8a2db467340ab1cf87a784863bacbfed231a0dc/the_distance_sceneflow.json',
        description: 'The hardest distance to close is the one between two people in the same room.',
        releaseDate: '2026-04-14',
        tags: ['classic auteur', 'invideo', 'seedance 2.0']
      },
      {
        id: 'not_about_fish',
        title: 'Not About Fish',
        path: '/not_about_fish.json',
        description: 'Every guy has that one friend who takes dream interpretation way too seriously. Robert is definitely not that guy.',
        releaseDate: '2026-05-22',
        tags: ['auteur brief', 'invideo', 'seedance 2.0', 'AgentOne']
      },
      {
        id: 'afraid',
        title: 'Afraid',
        path: '/afraid.json',
        description: 'She thought their trip to Venice was a perfect fairy tale. She didn\'t know he was carrying a reality-shattering truth the entire time.',
        releaseDate: '2026-05-24',
        tags: ['auteur brief', 'invideo', 'seedance 2.0', 'AgentOne'],
        featured: true
      }
    ]
  },
  {
    label: "The Written Motion",
    icon: "notebook",
    items: [
      {
        id: 'twm_vol1',
        title: 'The Breaking Point',
        path: '/twm_vol1_the_breaking_point.json',
        description: 'When the world around you collapses into chaos, who is the one person you trust to pull you out?',
        releaseDate: '2026-04-06',
        volume: 'TWM: Volume 1',
        tags: ['classic auteur', 'dreamina', 'seedance 2.0']
      },
      {
        id: 'twm_vol2',
        title: 'Elemental Forces',
        path: '/twm_vol2_elemental_forces.json',
        description: 'He didn\'t just bend the rules of combat—he bent the entire universe.',
        releaseDate: '2026-04-12',
        volume: 'TWM: Volume 2',
        tags: ['classic auteur', 'dreamina', 'seedance 2.0']
      },
      {
        id: 'twm_vol3',
        title: 'Kinetic',
        path: '/twm_vol3_kinetic.json',
        description: 'From mountain peaks to ocean barrels: this is pure human momentum.',
        releaseDate: '2026-04-18',
        volume: 'TWM: Volume 3',
        tags: ['auteur brief', 'openart', 'seedance 2.0']
      },
      {
        id: 'twm_vol4',
        title: 'Wayfarers',
        path: '/twm_vol4_wayfarers.json',
        description: 'One traveler. A million lives. Welcome to the multiverse.',
        releaseDate: '2026-05-03',
        volume: 'TWM: Volume 4',
        tags: ['auteur brief', 'dreamina', 'seedance 2.0']
      },
      {
        id: 'twm_vol5',
        title: 'Fractures',
        path: '/twm_vol5_fractures.json',
        description: 'Heavy hearts and neon lights: a moody vignette of characters trapped in their own personal midnights.',
        releaseDate: '2026-05-12',
        volume: 'TWM: Volume 5',
        tags: ['auteur brief', 'dreamina', 'seedance 2.0'],
        featured: true
      }
    ]
  },
  {
    label: "FRAME Series",
    icon: "book-open",
    items: [
      {
        id: 'frame_01',
        title: 'Distant',
        path: '/frame_01.json',
        description: 'A series of expressive, wordless vignettes capturing characters navigating moments of quiet drama, love, and isolation.',
        releaseDate: '2026-01-25',
        volume: 'FRAME_01',
        tags: ['visual exploration', 'nano banana pro', 'kling 2.6', 'klingai']
      },
      {
        id: 'frame_02',
        title: 'Wandering Souls',
        path: '/frame_02.json',
        description: 'A series of moody, realistic vignettes capturing moments of intense sorrow, fear, joy, and quiet contemplation.',
        releaseDate: '2026-01-27',
        volume: 'FRAME_02',
        tags: ['visual exploration', 'nano banana pro', 'kling 2.6', 'openart']
      },
      {
        id: 'frame_03',
        title: 'Relics of Time',
        path: '/frame_03.json',
        description: 'A visual compilation of cinematic, steampunk-inspired fantasy scenes depicting isolation, industry, and human emotion.',
        releaseDate: '2026-02-01',
        volume: 'FRAME_03',
        tags: ['visual exploration', 'nano banana pro', 'kling 2.6', 'openart']
      },
      {
        id: 'frame_04',
        title: 'Where Am I?',
        path: '/frame_04.json',
        description: 'A disoriented protagonist wakes up in a brutalist courtyard after enduring a series of chaotic and extreme environmental shifts.',
        releaseDate: '2026-02-08',
        volume: 'FRAME_04',
        tags: ['visual exploration', 'nano banana pro', 'kling 3.0', 'klingai']
      },
      {
        id: 'frame_05',
        title: 'Old Growth',
        path: '/frame_05.json',
        description: 'A poignant exploration of grief, tracking the precise moment a heavy emotional fog gives way to clarity and breath.',
        releaseDate: '2026-02-22',
        volume: 'FRAME_05',
        tags: ['visual poem', 'nano banana pro', 'kling 2.6', 'invideo'],
        featured: true
      },
      {
        id: 'frame_06',
        title: 'Forgotten',
        path: '/frame_06.json',
        description: 'A beautifully melancholic sequence of distinct visual vignettes exploring themes of isolation, passage, and memory across vast natural and architectural landscapes.',
        releaseDate: '2026-02-26',
        volume: 'FRAME_06',
        tags: ['visual exploration', 'nano banana pro', 'kling 2.6', 'invideo']
      },
      {
        id: 'frame_07',
        title: 'Samsara',
        path: '/frame_07.json',
        description: 'An artistic observation on how human grief and resilience look identical whether in ancient feudal Japan, medieval times, or a dystopian future.',
        releaseDate: '2026-03-15',
        volume: 'FRAME_07',
        tags: ['visual exploration', 'nano banana pro', 'kling 2.6', 'kling 3.0', 'invideo']
      },
      {
        id: 'frame_08',
        title: 'Still, Restless',
        path: '/frame_08.json',
        description: 'A philosophical reflection on human purpose, questioning if our architectural achievements have caused us to forget why we are here.',
        releaseDate: '2026-03-30',
        volume: 'FRAME_08',
        tags: ['visual poem', 'nano banana pro', 'nano banana 2', 'kling 3.0', 'invideo']
      }
    ]
  },
  {
    label: "AI Clips",
    icon: "clapperboard",
    items: [
      {
        id: 'wild_kinship',
        title: 'Wild Kinship',
        path: '/wild_kinship.json',
        description: 'Through every dimension, every danger, and every heartbreak—we run together.',
        releaseDate: '2026-04-25',
        tags: ['auteur brief', 'openart', 'seedance 2.0']
      },
      {
        id: 'duet_of_distance',
        title: 'A Duet of Distance',
        path: '/duet_of_distance.json',
        description: 'When traditional elegance meets modern regret on the grandest stage.',
        releaseDate: '2026-05-04',
        tags: ['auteur brief', 'dreamina', 'seedance 2.0']
      },
      {
        id: 'vibe_shift',
        title: 'Vibe Shift',
        path: '/vibe_shift.json',
        description: 'Late-night neon glows, retro train rides, and a sunset that stands completely still. Experience the ultimate late-night mood shift.',
        releaseDate: '2026-05-05',
        tags: ['auteur brief', 'dreamina', 'seedance 2.0']
      },
      {
        id: 'reality_bending',
        title: "Reality-Bending Video",
        path: '/reality_bending.json',
        description: "Want to create mind-blowing videos? Here are the best visual effects tricks to completely transform your content.",
        releaseDate: '2026-05-07',
        tags: ['auteur brief', 'dreamina', 'seedance 2.0'],
        featured: true
      },
      {
        id: 'table_four',
        title: 'Table Four',
        path: '/table_four.json',
        description: 'A comforting plate of freshly cut chanterelle pasta brings an unexpected wave of grief and longing.',
        releaseDate: '2026-04-13',
        tags: ['classic auteur', 'auteur brief', 'invideo', 'seedance 2.0']
      },
      {
        id: 'flat_frog_problems',
        title: 'Flat Frog Problems',
        path: '/flat_frog_problems.json',
        description: 'The robot vacuum is officially his archenemy. This 2D frog is definitely not a fan of the third dimension.',
        releaseDate: '2026-04-22',
        tags: ['auteur brief', 'invideo', 'seedance 2.0']
      },
      {
        id: 'the_magic_card',
        title: 'The Magic Card',
        path: '/ai_clips_magic_card.json',
        description: 'The ritual begins by activating an ancient golden seal in the pouring rain and ends with snaring a floating mystical card high above the city.',
        releaseDate: '2026-06-03',
        tags: ['auteur brief', 'openart', 'seedance 2.0']
      }
    ]
  }
];
