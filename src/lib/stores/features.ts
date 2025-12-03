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
    framework2Store.set(readFramework2Flag());
  };

  updateFromLocation();
  window.addEventListener('popstate', updateFromLocation);
  window.addEventListener('hashchange', updateFromLocation);
}

export const framework2Enabled = {
  subscribe: framework2Store.subscribe
};

export function setFramework2Enabled(value: boolean) {
  framework2Store.set(value);
}
