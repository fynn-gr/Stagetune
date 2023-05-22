import { writable } from 'svelte/store';

export const currentDragging = writable(null);
export const editMode = writable(true);