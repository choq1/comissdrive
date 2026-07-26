-- CreateTable
CREATE TABLE "ImportLog" (
    "id" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "rowsTotal" INTEGER NOT NULL,
    "rowsCommitted" INTEGER NOT NULL,
    "rowsFailed" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImportLog_pkey" PRIMARY KEY ("id")
);
