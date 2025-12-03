import { writable } from 'svelte/store';

export const HERO_METADATA = 'ALT ▲ 8,000M • EVEREST / K2 • HIGH ALTITUDE DIRECTOR OF PHOTOGRAPHY';
export const LOGOS_METADATA = 'BERGHAUS • OSPREY • RED BULL TV • NETFLIX • BBC • TNF';

const textStore = writable(HERO_METADATA);
const nodeStore = writable<HTMLElement | null>(null);
const detachedStore = writable(false);

export const metadataText = textStore;
export const metadataNode = nodeStore;
export const metadataDetached = detachedStore;

export function setMetadataText(value: string) {
  textStore.set(value);
}

export function setMetadataElement(node: HTMLElement | null) {
  nodeStore.set(node);
}

export function markMetadataDetached(value: boolean) {
  detachedStore.set(value);
}
