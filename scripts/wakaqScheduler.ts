import { WakaQScheduler } from 'wakaq';
import { wakaq } from '../src/index.ts';

await new WakaQScheduler(wakaq).start();