import { writable } from 'svelte/store';

export const HERO_METADATA =
  'ALT ▲ 8,000M • EVEREST / K2 • DIRECTOR OF PHOTOGRAPHY';
export const LOGOS_METADATA =
  'BERGHAUS • OSPREY • RED BULL TV • NETFLIX • BBC • TNF';

export interface MetadataState {
  id: string;
  text: string;
}

// Start with logos (social proof) - scan line wipe transitions to credentials
const textStore = writable(LOGOS_METADATA);
const nodeStore = writable<HTMLElement | null>(null);
const detachedStore = writable(false);
const homeStore = writable<HTMLElement | null>(null);
const metadataStack: MetadataState[] = [{ id: 'hero-logos', text: LOGOS_METADATA }];
const stackStore = writable<MetadataState[]>([...metadataStack]);

export const metadataText = textStore;
export const metadataNode = nodeStore;
export const metadataDetached = detachedStore;
export const metadataHome = homeStore;
export const metadataStates = stackStore;

function updateStackStore() {
  stackStore.set([...metadataStack]);
}

function setTopMetadataText(value: string) {
  if (metadataStack.length === 0) {
    metadataStack.push({ id: 'hero', text: value });
  } else {
    metadataStack[metadataStack.length - 1] = {
      ...metadataStack[metadataStack.length - 1],
      text: value
    };
  }
  textStore.set(value);
  updateStackStore();
}

export function pushMetadataState(state: MetadataState) {
  metadataStack.push(state);
  textStore.set(state.text);
  updateStackStore();
}

export function popMetadataState(expectedId?: string) {
  if (metadataStack.length <= 1) {
    // Always keep at least one entry so metadata never goes empty.
    textStore.set(metadataStack[0]?.text ?? HERO_METADATA);
    updateStackStore();
    return metadataStack[0];
  }

  const popped = metadataStack.pop();
  if (expectedId && popped?.id !== expectedId) {
    // Put it back if the caller mis-matched IDs to avoid leaking other states.
    if (popped) {
      metadataStack.push(popped);
    }
    updateStackStore();
    return popped;
  }

  const current = metadataStack[metadataStack.length - 1];
  textStore.set(current.text);
  updateStackStore();
  return popped;
}

export function setCurrentMetadata(text: string) {
  setTopMetadataText(text);
}

export function setMetadataText(value: string) {
  setCurrentMetadata(value);
}

export function setMetadataElement(node: HTMLElement | null) {
  nodeStore.set(node);
}

export function markMetadataDetached(value: boolean) {
  detachedStore.set(value);
}

export function setMetadataHome(node: HTMLElement | null) {
  homeStore.set(node);
}
