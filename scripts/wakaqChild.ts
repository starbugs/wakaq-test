import { WakaQChildWorker } from 'wakaq';
import { wakaq, simpleTask } from '../src/index.ts';

// import your tasks so they're registered
// also make sure to enable tsc option verbatimModuleSyntax

await new WakaQChildWorker(wakaq).start();