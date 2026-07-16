import { Node, mergeAttributes } from '@tiptap/core';
import { getVideoEmbedUrl } from './video-embed';

export const Video = Node.create({
  name: 'video',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-src'),
        renderHTML: (attributes) => {
          if (!attributes.src) return {};
          return { 'data-src': attributes.src };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-video]',
        getAttrs: (element) => ({ src: (element as HTMLElement).getAttribute('data-src') }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const src = getVideoEmbedUrl(HTMLAttributes.src);
    return [
      'div',
      mergeAttributes(HTMLAttributes, { 'data-video': '', class: 'video-embed aspect-video w-full overflow-hidden bg-black my-4' }),
      ['iframe', { src, class: 'h-full w-full border-0', allowfullscreen: 'true', allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' }],
    ];
  },

  addCommands() {
    return {
      setVideo:
        (options: { src: string }) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { src: options.src },
          });
        },
    };
  },
});
