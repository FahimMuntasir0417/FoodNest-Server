import express, { Application } from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import { useRouter } from "./modules/user/user.router";
import { categoriesRouter } from "./modules/categories/categories.routes";
import { mealsRouter } from "./modules/meals/meals.routes";
import { reviewsRouter } from "./modules/reviews/reviews.routes";
import { providersRouter } from "./modules/providers/providers.route";
import { orderItemsRouter } from "./modules/order-items/orderItems.routes";
import { ordersRouter } from "./modules/orders/orders.routes";
import { notFound } from "./middlewares/notFound";
import errorHandler from "./middlewares/globalErrorHandler";

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
app.use("/api/v1/users", useRouter);

//  categories router
app.use("/api/v1/categories", categoriesRouter);

app.use("/api/v1/meals", mealsRouter);

app.use("/api/v1/reviews", reviewsRouter);

app.use("/api/v1/providers", providersRouter);

app.use("/api/v1/order-items", orderItemsRouter);

app.use("/api/v1/orders", ordersRouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use(notFound);
app.use(errorHandler);

export default app;
