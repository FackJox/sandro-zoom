<script lang="ts">
  export let label: string;
  export let color: string;
  export let index: number;
</script>

<div class="debug-overlay" style="--debug-color: {color};">
  <div class="debug-label">
    <span class="debug-index">{index}</span>
    <span class="debug-name">{label}</span>
  </div>
</div>

<style>
  .debug-overlay {
    position: absolute;
    inset: 0;
    background: var(--debug-color);
    pointer-events: none;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .debug-label {
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 1rem 2rem;
    border-radius: 8px;
    font-family: monospace;
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    border: 2px solid var(--debug-color);
  }

  .debug-index {
    background: var(--debug-color);
    color: black;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 1.25rem;
  }

  .debug-name {
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
</style>
