import { Duration } from 'ts-duration';
import { CronTask, WakaQ, WakaQueue, WakaQWorker } from 'wakaq';
//import { z } from 'zod';
//import { prisma } from './db';
import { promises as fs } from 'fs';
import lockfile from 'proper-lockfile';
import { v4 as uuidv4 } from 'uuid'

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
  concurrency: 'cores*4',

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

  singleProcess: false,

  /* Schedule two tasks, the first runs every minute, the second once every ten minutes.
     To run scheduled tasks you must keep `npm run scheduler` running as a daemon.
  */
  schedules: [
    // Runs simpleTask once every 5 minutes.
    new CronTask('*/5 * * * *', 'simpleTask'),
  ],
});

let id = 0

export const enqueueTask = wakaq.task(
  async () => {
    const uuid = uuidv4()
    console.log(`New enqueue task id: ${++id}, uuid: ${uuid}`)
    for (let i=0; i<100000; i++) {
      simpleTask.enqueue()
    }
    console.log(`Task id ${id}, uuid ${uuid}: finished running`)
  },
  { name: 'enqueueTask' },
);

export const simpleTask = wakaq.task(
  async () => {
    const uuid = uuidv4()
    console.log(`New task id: ${++id}, uuid: ${uuid}`)
    console.log(`Task id ${id}, uuid ${uuid}: finished running`)
  },
  { name: 'simpleTask' },
);

export const sleeperTask = wakaq.task(
  async () => {
    //for (let i=0; i<20000; i++) {}
    const uuid = uuidv4()
    console.log(`New task id: ${++id}, uuid: ${uuid}`)
    console.log(`Task id ${id}, uuid ${uuid}: finished running`)
  },
  { name: 'sleeperTask' },
);

export const failingTask = wakaq.task(
  async () => {
    const uuid = uuidv4()
    console.log(`New task id: ${++id}, uuid: ${uuid}`)
    console.log(`Task id ${id}, uuid ${uuid}: finished running`)
    //console.log(`Task id ${taskId}: will now intentionally fail`)
    //throw new Error("Fail");
  },
  { name: 'failingTask' },
);

function wait(seconds: number): Promise<void> {
  return new Promise(resolve => {
      setTimeout(resolve, seconds * 1000);
  });
}