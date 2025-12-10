'use client';
import React, {FC, useMemo} from 'react';
import {ConnectionProvider, WalletProvider} from '@solana/wallet-adapter-react';
import {WalletAdapterNetwork} from '@solana/wallet-adapter-base';
import {WalletModalProvider} from '@solana/wallet-adapter-react-ui';
import {clusterApiUrl} from '@solana/web3.js';

import '@solana/wallet-adapter-react-ui/styles.css';

// Get network from URL parameters (sync with useSettings)
const getNetworkFromUrl = (): WalletAdapterNetwork => {
    if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
        const network = urlParams.get('network') || hashParams.get('network');
        if (network === 'mainnet' || network === 'mainnet-beta') {
            return WalletAdapterNetwork.Mainnet;
        }
    }
    return WalletAdapterNetwork.Devnet; // Default to devnet for safety
};

type Props = {
    children?: React.ReactNode;
};

export const Wallet: FC<Props> = ({children}) => {
    // Read network from URL params - allows ?network=devnet or ?network=mainnet
    const network = useMemo(() => getNetworkFromUrl(), []);

    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    const wallets = useMemo(() => [], []);

    // Log for debugging
    if (typeof window !== 'undefined') {
        console.log(`[Wallet] Using network: ${network}, endpoint: ${endpoint}`);
    }

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};
