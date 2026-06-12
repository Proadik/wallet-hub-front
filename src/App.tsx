import './App.css'
import {
  WalletAdapterProvider,
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TrustWalletSolanaAdapter,
  TrustWalletAdapter,
  MetaMaskAdapter,
} from 'wallet-hub'
import { UnifiedWalletConnector } from './components/UnifiedWalletConnector'

const SOLANA_DEVNET = 'https://api.devnet.solana.com';

const wallets = [
  new PhantomWalletAdapter({ rpcEndpoint: SOLANA_DEVNET }),
  new SolflareWalletAdapter({ rpcEndpoint: SOLANA_DEVNET }),
  new TrustWalletSolanaAdapter({ rpcEndpoint: SOLANA_DEVNET }),
  new TrustWalletAdapter(),
  new MetaMaskAdapter(),
];

function App() {
  return (
    <WalletAdapterProvider wallets={wallets}>
      <UnifiedWalletConnector />
    </WalletAdapterProvider>
  )
}

export default App
