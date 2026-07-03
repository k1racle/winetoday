import express, { Request, Response } from 'express';
import { applyWatermark, ApplyWatermarkRequest, WatermarkSettings } from './watermark.service.js';
import { LimitedQueue } from './queue.js';

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 4001;
const uploadsDir = process.env.UPLOADS_DIR || '/app/uploads';
const concurrency = process.env.CONCURRENCY ? parseInt(process.env.CONCURRENCY, 10) : 1;
const maxQueueSize = process.env.MAX_QUEUE_SIZE ? parseInt(process.env.MAX_QUEUE_SIZE, 10) : 10;

const queue = new LimitedQueue(concurrency, maxQueueSize);

app.use(express.json({ limit: '10mb' }));

app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    pending: queue.pendingCount,
    running: queue.runningCount,
    maxQueueSize,
    concurrency,
  });
});

app.post('/apply', async (req: Request, res: Response) => {
  try {
    const body = req.body as {
      sourcePath: string;
      watermarkPath: string;
      outputPath?: string;
      settings?: WatermarkSettings;
      targetWidth?: number;
    };

    if (!body.sourcePath || !body.watermarkPath) {
      res.status(400).json({ message: 'sourcePath and watermarkPath are required' });
      return;
    }

    const request: ApplyWatermarkRequest = {
      sourcePath: body.sourcePath,
      watermarkPath: body.watermarkPath,
      outputPath: body.outputPath,
      settings: body.settings,
      targetWidth: body.targetWidth,
    };

    const resultPath = await queue.add(() => applyWatermark(request, uploadsDir));
    res.json({ path: resultPath });
  } catch (err: any) {
    if (err?.message === 'Queue cleared: task limit exceeded') {
      res.status(503).json({ message: err.message });
      return;
    }
    console.error('[watermark] apply error:', err);
    res.status(500).json({ message: err?.message || 'Watermark processing failed' });
  }
});

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Watermark service listening on http://0.0.0.0:${port}`);
  console.log(`Uploads directory: ${uploadsDir}`);
  console.log(`Concurrency: ${concurrency}, max queue size: ${maxQueueSize}`);
});

function gracefulShutdown(signal: string) {
  console.log(`[watermark] received ${signal}, shutting down gracefully...`);
  server.close(() => {
    console.log('[watermark] server closed');
    process.exit(0);
  });

  // Force exit after 10s if queue does not drain
  setTimeout(() => {
    console.error('[watermark] forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
