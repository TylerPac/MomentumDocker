import React from 'react';

function ensureMetaByName(name) {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  return el;
}

export function usePageMeta({ title, description }) {
  React.useEffect(() => {
    if (title) document.title = title;
    if (description) {
      const meta = ensureMetaByName('description');
      meta.setAttribute('content', description);
    }
  }, [title, description]);
}
