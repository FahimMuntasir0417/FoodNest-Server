import express, { Application, type Request } from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { getAuthEntryForOrigin } from "./lib/auth";
import { isAllowedOrigin } from "./lib/origins";

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

app.set("trust proxy", true);

const authHandlers = new Map<string, ReturnType<typeof toNodeHandler>>();

function headerValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getRequestOrigin(req: Request) {
  const origin = headerValue(req.headers.origin);

  if (origin) {
    return origin;
  }

  const forwardedHost = headerValue(req.headers["x-forwarded-host"]);
  const forwardedProto = headerValue(req.headers["x-forwarded-proto"]);

  if (forwardedHost && forwardedProto) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  return headerValue(req.headers.referer);
}

function getAuthHandler(origin: string | undefined) {
  const authEntry = getAuthEntryForOrigin(origin);
  const existingHandler = authHandlers.get(authEntry.origin);

  if (existingHandler) {
    return existingHandler;
  }

  const handler = toNodeHandler(authEntry.auth);
  authHandlers.set(authEntry.origin, handler);

  return handler;
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
  }),
);

// Better Auth
app.all("/api/auth/{*splat}", (req, res) => {
  const handler = getAuthHandler(getRequestOrigin(req));

  return handler(req, res);
});

app.use(express.json());

// Routes
app.use("/api/v1/users", useRouter);
app.use("/api/v1/categories", categoriesRouter);
app.use("/api/v1/meals", mealsRouter);
app.use("/api/v1/reviews", reviewsRouter);
app.use("/api/v1/providers", providersRouter);
app.use("/api/v1/order-items", orderItemsRouter);
app.use("/api/v1/orders", ordersRouter);

app.get("/", (_req, res) => res.send("Hello World!"));

app.use(notFound);
app.use(errorHandler);

export default app;
