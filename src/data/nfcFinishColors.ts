import type { NfcCustomization } from '../types';

export type NfcFinishColors = {
  base: string;
  bright: string;
  mint: string;
  text: string;
  muted: string;
};

const finishes: Record<NfcCustomization['finish'], NfcFinishColors> = {
  pearl: { base: '#dce8df', bright: '#f3f6f1', mint: '#4f8967', text: '#173b2d', muted: '#426152' },
  mint: { base: '#6fa887', bright: '#b4ddc0', mint: '#e4f5e8', text: '#153b2c', muted: '#315943' },
  rose: { base: '#245640', bright: '#438263', mint: '#b4e2c5', text: '#fffefa', muted: '#d5e7db' },
  lilac: { base: '#193c31', bright: '#28654d', mint: '#a5d8b8', text: '#fffefa', muted: '#d5e7db' },
  'matte-black': { base: '#111b17', bright: '#27362f', mint: '#a5d8b8', text: '#fffefa', muted: '#cad8cf' },
};

export function getNfcFinishColors(finish: NfcCustomization['finish']) {
  return finishes[finish];
}
