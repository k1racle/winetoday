let activeRequests = 0;
let totalRequests = 0;

export default () => {
  return async (ctx: any, next: () => Promise<void>) => {
    totalRequests += 1;
    activeRequests += 1;

    const requestId = totalRequests;
    const startTime = Date.now();
    const method = ctx.method ?? 'UNKNOWN';
    const url = ctx.url ?? 'UNKNOWN';
    const userAgent = ctx.get?.('user-agent') ?? 'no-agent';
    const referer = ctx.get?.('referer') ?? 'no-referer';

    ctx.strapi?.log?.info?.(
      `[REQ-START #${requestId}] ${method} ${url} | active=${activeRequests} | ua=${userAgent} | referer=${referer}`,
    );

    try {
      await next();
    } finally {
      const duration = Date.now() - startTime;
      activeRequests -= 1;
      const status = ctx.status ?? 0;

      ctx.strapi?.log?.info?.(
        `[REQ-END   #${requestId}] ${method} ${url} | status=${status} | duration=${duration}ms | active=${activeRequests}`,
      );
    }
  };
};
