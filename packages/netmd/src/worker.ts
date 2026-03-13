// Transfer Web Worker — handles USB transfer operations off the main thread.
// In a full implementation, this would run netmd-js commands in a worker context.
// WebUSB is only available on the main thread, so the actual USB I/O stays there,
// but this worker can handle data preparation, buffering, and progress tracking.

export type TransferWorkerMessage =
  | { type: 'prepare'; id: string; data: ArrayBuffer; format: 'sp' | 'lp2' | 'lp4' }
  | { type: 'cancel'; id: string };

export type TransferWorkerResponse =
  | { type: 'ready'; id: string; data: ArrayBuffer; wireFormat: 'pcm' | 'atrac3' }
  | { type: 'error'; id: string; message: string };

// Worker entry point
const ctx = globalThis as unknown as Worker;

ctx.addEventListener('message', (event: MessageEvent<TransferWorkerMessage>) => {
  const msg = event.data;

  switch (msg.type) {
    case 'prepare': {
      // Data is already encoded by the atrac-wasm worker.
      // This worker just passes it through with the correct wire format tag.
      const wireFormat = msg.format === 'sp' ? 'pcm' : 'atrac3';
      ctx.postMessage(
        { type: 'ready', id: msg.id, data: msg.data, wireFormat } satisfies TransferWorkerResponse,
        [msg.data]
      );
      break;
    }
    case 'cancel': {
      // Nothing to cancel in the preparation phase
      break;
    }
  }
});
