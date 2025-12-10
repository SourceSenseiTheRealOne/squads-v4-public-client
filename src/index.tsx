import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Initialize network settings from URL params on startup
// This ensures localStorage doesn't conflict with URL network param
(() => {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
    const networkParam = urlParams.get('network') || hashParams.get('network');
    
    if (networkParam) {
      const isDevnet = networkParam === 'devnet';
      const storedRpc = localStorage.getItem('x-rpc-url');
      const isStoredDevnet = storedRpc?.includes('devnet');
      
      // Clear conflicting localStorage values
      if (storedRpc && isDevnet !== isStoredDevnet) {
        console.log(`[Init] Network mismatch: URL=${networkParam}, stored RPC=${storedRpc}. Clearing localStorage.`);
        localStorage.removeItem('x-rpc-url');
      }
      
      console.log(`[Init] Network from URL: ${networkParam}`);
    } else {
      console.log('[Init] No network param in URL, using stored/default settings');
    }
    
    // Log current settings
    console.log('[Init] Current localStorage:');
    console.log('  x-rpc-url:', localStorage.getItem('x-rpc-url') || '(not set)');
    console.log('  x-multisig-v4:', localStorage.getItem('x-multisig-v4') || '(not set)');
    console.log('  x-program-id-v4:', localStorage.getItem('x-program-id-v4') || '(not set)');
  }
})();

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
