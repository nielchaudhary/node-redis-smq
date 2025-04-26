import express from "express";
import { queueOps } from "./queue";

const app = express();

console.log("before queue");

queueOps();

console.log("after queue");
app.listen(3000, () => {
  console.log("SERVER ON 3k");
});
