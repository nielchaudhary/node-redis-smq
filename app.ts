import express from "express";
import { queueOps } from "./queue";

const app = express();

queueOps();

app.listen(3000, () => {
  console.log("SERVER ON 3k");
});
