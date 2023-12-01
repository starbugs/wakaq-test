import { simpleTask, sleeperTask, failingTask } from "../src/index"

for (let i=0; i<10000; i++) {
  const rng = Math.random()
  if (rng > 0.333) {
    failingTask.enqueue()
  } else if (rng > 0.666) {
    simpleTask.enqueue()
  } else {
    sleeperTask.enqueue()
  }
}

console.log('Enqueued all tasks')