import { Router } from "express";
import { authRouter } from "./auth.routes";
import { commissionsRouter } from "./commissions.routes";
import { employeesRouter } from "./employees.routes";
import { invoicesRouter } from "./invoices.routes";
import { revenueRouter } from "./revenue.routes";
import { rulesRouter } from "./rules.routes";
import { usersRouter } from "./users.routes";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/employees", employeesRouter);
apiRouter.use("/invoices", invoicesRouter);
apiRouter.use("/rules", rulesRouter);
apiRouter.use("/revenue", revenueRouter);
apiRouter.use("/commissions", commissionsRouter);
apiRouter.use("/users", usersRouter);
