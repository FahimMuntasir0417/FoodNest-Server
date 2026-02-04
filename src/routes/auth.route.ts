import { Router } from "express";
import { auth as betterAuth } from "../lib/auth";

const router: Router = Router();

router.get("/session", async (req, res, next) => {
  try {
    const session = await betterAuth.api.getSession({
      headers: req.headers as any,
    });

    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    return res.json(session); // returns { session: {...}, user: {...} }
  } catch (err) {
    next(err);
  }
});

export default router;
