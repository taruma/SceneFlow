export interface Example {
  id: string;
  title: string;
  path: string;
  description: string;
}

export const EXAMPLES: Example[] = [
  { 
    id: 'expansion', 
    title: 'The Expansion', 
    path: '/example_the_expansion.json', 
    description: 'The Space Between' 
  },
  { 
    id: 'intent', 
    title: 'Intent Over Rules', 
    path: '/example_intent_over_rules_sceneflow.json', 
    description: 'The Illusion of Control' 
  },
];
