-- Update existing pending orders to promotional price
UPDATE "memecoins" 
SET "priceInSol" = 0.2 
WHERE "paymentStatus" = 'pending';