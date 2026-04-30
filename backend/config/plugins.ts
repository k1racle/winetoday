import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
  'users-permissions': {
    config: {
      register: {
        allowedFields: ['accountType', 'displayName'],
      },
      callback: {
        validate: (cbUrl: string) => {
          const siteUrl = env('SITE_URL', 'http://localhost').replace(/\/$/, '');
          const clientUrl = env('CLIENT_URL', siteUrl).replace(/\/$/, '');

          if (cbUrl.startsWith(`${siteUrl}/`) || cbUrl === siteUrl || cbUrl.startsWith(`${clientUrl}/`) || cbUrl === clientUrl) {
            return;
          }

          throw new Error('Invalid callback url');
        },
      },
    },
  },
  'tiptap-editor': {
    enabled: true,
    config: {
      presets: {
        full: {
          bold: true,
          italic: true,
          underline: true,
          strike: true,
          code: true,
          codeBlock: true,
          heading: {
            levels: [1, 2, 3, 4, 5, 6],
          },
          blockquote: true,
          bulletList: true,
          orderedList: true,
          link: {
            HTMLAttributes: {
              rel: 'noopener noreferrer',
              target: '_blank',
            },
          },
          table: true,
          textAlign: true,
          superscript: true,
          subscript: true,
          mediaLibrary: {
            resize: {
              enabled: true,
              alwaysPreserveAspectRatio: true,
              minWidth: 50,
              minHeight: 50,
            },
          },
        },
      },
    },
  },
  upload: {
    config: {
      sizeLimit: 250 * 1024 * 1024,
      providerOptions: {
        localServer: {
          maxage: 300000,
        },
      },
    },
  },
});

export default config;
