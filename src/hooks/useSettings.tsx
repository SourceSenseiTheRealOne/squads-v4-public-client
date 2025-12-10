import * as multisig from '@sqds/multisig';
// top level
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';

// Network detection from URL parameters
const getNetworkFromUrl = (): 'devnet' | 'mainnet-beta' => {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
    const network = urlParams.get('network') || hashParams.get('network');
    if (network === 'devnet') return 'devnet';
    if (network === 'mainnet' || network === 'mainnet-beta') return 'mainnet-beta';
  }
  return 'devnet'; // Default to devnet for safety
};

// RPC URLs for each network
const RPC_URLS: Record<string, string> = {
  'devnet': 'https://api.devnet.solana.com',
  'mainnet-beta': 'https://api.mainnet-beta.solana.com',
};

const DEFAULT_NETWORK = getNetworkFromUrl();
const DEFAULT_RPC_URL = RPC_URLS[DEFAULT_NETWORK];

const getRpcUrl = () => {
  if (typeof document !== 'undefined') {
    // Check URL params first for network override
    const networkFromUrl = getNetworkFromUrl();
    const storedRpc = localStorage.getItem('x-rpc-url');

    // ALWAYS use URL network param when present - clear any conflicting localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
    const hasNetworkParam = urlParams.has('network') || hashParams.has('network');

    if (hasNetworkParam) {
      // URL has explicit network param - always use it and clear any conflicting stored RPC
      const targetRpc = RPC_URLS[networkFromUrl];
      if (storedRpc && storedRpc !== targetRpc) {
        console.log(`[Settings] Clearing conflicting stored RPC. URL network: ${networkFromUrl}, clearing stored: ${storedRpc}`);
        localStorage.removeItem('x-rpc-url');
      }
      console.log(`[Settings] Using network from URL: ${networkFromUrl}, RPC: ${targetRpc}`);
      return targetRpc;
    }

    // No URL param, use stored or default
    if (storedRpc) {
      console.log(`[Settings] Using stored RPC: ${storedRpc}`);
      return storedRpc;
    }

    console.log(`[Settings] Using default RPC for network: ${networkFromUrl}`);
    return RPC_URLS[networkFromUrl];
  }
  return DEFAULT_RPC_URL;
};

// Export network getter for use in Wallet component
export const getCurrentNetwork = getNetworkFromUrl;

export const useRpcUrl = () => {
  const queryClient = useQueryClient();

  const { data: rpcUrl } = useSuspenseQuery({
    queryKey: ['rpcUrl'],
    queryFn: () => Promise.resolve(getRpcUrl()),
  });

  const setRpcUrl = useMutation({
    mutationFn: (newRpcUrl: string) => {
      localStorage.setItem(`x-rpc-url`, newRpcUrl);
      return Promise.resolve(newRpcUrl);
    },
    onSuccess: (newRpcUrl) => {
      queryClient.setQueryData(['rpcUrl'], newRpcUrl);
    },
  });

  return { rpcUrl, setRpcUrl };
};

const DEFAULT_PROGRAM_ID = multisig.PROGRAM_ID.toBase58();

const getProgramId = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('x-program-id-v4') || DEFAULT_PROGRAM_ID;
  }
  return DEFAULT_PROGRAM_ID;
};

export const useProgramId = () => {
  const queryClient = useQueryClient();

  const { data: programId } = useSuspenseQuery({
    queryKey: ['programId'],
    queryFn: () => Promise.resolve(getProgramId()),
  });

  const setProgramId = useMutation({
    mutationFn: (newProgramId: string) => {
      localStorage.setItem('x-program-id-v4', newProgramId);
      return Promise.resolve(newProgramId);
    },
    onSuccess: (newProgramId) => {
      queryClient.setQueryData(['programId'], newProgramId);
    },
  });
  return { programId, setProgramId };
};

// explorer url
const DEFAULT_EXPLORER_URL = 'https://explorer.solana.com';
const getExplorerUrl = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('x-explorer-url') || DEFAULT_EXPLORER_URL;
  }
  return DEFAULT_PROGRAM_ID;
};

export const useExplorerUrl = () => {
  const queryClient = useQueryClient();

  const { data: explorerUrl } = useSuspenseQuery({
    queryKey: ['explorerUrl'],
    queryFn: () => Promise.resolve(getExplorerUrl()),
  });

  const setExplorerUrl = useMutation({
    mutationFn: (newExplorerUrl: string) => {
      localStorage.setItem('x-explorer-url', newExplorerUrl);
      return Promise.resolve(newExplorerUrl);
    },
    onSuccess: (newExplorerUrl) => {
      queryClient.setQueryData(['explorerUrl'], newExplorerUrl);
    },
  });
  return { explorerUrl, setExplorerUrl };
};
