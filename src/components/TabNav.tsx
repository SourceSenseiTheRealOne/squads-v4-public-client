import { ArrowDownUp, LucideHome, Settings, Users, Box, Github, PlusCircle } from 'lucide-react';
import ConnectWallet from '@/components/ConnectWalletButton';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { ChangeMultisigFromNav } from './ChangeMultisigFromNav';
import { useMemo } from 'react';

// Get network from URL for display
const getNetworkLabel = (): { label: string; isDevnet: boolean } => {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
    const network = urlParams.get('network') || hashParams.get('network');
    if (network === 'mainnet' || network === 'mainnet-beta') {
      return { label: 'Mainnet', isDevnet: false };
    }
  }
  return { label: 'Devnet', isDevnet: true };
};

export default function TabNav() {
  const location = useLocation();
  const path = location.pathname;
  const networkInfo = useMemo(() => getNetworkLabel(), []);
  const tabs = [
    { name: 'Home', icon: <LucideHome />, route: '/' },
    { name: 'Create Squad', icon: <PlusCircle />, route: '/create/' },
    { name: 'Transactions', icon: <ArrowDownUp />, route: '/transactions/' },
    { name: 'Configuration', icon: <Users />, route: '/config/' },
    { name: 'Programs', icon: <Box />, route: '/programs/' },
    { name: 'Settings', icon: <Settings />, route: '/settings/' },
  ];

  return (
    <>
      <aside
        id="sidebar"
        className="z-40 hidden h-auto md:fixed md:left-0 md:top-0 md:block md:h-screen md:w-3/12 lg:w-3/12"
        aria-label="Sidebar"
      >
        <div className="flex h-auto flex-col justify-between overflow-y-auto border-slate-200 bg-slate-200 px-3 py-4 md:h-full md:border-r">
          <div>
            <Link to="/">
              <div className="mb-4 flex items-center rounded-lg px-3 py-2 text-slate-900 dark:text-white">
                <img src="/logo.png" width="150" height="auto" />
              </div>
            </Link>
            <div className="mb-6 px-3">
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                networkInfo.isDevnet 
                  ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' 
                  : 'bg-green-100 text-green-800 border border-green-300'
              }`}>
                <span className={`mr-1.5 h-2 w-2 rounded-full ${
                  networkInfo.isDevnet ? 'bg-yellow-500' : 'bg-green-500'
                }`}></span>
                {networkInfo.label}
              </span>
            </div>
            <ul className="space-y-2 text-sm font-medium">
              {tabs.map((tab) => (
                <li key={tab.route}>
                  <Link
                    to={tab.route}
                    className={`flex items-center rounded-lg px-4 py-3 text-slate-900 ${
                      (path!.startsWith(`${tab.route}/`) && tab.route !== '/') || tab.route === path
                        ? 'bg-slate-400'
                        : 'hover:bg-slate-400'
                    }`}
                  >
                    {tab.icon}
                    <span className="ml-3 flex-1 whitespace-nowrap text-base text-black">
                      {tab.name}
                    </span>
                  </Link>
                </li>
              ))}
              <li key={'github-link'}>
                <Link
                  key={`github-link`}
                  to="https://github.com/Squads-Protocol/public-v4-client"
                  target="_blank"
                  rel="noreferrer"
                  className={`flex items-center rounded-lg px-4 py-3 text-slate-900 hover:bg-slate-400`}
                >
                  <Github />
                  <span className="ml-3 flex-1 whitespace-nowrap text-base text-black">
                    GitHub Repo
                  </span>
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <ChangeMultisigFromNav />
            <ConnectWallet />
          </div>
        </div>
      </aside>

      <aside
        id="mobile-navbar"
        className="bg-slate-20 fixed inset-x-0 bottom-0 z-50 block bg-slate-300 p-2 md:hidden"
        aria-label="Mobile navbar"
      >
        <div className="mx-auto mt-1 grid h-full max-w-lg grid-cols-5 font-medium">
          {tabs.map((tab) => (
            <Link to={tab.route} key={tab.route} className={`flex justify-center`}>
              <button
                type="button"
                className="group inline-flex flex-col items-center justify-center rounded-md py-2 hover:bg-slate-400"
              >
                {tab.icon}
                <span className="flex-1 whitespace-nowrap text-sm text-slate-900">{tab.name}</span>
              </button>
            </Link>
          ))}
        </div>
      </aside>
    </>
  );
}
