export {};

declare global {
  interface Window {
    navigate: (path: string) => void;
  }
}
