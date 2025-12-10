import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';

const MULTISIG_STORAGE_KEY = 'x-multisig-v4';

// Get multisig address from URL params (supports both ?multisig= and /squads/{address} formats)
const getMultisigFromUrl = (): string | null => {
  if (typeof window !== 'undefined') {
    // Check URL search params
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
    const multisigParam = urlParams.get('multisig') || hashParams.get('multisig');

    if (multisigParam) {
      return multisigParam;
    }

    // Check for /squads/{address} format in URL path (for links from Crafts)
    const pathMatch = window.location.pathname.match(/\/squads\/([A-Za-z0-9]{32,44})/);
    if (pathMatch && pathMatch[1]) {
      return pathMatch[1];
    }
  }
  return null;
};

const getMultisigAddress = () => {
  if (typeof window !== 'undefined') {
    // First check URL params/path (allows deep linking)
    const urlMultisig = getMultisigFromUrl();
    if (urlMultisig) {
      // Persist to localStorage so it stays across navigation
      localStorage.setItem(MULTISIG_STORAGE_KEY, urlMultisig);
      return urlMultisig;
    }
    return localStorage.getItem(MULTISIG_STORAGE_KEY) || null;
  }
  return null;
};

export const useMultisigAddress = () => {
  const queryClient = useQueryClient();

  const { data: multisigAddress } = useSuspenseQuery({
    queryKey: [MULTISIG_STORAGE_KEY],
    queryFn: async () => getMultisigAddress(), // Always resolves
  });

  const setMultisigAddress = useMutation({
    mutationFn: async (newAddress: string | null) => {
      if (newAddress) {
        localStorage.setItem(MULTISIG_STORAGE_KEY, newAddress);
      } else {
        localStorage.removeItem(MULTISIG_STORAGE_KEY); // Remove if null
      }
      return newAddress;
    },
    onSuccess: (newAddress) => {
      queryClient.setQueryData([MULTISIG_STORAGE_KEY], newAddress);
    },
  });

  return { multisigAddress, setMultisigAddress };
};
