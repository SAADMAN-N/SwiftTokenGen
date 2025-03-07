-- Update default network to mainnet-beta
ALTER TABLE "memecoins" ALTER COLUMN "network" SET DEFAULT 'mainnet-beta';
-- Update existing records to mainnet-beta
UPDATE "memecoins" SET "network" = 'mainnet-beta' WHERE "network" = 'devnet';