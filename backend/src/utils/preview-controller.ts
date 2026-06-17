import { factories } from '@strapi/strapi';

type Ctx = any;

export function createPreviewController(uid: string) {
  return factories.createCoreController(uid as any, ({ strapi }) => ({
    async find(ctx: Ctx) {
      await this.validateQuery(ctx);
      const sanitizedQuery = await this.sanitizeQuery(ctx) as Record<string, any>;
      const isPreview = ctx.query?.preview === '1';

      try {
        if (isPreview) {
          const results = await (strapi.documents(uid as any) as any).findMany({
            ...sanitizedQuery,
            status: 'draft',
          });
          const sanitizedResults = await this.sanitizeOutput(results, ctx);
          return this.transformResponse(sanitizedResults);
        }

        const { results, pagination } = await (strapi.service(uid as any) as any).find(sanitizedQuery);
        const sanitizedResults = await this.sanitizeOutput(results, ctx);
        return this.transformResponse(sanitizedResults, { pagination });
      } catch (error) {
        console.error(`[preview-controller] find error for ${uid}:`, error);
        throw error;
      }
    },

    async findOne(ctx: Ctx) {
      await this.validateQuery(ctx);
      const sanitizedQuery = await this.sanitizeQuery(ctx) as Record<string, any>;
      const isPreview = ctx.query?.preview === '1';

      try {
        if (isPreview) {
          const result = await (strapi.documents(uid as any) as any).findFirst({
            ...sanitizedQuery,
            filters: { ...(sanitizedQuery.filters ?? {}), documentId: ctx.params?.id },
            status: 'draft',
          });
          const sanitizedResult = await this.sanitizeOutput(result, ctx);
          return this.transformResponse(sanitizedResult);
        }

        const entity = await (strapi.service(uid as any) as any).findOne(ctx.params.id, sanitizedQuery);
        const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
        return this.transformResponse(sanitizedEntity);
      } catch (error) {
        console.error(`[preview-controller] findOne error for ${uid}:`, error);
        throw error;
      }
    },
  }));
}
