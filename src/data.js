export const themes = [
  { id: 'cosmic', name: 'Cosmic violet', description: 'Lilac, pink & starlight', colors: ['#b898ff', '#ff9cdb', '#8cf7ee'] },
  { id: 'rose', name: 'Rose galaxy', description: 'Blush, ruby & warm light', colors: ['#ef8ba8', '#ffb6cc', '#ffd1b0'] },
  { id: 'ocean', name: 'Ocean glow', description: 'Electric blue & icy aqua', colors: ['#80b6ff', '#95ecff', '#92ffec'] },
  { id: 'emerald', name: 'Aurora green', description: 'Emerald, mint & soft gold', colors: ['#6fdbac', '#baf4bd', '#efdb98'] },
  { id: 'sunset', name: 'Golden sunset', description: 'Amber, peach & coral', colors: ['#ffb878', '#ffd49b', '#ffa9ad'] },
];

export function readStorage(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}

export function initialTheme() {
  const saved = readStorage('monisha-color-theme');
  return themes.some(theme => theme.id === saved) ? saved : 'cosmic';
}

export const captions = ['Your golden smile.', 'A moment to keep.', 'My favourite person.'];
export const balloonPositions = [[.36, .34], [.54, .24], [.74, .41], [.87, .59], [.57, .57], [.35, .65], [.83, .28]];
