'use client';

import { useState, useEffect } from 'react';

export const useWalletConnection = () => {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    const checkIfWalletIsConnected = async () => {
      try {
        const { solana } = window as any;
        
        if (solana?.isPhantom) {
          const response = await solana.connect({ onlyIfTrusted: true });
          setWalletAddress(response.publicKey.toString());
          setConnected(true);
        }
      } catch (error) {
        // Silent error for auto-connection
      }
    };

    checkIfWalletIsConnected();
    
    return () => {
      setConnected(false);
      setWalletAddress(null);
    };
  }, []);

  const connect = async () => {
    try {
      const { solana } = window as any;
      
      if (!solana?.isPhantom) {
        window.open('https://phantom.app/', '_blank');
        return;
      }

      setConnecting(true);
      const response = await solana.connect();
      setWalletAddress(response.publicKey.toString());
      setConnected(true);
    } catch (error) {
      console.error('Error connecting to wallet:', error);
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = async () => {
    try {
      const { solana } = window as any;
      
      if (solana) {
        await solana.disconnect();
        setWalletAddress(null);
        setConnected(false);
      }
    } catch (error) {
      console.error('Error disconnecting from wallet:', error);
    }
  };

  return {
    connected,
    connecting,
    walletAddress,
    connect,
    disconnect
  };
};
