'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const desktopToc = document.querySelector('#toc .menu');
  if (!desktopToc || !desktopToc.querySelector('[data-href]')) return;

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'mobile-toc-toggle button';
  toggle.setAttribute('aria-controls', 'mobile-toc-dialog');
  toggle.setAttribute('aria-haspopup', 'dialog');
  toggle.textContent = '目录';

  const dialog = document.createElement('dialog');
  dialog.id = 'mobile-toc-dialog';
  dialog.className = 'mobile-toc-dialog';
  dialog.setAttribute('aria-labelledby', 'mobile-toc-title');

  const header = document.createElement('div');
  header.className = 'mobile-toc-header';
  header.innerHTML = '<strong id="mobile-toc-title">文章目录</strong>';

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'delete';
  close.setAttribute('aria-label', '关闭目录');
  header.append(close);

  const menu = desktopToc.cloneNode(true);
  const menuLabel = menu.querySelector('.menu-label');
  if (menuLabel) menuLabel.remove();

  dialog.append(header, menu);
  document.body.append(toggle, dialog);

  toggle.addEventListener('click', () => dialog.showModal());
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  menu.addEventListener('click', event => {
    const link = event.target.closest('[data-href]');
    if (!link) return;

    const target = document.querySelector(link.dataset.href);
    if (!target) return;

    event.preventDefault();
    dialog.close();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', link.dataset.href);
  });
});
