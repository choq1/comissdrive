import { Router } from "express";
import multer from "multer";
import { importsController } from "../controllers/importsController";
import { requireAuth, requireRole } from "../middleware/auth";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

export const importsRouter = Router();

importsRouter.post(
  "/:entity/preview",
  requireAuth,
  requireRole("admin"),
  upload.single("file"),
  importsController.preview
);

importsRouter.post("/:entity/commit", requireAuth, requireRole("admin"), importsController.commit);
