import { Duration } from 'ts-duration';
import { CronTask, WakaQ, WakaQueue, WakaQWorker } from 'wakaq';
//import { z } from 'zod';
//import { prisma } from './db';

export const wakaq = new WakaQ({

  /* Raise SoftTimeout in a task if it runs longer than 14 minutes. Can also be set per
     task or queue. If no soft timeout set, tasks can run forever.
  */
  softTimeout: Duration.minute(14),

  /* SIGKILL a task if it runs longer than 15 minutes. Can also be set per queue or
     when enqueuing a task.
  */
  hardTimeout: Duration.minute(15),

  /* Number of worker processes. Must be an int or str which evaluates to an
     int. The variable "cores" is replaced with the number of processors on
     the current machine.
  */
  concurrency: 1,

  /* List your queues and their priorities.
  */
  queues: [
    new WakaQueue('high priority'),
    new WakaQueue('default'),
  ],

  /* Redis normally doesn't use TLS, but some cloud providers need it.
  */
  tls: process.env.NODE_ENV == 'production' ? { cert: '', key: '' } : undefined,

  /* If the task soft timeouts, retry up to 3 times. Max retries comes first
     from the task decorator if set, next from the Queue's maxRetries,
     lastly from the option below. If No maxRetries is found, the task
     is not retried on a soft timeout.
  */
  maxRetries: 3,

  singleProcess: true,

  /* Schedule two tasks, the first runs every minute, the second once every ten minutes.
     To run scheduled tasks you must keep `npm run scheduler` running as a daemon.
  */
  schedules: [

    // Runs myTask once every 5 minutes.
    new CronTask('*/5 * * * *', 'myTask'),
  ],
});

export const myTask = wakaq.task(
  async () => {
    console.log("Task did run successfully")
  },
  { name: 'myTask' },
);
