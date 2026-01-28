import express, { Application } from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import { useRouter } from "./modules/user/user.router";

const app: Application = express();

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);
app.all("/api/auth/*splat", toNodeHandler(auth));

// user router
app.use("/users", useRouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

export default app;
