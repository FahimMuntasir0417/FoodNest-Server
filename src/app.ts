import express, { Application } from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import { useRouter } from "./modules/user/user.router";
import { categoriesRouter } from "./modules/categories/categories.routes";
import { mealsRouter } from "./modules/meals/meals.routes";
import { reviewsRouter } from "./modules/reviews/reviews.routes";

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

//  categories router
app.use("/api/categories", categoriesRouter);

app.use("/api/meals", mealsRouter);

app.use("/reviews", reviewsRouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

export default app;
