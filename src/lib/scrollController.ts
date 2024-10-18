/**
 * Helpers to control screen scrolling when drawers are open. See ComboDrawer for usage.
 */

export function lockScroll() {
  const scrollY = window.scrollY;
  document.body.style.position = 'fixed';
  document.body.style.top = `-${scrollY}px`;
  document.body.style.width = '100%';
}

export function unlockScroll() {
  const scrollY = parseInt(document.body.style.top || '0') * -1;
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
  window.scrollTo(0, scrollY);
}