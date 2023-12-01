import { WakaQWorker } from 'wakaq';
import { wakaq } from '../src/index.ts';

// Can't use tsx directly because it breaks IPC (https://github.com/esbuild-kit/tsx/issues/201)
await new WakaQWorker(wakaq, ['node', '--import', 'tsx', 'scripts/wakaqChild.ts']).start();