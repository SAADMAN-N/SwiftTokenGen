-- CreateTable
CREATE TABLE "memecoins" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "decimals" INTEGER NOT NULL,
    "totalSupply" TEXT NOT NULL,
    "description" TEXT,
    "logoUrl" TEXT,
    "socialLinks" JSONB,
    "mintAddress" TEXT NOT NULL,
    "creatorAddress" TEXT NOT NULL,
    "network" TEXT NOT NULL DEFAULT 'devnet',
    "hasMintAuthority" BOOLEAN NOT NULL DEFAULT true,
    "hasFreezeAuthority" BOOLEAN NOT NULL DEFAULT true,
    "hasUpdateAuthority" BOOLEAN NOT NULL DEFAULT true,
    "priceInSol" DECIMAL(65,30) NOT NULL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "paymentTx" TEXT,

    CONSTRAINT "memecoins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "memecoins_mintAddress_key" ON "memecoins"("mintAddress");
