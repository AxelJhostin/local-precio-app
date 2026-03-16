export const DIGIT_TO_CODE = {
  "0": "S",
  "1": "L",
  "2": "U",
  "3": "B",
  "4": "R",
  "5": "I",
  "6": "C",
  "7": "A",
  "8": "D",
  "9": "O",
} as const;

export const CODE_TO_DIGIT = {
  L: "1",
  U: "2",
  B: "3",
  R: "4",
  I: "5",
  C: "6",
  A: "7",
  D: "8",
  O: "9",
  S: "0",
} as const;

export type DigitChar = keyof typeof DIGIT_TO_CODE;
export type CodeChar = keyof typeof CODE_TO_DIGIT;
