import './App.css'
import {
  WalletAdapterProvider,
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TrustWalletAdapter,
  MetaMaskAdapter,
} from 'wallet-hub'
import {UnifiedWalletConnector} from "./components/UnifiedWalletConnector.tsx";

function App() {
  const wallets = [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    new TrustWalletAdapter(),
    new MetaMaskAdapter()
  ];

  return (
    <>
      <div style={{display: 'flex', gap: '20px', padding: '20px'}}>
        <WalletAdapterProvider wallets={wallets}>
          <UnifiedWalletConnector />
        </WalletAdapterProvider>
      </div>
    </>
  )
}

export default App
