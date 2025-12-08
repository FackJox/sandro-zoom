import { browser } from '$app/environment';
import { writable } from 'svelte/store';

function readFramework2Flag() {
  if (!browser) return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('framework2') === '1';
}

const framework2Store = writable(false);
let listenersBound = false;

if (browser && !listenersBound) {
  listenersBound = true;
  const updateFromLocation = () => {
    const next = readFramework2Flag();
    console.debug('[features] framework2 flag updated from location', next);
    framework2Store.set(next);
  };

  updateFromLocation();
  window.addEventListener('popstate', updateFromLocation);
  window.addEventListener('hashchange', updateFromLocation);
}

export const framework2Enabled = {
  subscribe: framework2Store.subscribe
};

export function setFramework2Enabled(value: boolean) {
  console.debug('[features] framework2 flag manually set', value);
  framework2Store.set(value);
}
