
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

export interface Message {
  role: 'user' | 'bot';
  text: string;
}

export enum AppSection {
  HOME = 'home',
  CHALLENGE = 'challenge',
  CLASSROOM = 'classroom',
  ASK = 'ask',
  LEARN_BANGLA = 'learn_bangla',
  LEARN_MATH = 'learn_math',
  LEARN_SCIENCE = 'learn_science',
  LEARN_HISTORY = 'learn_history'
}
