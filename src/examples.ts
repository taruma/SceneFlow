export interface Example {
  id: string;
  title: string;
  path: string;
  description: string;
}

export interface ExampleSection {
  label: string;
  items: Example[];
}

export const EXAMPLE_SECTIONS: ExampleSection[] = [
  {
    label: "AI Short Film",
    items: [
      { 
        id: 'expansion', 
        title: 'The Expansion', 
        path: '/example_the_expansion.json', 
        description: 'The Space Between' 
      },
      { 
        id: 'intent', 
        title: 'Intent Over Rules', 
        path: '/example_intent_over_rules.json', 
        description: 'The Illusion of Control' 
      },
      { 
        id: 'mosaic', 
        title: 'Mosaic', 
        path: '/example_mosaic.json', 
        description: 'Logic of the Grid' 
      },
      { 
        id: 'invasion', 
        title: '🐸 Invasion', 
        path: '/example_frog_invasion.json', 
        description: 'The Optimized Self' 
      },
    ]
  },
  {
    label: "The Written Motion",
    items: [
      {
        id: 'twm_vol1',
        title: 'Volume 1',
        path: '/twm_vol1_the_breaking_point.json',
        description: 'The Breaking Point'
      }
    ]
  }
];
