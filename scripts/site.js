/* global hexo */

'use strict';

const { DomUtils, parseDocument } = require('htmlparser2');
const { stripHTML } = require('hexo-util');

const MORE_MARKER = /<!-- ?more ?-->|id=["']more["']/i;
const DEFAULT_EXCERPT_LENGTH = 180;
const MAX_EXCERPT_HEADINGS = 2;
const EXCERPT_BLOCKS = new Set(['h2', 'h3', 'h4', 'p', 'blockquote', 'ul', 'ol']);

function normalizeText(html) {
  return stripHTML(html)
    .replace(/¶/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  if (maxLength <= 1) return '…';

  const contentLength = maxLength - 1;
  const candidate = text.slice(0, contentLength);
  const boundary = Math.max(
    candidate.lastIndexOf('。'),
    candidate.lastIndexOf('！'),
    candidate.lastIndexOf('？'),
    candidate.lastIndexOf('；'),
    candidate.lastIndexOf('，'),
    candidate.lastIndexOf(' ')
  );
  const end = boundary >= Math.floor(contentLength * 0.6) ? boundary + 1 : contentLength;
  return `${candidate.slice(0, end).trim()}…`;
}

function isTag(node) {
  return node && node.type === 'tag';
}

function hasClass(node, className) {
  return isTag(node) && String(node.attribs?.class || '').split(/\s+/).includes(className);
}

function truncateHtmlNode(node, state) {
  if (node.type === 'text') {
    const text = node.data.replace(/\s+/g, ' ');
    if (!text.trim()) {
      node.data = text ? ' ' : '';
      return;
    }

    const remaining = state.maxLength - state.length;
    if (remaining <= 0) {
      node.data = '';
      state.done = true;
      return;
    }
    if (text.length <= remaining) {
      node.data = text;
      state.length += text.length;
      if (state.length === state.maxLength) state.done = true;
      return;
    }

    node.data = truncateText(text, remaining);
    state.length = state.maxLength;
    state.done = true;
    return;
  }

  if (!isTag(node)) return;
  if (hasClass(node, 'header-anchor')) {
    DomUtils.removeElement(node);
    return;
  }

  delete node.attribs.id;
  for (const child of [...node.children]) {
    if (state.done) {
      DomUtils.removeElement(child);
    } else {
      truncateHtmlNode(child, state);
    }
  }
}

function comparableHeading(text) {
  return text
    .replace(/[\p{Extended_Pictographic}\uFE0F]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function createFormattedExcerpt(html, maxLength, title) {
  const document = parseDocument(html);
  const output = [];
  const state = { done: false, length: 0, maxLength };
  let firstContentBlock = true;
  let headingCount = 0;

  for (const node of document.children) {
    if (!isTag(node) || !EXCERPT_BLOCKS.has(node.name)) continue;

    for (const anchor of DomUtils.findAll(child => hasClass(child, 'header-anchor'), node.children)) {
      DomUtils.removeElement(anchor);
    }

    const blockText = normalizeText(DomUtils.textContent(node));
    if (!blockText) continue;

    const isHeading = /^h[2-4]$/.test(node.name);
    const duplicatesTitle = firstContentBlock
      && isHeading
      && comparableHeading(blockText) === comparableHeading(title);
    firstContentBlock = false;
    if (duplicatesTitle) continue;
    if (isHeading && headingCount >= MAX_EXCERPT_HEADINGS) break;
    if (isHeading) headingCount += 1;

    if (output.length) state.length += 1;
    truncateHtmlNode(node, state);
    output.push(DomUtils.getOuterHTML(node));
    if (state.done) break;
  }

  return output.join('');
}

hexo.extend.filter.register('after_post_render', data => {
  if (data.layout !== 'post' || typeof data.excerpt !== 'undefined' || MORE_MARKER.test(data.content)) {
    return data;
  }

  const text = normalizeText(data.content);
  if (text.length <= DEFAULT_EXCERPT_LENGTH) return data;

  const excerpt = createFormattedExcerpt(data.content, DEFAULT_EXCERPT_LENGTH, data.title);
  if (!excerpt) return data;

  data.excerpt = `<div class="article-excerpt">${excerpt}</div>`;
  data.content = `<span id="more"></span>${data.content}`;
  return data;
}, 5);

function addLazyLoading(html) {
  if (!html) return html;
  return html.replace(/<img\b(?![^>]*\bloading=)([^>]*)>/gi, '<img loading="lazy" decoding="async"$1>');
}

hexo.extend.filter.register('after_post_render', data => {
  data.content = addLazyLoading(data.content);
  data.excerpt = addLazyLoading(data.excerpt);
  return data;
}, 20);

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toDate(value) {
  const date = value && typeof value.toDate === 'function' ? value.toDate() : new Date(value);
  return date.toISOString().slice(0, 10);
}

hexo.extend.generator.register('baidusitemap', locals => {
  const config = hexo.config.baidusitemap || {};
  const baseUrl = String(config.url || hexo.config.url).replace(/\/+$/, '') + '/';
  const posts = locals.posts
    .filter(post => post.baidusitemap !== false)
    .sort('-updated')
    .toArray();
  const entries = posts.map(post => {
    const loc = new URL(post.path, baseUrl).href;
    return `  <url>\n    <loc>${xmlEscape(loc)}</loc>\n    <lastmod>${toDate(post.updated || post.date)}</lastmod>\n  </url>`;
  }).join('\n');

  return {
    path: config.path || 'baidusitemap.xml',
    data: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`
  };
});

hexo.extend.injector.register('head_end', '<link rel="stylesheet" href="/css/site.css">', 'default');
hexo.extend.injector.register('body_end', '<script defer src="/js/site.js"></script>', 'default');
