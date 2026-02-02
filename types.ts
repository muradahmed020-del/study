
export interface Challenge {
  type: 'math' | 'riddle' | 'word';
  question: string;
  answer: string;
  hint: string;
}

export interface ProgressData {
  day: string;
  score: number;
}

export interface Gift {
  id: string;
  name: string;
  emoji: string;
  requiredCorrect: number;
  unlocked: boolean;
  description: string;
}

export enum AppSection {
  HOME = 'home',
  CHALLENGE = 'challenge',
  CLASSROOM = 'classroom',
  ASK = 'ask',
  LEARN_BANGLA = 'learn_bangla',
  LEARN_MATH = 'learn_math',
  LEARN_SCIENCE = 'learn_science',
  LEARN_HISTORY = 'learn_history',
  LEARN_ENGLISH = 'learn_english',
  LEARN_SPACE = 'learn_space',
  LEARN_ANIMALS = 'learn_animals',
  LEARN_MORAL = 'learn_moral',
  COLLECTION = 'collection'
}
