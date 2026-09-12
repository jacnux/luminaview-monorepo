import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';

const schema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    '*': ['style', 'className', 'class', 'id', 'align', 'width', 'height', 'title'],
    'img': ['src', 'alt', 'width', 'height', 'style', 'className', 'class', 'loading', 'title'],
    'a': ['href', 'target', 'rel', 'title', 'className', 'class', 'style', 'download'],
    'video': ['src', 'controls', 'autoplay', 'loop', 'muted', 'poster', 'width', 'height', 'style', 'className', 'class'],
    'audio': ['src', 'controls', 'autoplay', 'loop', 'muted', 'style', 'className', 'class'],
    'source': ['src', 'type'],
    'iframe': ['src', 'width', 'height', 'style', 'className', 'class', 'allow', 'allowfullscreen', 'frameborder'],
    'td': ['align', 'valign', 'style', 'className', 'class', 'colspan', 'rowspan'],
    'th': ['align', 'valign', 'style', 'className', 'class', 'colspan', 'rowspan'],
  },
  tagNames: [
    ...(defaultSchema.tagNames ?? []),
    'div', 'span', 'section', 'article', 'figure', 'figcaption', 'img', 'p', 'br', 'hr',
    'video', 'audio', 'source', 'picture', 'center', 'details', 'summary', 'iframe',
    'table', 'thead', 'tbody', 'tr', 'th', 'td', 'blockquote', 'code', 'pre',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'b', 'i', 'u', 's', 'del',
    'ul', 'ol', 'li', 'small', 'sub', 'sup', 'mark'
  ],
  protocols: {
    ...defaultSchema.protocols,
    src: ['http', 'https', 'data'],
    href: ['http', 'https', 'mailto', 'tel'],
  },
};

interface Props {
  children: string;
  className?: string;
}

const MarkdownRenderer: React.FC<Props> = ({ children, className }) => (
  <ReactMarkdown
    className={className}
    remarkPlugins={[remarkGfm]}
    rehypePlugins={[rehypeRaw as any, [rehypeSanitize, schema] as any]}
    components={{
      img: ({ node, className: imgClass, src, alt, style, title, width, height, ...props }) => {
        let resolvedSrc = src || '';
        let customStyle: React.CSSProperties = { ...(style as React.CSSProperties) };

        if (width) {
          const w = String(width);
          const widthVal = w.endsWith('%') || w.endsWith('px') || w.endsWith('rem') ? w : `${w}px`;
          customStyle.width = widthVal;
          customStyle.maxWidth = widthVal;
        }

        if (resolvedSrc.includes('#')) {
          const parts = resolvedSrc.split('#');
          resolvedSrc = parts[0];
          const hash = parts[1];
          const match = hash.match(/(\d+(?:[.,]\d+)?)%/);
          if (match) {
            const pct = match[1].replace(',', '.');
            customStyle.width = `${pct}%`;
            customStyle.maxWidth = `${pct}%`;
          } else if (hash.endsWith('px') || hash.endsWith('rem') || /^\d+$/.test(hash)) {
            const val = /^\d+$/.test(hash) ? `${hash}%` : hash;
            customStyle.width = val;
            customStyle.maxWidth = val;
          }
        }

        const altText = alt || '';
        const widthMatch = altText.match(/(\d+(?:[.,]\d+)?)%/);
        if (widthMatch) {
          const pct = widthMatch[1].replace(',', '.');
          customStyle.width = `${pct}%`;
          customStyle.maxWidth = `${pct}%`;
        }

        if (resolvedSrc && !resolvedSrc.startsWith('http://') && !resolvedSrc.startsWith('https://') && !resolvedSrc.startsWith('/') && !resolvedSrc.startsWith('data:')) {
          resolvedSrc = `/uploads/${resolvedSrc}`;
        }

        return (
          <img
            src={resolvedSrc}
            alt={altText}
            title={title}
            style={customStyle}
            className={`max-w-full h-auto rounded-lg shadow-md my-3 inline-block ${imgClass || ''}`}
            loading="lazy"
            {...props}
          />
        );
      },
      a: ({ node, ...props }) => (
        <a target="_blank" rel="noopener noreferrer" {...props} />
      ),
    }}
  >
    {children}
  </ReactMarkdown>
);

export default MarkdownRenderer;
