import { inspect } from 'wakaq';
import { wakaq } from '../src/index.ts';
console.log(JSON.stringify(await inspect(await wakaq.connect()), null, 2));
wakaq.disconnect();