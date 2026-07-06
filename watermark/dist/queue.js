import { randomUUID } from 'crypto';
export class LimitedQueue {
    concurrency;
    maxSize;
    queue = [];
    running = 0;
    constructor(concurrency, maxSize) {
        this.concurrency = concurrency;
        this.maxSize = maxSize;
    }
    get pendingCount() {
        return this.queue.length;
    }
    get runningCount() {
        return this.running;
    }
    async add(execute) {
        return new Promise((resolve, reject) => {
            const job = {
                id: randomUUID(),
                execute,
                resolve,
                reject,
            };
            if (this.queue.length >= this.maxSize) {
                const dropped = this.queue.splice(0, this.queue.length);
                dropped.forEach((j) => j.reject(new Error('Queue cleared: task limit exceeded')));
            }
            this.queue.push(job);
            this.processNext();
        });
    }
    processNext() {
        if (this.running >= this.concurrency || this.queue.length === 0) {
            return;
        }
        const job = this.queue.shift();
        if (!job)
            return;
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
