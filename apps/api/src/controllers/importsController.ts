import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { HttpError } from "../middleware/errorHandler";
import { parseUploadedFile } from "../services/importParsingService";
import { commitImport } from "../services/importService";
import { buildImportConfigs, isImportEntity, ImportEntity } from "../schemas/importConfigs";

const commitBodySchema = z.object({
  rows: z.array(z.record(z.unknown())),
  fileName: z.string().min(1).default("importação"),
});

function requireEntity(req: Request): ImportEntity {
  const entity = req.params.entity;
  if (!isImportEntity(entity)) {
    throw new HttpError(400, `Entidade de importação inválida: ${entity}`);
  }
  return entity;
}

export const importsController = {
  async preview(req: Request, res: Response, next: NextFunction) {
    try {
      const entity = requireEntity(req);
      if (!req.file) throw new HttpError(400, "Nenhum arquivo enviado");

      const configs = buildImportConfigs();
      const rows = await parseUploadedFile(req.file.buffer, req.file.mimetype, req.file.originalname, configs[entity]);

      const validCount = rows.filter((row) => row.errors.length === 0).length;
      res.json({
        entity,
        fileName: req.file.originalname,
        totalRows: rows.length,
        validCount,
        errorCount: rows.length - validCount,
        rows,
      });
    } catch (err) {
      next(err);
    }
  },

  async commit(req: Request, res: Response, next: NextFunction) {
    try {
      const entity = requireEntity(req);
      const body = commitBodySchema.parse(req.body);
      if (!req.user) throw new HttpError(401, "Not authenticated");

      const result = await commitImport(entity, body.rows, {
        fileName: body.fileName,
        uploadedBy: req.user.sub,
        source: "spreadsheet",
      });
      res.json({ entity, ...result });
    } catch (err) {
      next(err);
    }
  },
};
