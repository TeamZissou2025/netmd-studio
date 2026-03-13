// Type declarations for @ffmpeg/ffmpeg v0.6.1
declare module '@ffmpeg/ffmpeg' {
  interface LogPayload {
    action: string;
    message: string;
  }

  interface WorkerOptions {
    corePath?: string;
    workerPath?: string;
    logger?: (payload: LogPayload) => void;
    progress?: (payload: { ratio: number }) => void;
    workerBlobURL?: boolean;
  }

  interface FFmpegResult {
    workerId: string;
    jobId: string;
    message: string;
    data: Uint8Array;
  }

  interface FFmpegWorker {
    id: string;
    worker: Worker;
    load(jobId?: string): Promise<FFmpegResult>;
    write(path: string, data: File | ArrayBuffer | Uint8Array | string, jobId?: string): Promise<FFmpegResult>;
    read(path: string, jobId?: string): Promise<FFmpegResult>;
    remove(path: string, jobId?: string): Promise<FFmpegResult>;
    run(args: string, jobId?: string): Promise<FFmpegResult>;
    transcode(input: string, output: string, options?: string, jobId?: string): Promise<FFmpegResult>;
    terminate(jobId?: string): Promise<void>;
  }

  export function createWorker(options?: WorkerOptions): FFmpegWorker;
  export function setLogging(enabled: boolean): void;
}
