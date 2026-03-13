// Thin wrapper that re-exports netmd-js's web encrypt worker for Vite compilation.
// When loaded as a Worker, the WorkerGlobalScope check in web-encrypt-worker.js
// triggers and sets up the onmessage handler for DES encryption.
import 'netmd-js/dist/web-encrypt-worker';
