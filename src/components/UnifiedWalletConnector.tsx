import { type ReactNode, isValidElement } from 'react';
import { useWalletAdapter, type BaseAdapter } from 'wallet-hub';
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';

const PANEL_STYLE: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  border: '2px solid #ccc',
  borderRadius: '8px',
  padding: '16px',
  minWidth: '300px',
  flex: 1,
};

const WALLET_BTN_BASE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 12px',
  cursor: 'pointer',
  borderRadius: '6px',
  border: '1px solid #ccc',
  background: '#f5f5f5',
  fontSize: '14px',
  textAlign: 'left',
};

const WALLET_BTN_ACTIVE: React.CSSProperties = {
  ...WALLET_BTN_BASE,
  background: '#e8f5e9',
  border: '2px solid #4caf50',
  fontWeight: 600,
};

const ACTION_BTN: React.CSSProperties = {
  padding: '8px 12px',
  cursor: 'pointer',
  borderRadius: '6px',
  border: '1px solid #1976d2',
  background: '#e3f2fd',
  fontSize: '13px',
};

const ERROR_STYLE: React.CSSProperties = {
  color: '#c62828',
  background: '#ffebee',
  padding: '8px',
  borderRadius: '4px',
  fontSize: '13px',
};

const STATUS_STYLE: React.CSSProperties = {
  color: '#2e7d32',
  background: '#e8f5e9',
  padding: '8px',
  borderRadius: '4px',
  fontSize: '13px',
};

const WalletIcon = ({ w }: { w: BaseAdapter }) => {
  const custom = (w as any).customIcon;
  if (isValidElement(custom)) return <span style={{ width: 20, height: 20, display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>{custom}</span>;
  if (typeof custom === 'string') return <img src={custom} alt={w.name} style={{ width: 20, height: 20, flexShrink: 0 }} />;
  return <img src={w.icon} alt={w.name} style={{ width: 20, height: 20, flexShrink: 0 }} />;
};

export function UnifiedWalletConnector(): ReactNode {
  const { evm, solana } = useWalletAdapter();

  // ── Solana handlers ──────────────────────────────────────────

  const handleSolanaSignMessage = async () => {
    try {
      const sig = await solana.signMessageAndEncodeToBase58('Hello from wallet-hub!');
      alert(`Signature (base58): ${sig.substring(0, 20)}...`);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleSolanaSendTx = async () => {
    if (!solana.publicKey) return;
    try {
      const rpcEndpoint = (solana.active as any)?.rpcEndpoint ?? 'https://api.devnet.solana.com';
      const connection = new Connection(rpcEndpoint, 'confirmed');
      const fromPubkey = new PublicKey(solana.publicKey);
      const { blockhash } = await connection.getLatestBlockhash('finalized');
      const tx = new Transaction({ recentBlockhash: blockhash, feePayer: fromPubkey }).add(
        SystemProgram.transfer({ fromPubkey, toPubkey: fromPubkey, lamports: 1000 }),
      );
      const sig = await solana.sendTransaction(tx);
      alert(`Tx signature: ${sig.substring(0, 20)}...`);
    } catch (err: any) {
      console.error(err);
    }
  };

  // ── EVM handlers ─────────────────────────────────────────────

  const handleEvmSignMessage = async () => {
    try {
      const sig = await evm.signMessageAndEncodeToBase58('Hello from wallet-hub!');
      alert(`Signature (base58): ${sig.substring(0, 20)}...`);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleEvmSendTx = async () => {
    if (!evm.publicKey) return;
    try {
      const hash = await evm.sendTransaction({ to: evm.publicKey, value: '0x0' });
      alert(`Tx hash: ${hash}`);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleEvmVersion = async () => {
    try {
      const v = await evm.request({ method: 'web3_clientVersion' });
      alert(`Client version: ${v}`);
    } catch (err: any) {
      console.error(err);
    }
  };

  const chainName = (chainId: string | null) => {
    const names: Record<string, string> = {
      '0x1': 'Ethereum',
      '0x89': 'Polygon',
      '0x38': 'BSC',
      '0xa': 'Optimism',
      '0xa4b1': 'Arbitrum',
      '0xaa36a7': 'Sepolia',
    };
    if (!chainId) return null;
    return names[chainId] ?? chainId;
  };

  return (
    <div style={{ display: 'flex', gap: '20px', padding: '20px', flexWrap: 'wrap' }}>

      {/* ── Solana Panel ── */}
      <div style={{ ...PANEL_STYLE, borderColor: '#7b1fa2' }}>
        <h3 style={{ margin: 0, color: '#7b1fa2' }}>Solana Wallet</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {solana.wallets.map(w => (
            <button
              key={w.name}
              style={solana.active === w ? WALLET_BTN_ACTIVE : WALLET_BTN_BASE}
              onClick={() => solana.select(w)}
            >
              <WalletIcon w={w} />
              {w.name}
              {w.readyState === 'Installed' ? ' ✓' : ' (not installed)'}
            </button>
          ))}
        </div>

        {solana.error && <div style={ERROR_STYLE}>{solana.error.reason}</div>}

        {solana.connecting && <div style={{ fontSize: 13, color: '#555' }}>Connecting…</div>}

        {solana.connected && solana.publicKey && (
          <div style={STATUS_STYLE}>
            Connected: {solana.shortenedPublicKey}
          </div>
        )}

        {!solana.connected && solana.active && (
          <button style={ACTION_BTN} onClick={solana.connect}>
            Connect {solana.active.name}
          </button>
        )}

        {solana.connected && (
          <>
            <button style={ACTION_BTN} onClick={handleSolanaSignMessage}>
              Sign message
            </button>
            <button style={ACTION_BTN} onClick={handleSolanaSendTx}>
              Send test tx (devnet)
            </button>
            <button style={{ ...ACTION_BTN, borderColor: '#c62828', background: '#ffebee' }} onClick={solana.disconnect}>
              Disconnect
            </button>
          </>
        )}
      </div>

      {/* ── EVM Panel ── */}
      <div style={{ ...PANEL_STYLE, borderColor: '#e65100' }}>
        <h3 style={{ margin: 0, color: '#e65100' }}>EVM Wallet</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {evm.wallets.map(w => (
            <button
              key={w.name}
              style={evm.active === w ? WALLET_BTN_ACTIVE : WALLET_BTN_BASE}
              onClick={() => evm.select(w)}
            >
              <WalletIcon w={w} />
              {w.name}
              {w.readyState === 'Installed' ? ' ✓' : ' (not installed)'}
            </button>
          ))}
        </div>

        {evm.error && <div style={ERROR_STYLE}>{evm.error.reason}</div>}

        {evm.connecting && <div style={{ fontSize: 13, color: '#555' }}>Connecting…</div>}

        {evm.connected && evm.publicKey && (
          <div style={STATUS_STYLE}>
            <div>Connected: {evm.shortenedPublicKey}</div>
            {evm.chainId && <div style={{ marginTop: 4, fontSize: 12 }}>Network: {chainName(evm.chainId)}</div>}
          </div>
        )}

        {!evm.connected && evm.active && (
          <button style={ACTION_BTN} onClick={evm.connect}>
            Connect {evm.active.name}
          </button>
        )}

        {evm.connected && (
          <>
            <button style={ACTION_BTN} onClick={handleEvmSignMessage}>
              Sign message
            </button>
            <button style={ACTION_BTN} onClick={handleEvmSendTx}>
              Send test tx (0 ETH to self)
            </button>
            <button style={ACTION_BTN} onClick={handleEvmVersion}>
              Client version
            </button>
            <button style={{ ...ACTION_BTN, borderColor: '#c62828', background: '#ffebee' }} onClick={evm.disconnect}>
              Disconnect
            </button>
          </>
        )}
      </div>

    </div>
  );
}
