import * as Comlink from 'comlink';
import type { DesignerWorkerAPI } from '../types/worker-messages';

export function createWorkerBridge(): {
  api: Comlink.Remote<DesignerWorkerAPI>;
  terminate: () => void;
} {
  const worker = new Worker(
    new URL('../worker/designer.worker.ts', import.meta.url),
    { type: 'module' }
  );

  const api = Comlink.wrap<DesignerWorkerAPI>(worker);

  return {
    api,
    terminate: () => worker.terminate(),
  };
}
