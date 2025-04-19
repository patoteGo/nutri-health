-- CreateTable
CREATE TABLE "UserHealthInfo" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fat" DOUBLE PRECISION,
    "muscle" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "basal" DOUBLE PRECISION,

    CONSTRAINT "UserHealthInfo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserHealthInfo_userId_key" ON "UserHealthInfo"("userId");

-- AddForeignKey
ALTER TABLE "UserHealthInfo" ADD CONSTRAINT "UserHealthInfo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
