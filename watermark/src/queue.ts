import { randomUUID } from 'crypto';

interface Job<T> {
  id: string;
  execute: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (reason: Error) => void;
}

export class LimitedQueue {
  private queue: Job<any>[] = [];
  private running = 0;

  constructor(
    private readonly concurrency: number,
    private readonly maxSize: number,
  ) {}

  get pendingCount(): number {
    return this.queue.length;
  }

  get runningCount(): number {
    return this.running;
  }

  async add<T>(execute: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const job: Job<T> = {
        id: randomUUID(),
        execute,
        resolve,
        reject,
      };

      if (this.queue.length >= this.maxSize) {
        const dropped = this.queue.splice(0, this.queue.length);
        dropped.forEach((j) =>
          j.reject(new Error('Queue cleared: task limit exceeded')),
        );
      }

      this.queue.push(job);
      this.processNext();
    });
  }

  private processNext() {
    if (this.running >= this.concurrency || this.queue.length === 0) {
      return;
    }

    const job = this.queue.shift();
    if (!job) return;

    this.running++;
    job.execute()
      .then(job.resolve)
      .catch(job.reject)
      .finally(() => {
        this.running--;
        this.processNext();
      });
  }
}
