"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.failingTask = exports.sleeperTask = exports.simpleTask = exports.wakaq = void 0;
const ts_duration_1 = require("ts-duration");
const wakaq_1 = require("wakaq");
//import { z } from 'zod';
//import { prisma } from './db';
const fs_1 = require("fs");
const proper_lockfile_1 = __importDefault(require("proper-lockfile"));
exports.wakaq = new wakaq_1.WakaQ({
    /* Raise SoftTimeout in a task if it runs longer than 14 minutes. Can also be set per
       task or queue. If no soft timeout set, tasks can run forever.
    */
    softTimeout: ts_duration_1.Duration.minute(14),
    /* SIGKILL a task if it runs longer than 15 minutes. Can also be set per queue or
       when enqueuing a task.
    */
    hardTimeout: ts_duration_1.Duration.minute(15),
    /* Number of worker processes. Must be an int or str which evaluates to an
       int. The variable "cores" is replaced with the number of processors on
       the current machine.
    */
    concurrency: 'cores*4',
    /* List your queues and their priorities.
    */
    queues: [
        new wakaq_1.WakaQueue('high priority'),
        new wakaq_1.WakaQueue('default'),
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
        new wakaq_1.CronTask('*/5 * * * *', 'simpleTask'),
    ],
});
exports.simpleTask = exports.wakaq.task(async () => {
    //for (let i=0; i<20000; i++) {}
    const taskId = await incrementNumberInFile('number.txt');
    console.log(`Task id ${taskId}: did run successfully`);
}, { name: 'simpleTask' });
exports.sleeperTask = exports.wakaq.task(async () => {
    //for (let i=0; i<20000; i++) {}
    const taskId = await incrementNumberInFile('number.txt');
    //await wait(0.2)
    console.log(`Task id ${taskId}: did run sleeper successfully`);
}, { name: 'sleeperTask' });
exports.failingTask = exports.wakaq.task(async () => {
    const taskId = await incrementNumberInFile('number.txt');
    console.log(`Task id ${taskId}: will now intentionally fail`);
    throw new Error("Fail");
}, { name: 'failingTask' });
async function incrementNumberInFile(filePath) {
    var releaseLock;
    try {
        // Acquire a lock on the file
        releaseLock = await proper_lockfile_1.default.lock(filePath, {
            retries: {
                retries: 5, // Number of retries
                maxTimeout: 1000 // Maximum time to wait between retries (in milliseconds)
            }
        });
        // Read the current number from the file
        const data = await fs_1.promises.readFile(filePath, 'utf8');
        let number = parseInt(data);
        // Increment the number
        number = isNaN(number) ? 0 : number + 1;
        // Write the incremented number back to the file
        await fs_1.promises.writeFile(filePath, number.toString(), 'utf8');
        //console.log(`Updated number: ${number}`);
        return number;
    }
    catch (error) {
        // Handle specific file-related errors
        if (error instanceof Error && 'code' in error) {
            //console.error('An error occurred:', error.message);
            if (error.code === 'ENOENT') {
                await fs_1.promises.writeFile(filePath, '0', 'utf8');
                //console.log('File initialized with 0.');
            }
        }
        else {
            console.error('An unexpected error occurred');
        }
    }
    finally {
        // Release the lock
        if (releaseLock) {
            await releaseLock();
        }
    }
    return undefined;
}
function wait(seconds) {
    return new Promise(resolve => {
        setTimeout(resolve, seconds * 1000);
    });
}
