'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";  

interface PriceConfig {
  includeSocials: boolean;
  revokeAuthorities: {
    mint: boolean;
    freeze: boolean;
    update: boolean;
  };
}

const calculatePrice = (config: PriceConfig): number => {
  let price = 0.1; // Base price in SOL
  if (config.includeSocials) price += 0.05;
  if (config.revokeAuthorities.mint) price += 0.02;
  if (config.revokeAuthorities.freeze) price += 0.02;
  if (config.revokeAuthorities.update) price += 0.02;
  return price;
};

const formatPrice = (price: number): string => {
  return `${price.toFixed(2)} SOL`;
};

export function PricingCalculator() {
  const [includeSocials, setIncludeSocials] = useState(false);
  const [revokeMint, setRevokeMint] = useState(false);
  const [revokeFreeze, setRevokeFreeze] = useState(false);
  const [revokeUpdate, setRevokeUpdate] = useState(false);

  const price = calculatePrice({
    includeSocials,
    revokeAuthorities: {
      mint: revokeMint,
      freeze: revokeFreeze,
      update: revokeUpdate,
    },
  });

  return (
    <Card className="w-full max-w-md mx-auto bg-card">
      <CardHeader>
        <CardTitle>Token Launch Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Base Price Display */}
        <div className="flex justify-between items-center py-2 border-b border-border">
          <Label>Base Package</Label>
          <span className="font-semibold">0.1 SOL</span>
        </div>

        {/* Social Links Toggle */}
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <Label htmlFor="socials">Social Links Package</Label>
            <p className="text-sm text-muted-foreground">
              Include Twitter, Telegram, Website, Discord
            </p>
          </div>
          <Switch
            id="socials"
            checked={includeSocials}
            onCheckedChange={setIncludeSocials}
            className="data-[state=unchecked]:bg-input"
          />
        </div>

        {/* Authority Revocation Section */}
        <div className="space-y-4">
          <Label>Authority Revocation</Label>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="mint">Revoke Mint Authority</Label>
              <Switch
                id="mint"
                checked={revokeMint}
                onCheckedChange={setRevokeMint}
                className="data-[state=unchecked]:bg-input"
              />
            </div>

            <div className="flex justify-between items-center">
              <Label htmlFor="freeze">Revoke Freeze Authority</Label>
              <Switch
                id="freeze"
                checked={revokeFreeze}
                onCheckedChange={setRevokeFreeze}
                className="data-[state=unchecked]:bg-input"
              />
            </div>

            <div className="flex justify-between items-center">
              <Label htmlFor="update">Revoke Update Authority</Label>
              <Switch
                id="update"
                checked={revokeUpdate}
                onCheckedChange={setRevokeUpdate}
                className="data-[state=unchecked]:bg-input"
              />
            </div>
          </div>
        </div>

        {/* Total Price */}
        <div className="flex justify-between items-center pt-4 border-t border-border">
          <Label className="text-lg">Total Price</Label>
          <span className="text-lg font-bold">{formatPrice(price)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
