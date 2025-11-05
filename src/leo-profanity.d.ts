declare module 'leo-profanity' {
  export function check(text: string): boolean;
  export function clean(text: string, replaceKey?: string): string;
  export function add(words: string | string[]): void;
  export function remove(words: string | string[]): void;
  export function reset(): void;
  export function clearList(): void;
  export function list(): string[];
  export function getDictionary(language?: string): string[];
  export function loadDictionary(language: string): void;
}

