import { type ReactNode, useEffect } from 'react';
import { useWalletAdapter } from 'wallet-hub';
import bs58 from 'bs58';
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';

export function UnifiedWalletConnector(): ReactNode {
  const {
    wallets,
    activeWallet,
    selectWallet,
    connect,
    connecting,
    publicKey,
    shortenedPublicKey,
    connected,
    disconnect,
    errorResponse,
    signMessageAndEncodeToBase58,
    signMessage,
    request,
    adapter,
    isPhantom,
    isSolflare,
    isMetaMask,
    isTrust,
    sendTransaction,
    environment,
  } = useWalletAdapter()

  console.log('--adapter', adapter)
  const handleSelectWallet = (wallet: typeof wallets[0]) => {
    selectWallet(wallet);
  }

  const handleConnect = async () => {
    if (!activeWallet) {
      alert('Please select a wallet first');
      return;
    }

    const isReady = activeWallet.readyState === 'Installed';
    const currentUrl = window.location.href;

    const openInstallPage = () => {
      // Fallback to adapter URL if provided
      if (activeWallet.url) {
        window.open(activeWallet.url, '_blank');
      } else {
        alert('Wallet extension not detected. Please install the wallet extension.');
      }
    };

    const openDeeplink = () => {
      const encodedUrl = encodeURIComponent(currentUrl);

      if (isMetaMask) {
        // MetaMask mobile deeplink
        window.location.href = `metamask://dapp/${encodedUrl}`;
      } else if (isPhantom) {
        // Phantom mobile deeplink
        window.location.href = `phantom://browse/${encodedUrl}`;
      } else if (isSolflare) {
        // Solflare mobile deeplink
        window.location.href = `solflare://wallet/adapt?url=${encodedUrl}`;
      } else if (isTrust) {
        // Trust Wallet deeplink
        window.location.href = `trust://open_url?url=${encodedUrl}`;
      } else {
        openInstallPage();
      }
    };

    switch (environment) {
      case 'desktop-dapp-browser':
        if (isReady) {
          await connect();
        } else {
          openInstallPage();
        }
        break;
      case 'desktop-browser':
        openInstallPage();
        break;
      case 'mobile-dapp-browser':
        await connect();
        break;
      case 'mobile-browser':
      case 'pwa':
        openDeeplink();
        break;
      default:
        await connect();
    }
  }

  const handleDisconnect = async () => {
    await disconnect()
  }

  const handleSignMessageAndEncodeToBase58 = async () => {
    try {
      // Example: signMessageAndEncodeToBase58 - accepts string, returns base58 string
      const signatureBase58 = await signMessageAndEncodeToBase58("Hello, world! This is a test message.");
      console.log('Signature (base58):', signatureBase58);

      // Decode base58 back to Uint8Array
      const signatureUint8Array = bs58.decode(signatureBase58);
      console.log('Signature (Uint8Array decoded):', signatureUint8Array);

      alert(`Signature (base58): ${signatureBase58.substring(0, 20)}...\nDecoded length: ${signatureUint8Array.length} bytes`);
    } catch (error) {
      console.error('Error signing message:', error);
    }
  }

  const handleSignMessage = async () => {
    try {
      // Example: signMessage - accepts SignMessageOptions with Uint8Array, returns Uint8Array
      const message = new TextEncoder().encode("Hello, world! This is a test message.");
      const signature = await signMessage({ message });
      console.log('Signature (Uint8Array):', signature);
      // Convert to base64 for display
      const base64 = btoa(String.fromCharCode(...signature));
      alert(`Signature (base64): ${base64.substring(0, 20)}...`);
    } catch (error) {
      console.error('Error signing message:', error);
    }
  }

  const handleVersion = async () => {
    try {
      const v = await request({ method: 'web3_clientVersion' });
      console.log('--v', v);
      alert(`Client version: ${v}`);
    } catch (error) {
      console.error('Error getting version:', error);
    }
  }

  const handleSendTestTransaction = async () => {
    try {
      if (!publicKey) {
        alert('No account connected');
        return;
      }

      if (!(isMetaMask || isTrust)) {
        alert('Test transaction currently implemented for EVM wallets only (MetaMask / Trust)');
        return;
      }

      // Simple 0 ETH tx to self; wallet/provider will handle gas estimation.
      const tx = {
        to: publicKey,
        value: '0x0',
      };

      const txHash = await sendTransaction(tx);
      console.log('Test transaction hash:', txHash);
      alert(`Test transaction sent:\n${txHash}`);
    } catch (error) {
      console.error('Error sending test transaction:', error);
      alert(`Error sending test transaction: ${(error as any)?.message ?? String(error)}`);
    }
  }

  const handleSendTestSolanaTransaction = async () => {
    try {
      if (!publicKey) {
        alert('No account connected');
        return;
      }

      if (!(isPhantom || isSolflare)) {
        alert('Solana test transaction is only available for Phantom / Solflare wallets');
        return;
      }

      // Use devnet for the demo
      const connection = new Connection("https://api.mainnet-beta.solana.com", 'confirmed');
      const fromPubkey = new PublicKey(publicKey);
      const { blockhash } = await connection.getLatestBlockhash('finalized');

      const tx = new Transaction({
        recentBlockhash: blockhash,
        feePayer: fromPubkey,
      }).add(
        SystemProgram.transfer({
          fromPubkey,
          toPubkey: fromPubkey,
          lamports: 1000, // 0.000001 SOL – requires some devnet SOL
        }),
      );

      // NOTE: For Solana adapters in this package, `sendTransaction` signs the
      // transaction via the wallet and returns the signature string. It does
      // *not* broadcast the transaction to the network.
      const signature = await sendTransaction(tx);

      console.log('Signed Solana transaction signature:', signature);
      alert(
        `Signed Solana transaction (devnet)\nSignature: ${signature.substring(
          0,
          32,
        )}...\nNote: this demo only signs the tx; broadcasting is not handled here.`,
      );
    } catch (error) {
      console.error('Error sending Solana test transaction:', error);
      alert(
        `Error sending Solana test transaction: ${
          (error as any)?.message ?? String(error)
        }`,
      );
    }
  };

  useEffect(() => {
    if(errorResponse) {
      alert(errorResponse.reason)
    }
  }, [errorResponse]);

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '10px', border: '2px solid blue', padding: '15px', minWidth: '300px'}}>
      <h3>Unified Wallet Adapter</h3>

      {/* Wallet Selection */}
      <div style={{display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '10px'}}>
        <label>Select Wallet:</label>
        {wallets.map((wallet, index) => (
          <button
            key={index}
            onClick={() => handleSelectWallet(wallet)}
            style={{
              padding: '8px',
              backgroundColor: activeWallet === wallet ? '#4CAF50' : '#f0f0f0',
              color: activeWallet === wallet ? 'white' : 'black',
              border: activeWallet === wallet ? '2px solid #45a049' : '1px solid #ccc',
              cursor: 'pointer'
            }}
          >
            <img src={wallet.icon} alt={wallet.name} style={{width: '20px', height: '20px', marginRight: '8px', verticalAlign: 'middle'}}/>
            {wallet.name} {wallet.readyState === 'Installed' ? '✓' : '(Not Detected)'}
          </button>
        ))}
      </div>

      {/* Active Wallet Info */}
      {activeWallet && (
        <div style={{padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '5px', marginBottom: '10px'}}>
          <p><strong>Active Wallet:</strong> {activeWallet.name}</p>
          <img src={activeWallet.icon} alt={activeWallet.name} style={{width: '32px', height: '32px'}}/>

          {/* Example: Wallet type detection */}
          <div style={{marginTop: '10px', fontSize: '12px', color: '#666'}}>
            {isPhantom && <p>🔵 Phantom wallet detected</p>}
            {isSolflare && <p>🟠 Solflare wallet detected</p>}
            {isMetaMask && <p>🦊 MetaMask wallet detected</p>}
            {isTrust && <p>🔷 Trust Wallet detected</p>}
          </div>
        </div>
      )}

      {/* Connection Status */}
      {connecting && <p>Connecting...</p>}
      {publicKey && <p>Public Key: {shortenedPublicKey}</p>}

      {/* Connect/Disconnect */}
      {connected && <button onClick={handleDisconnect}>Disconnect</button>}
      {!connected && activeWallet && <button onClick={handleConnect}>Connect</button>}

      {/* Actions (only when connected) */}
      {connected && (
        <>
          <button onClick={handleSignMessageAndEncodeToBase58}>Sign Message And Encode To Base58 (string → base58)</button>
          <button onClick={handleSignMessage}>Sign Message (Uint8Array → Uint8Array)</button>

          {/* Example: Show request button only for EVM wallets */}
          {(isMetaMask || isTrust) && (
            <>
              <button onClick={handleVersion}>Client version (EVM only)</button>
              <button onClick={handleSendTestTransaction}>Send test tx (0 ETH to self)</button>
            </>
          )}

          {/* Example: Show Solana-specific content */}
          {(isPhantom || isSolflare) && (
            <div style={{padding: '8px', backgroundColor: '#e3f2fd', borderRadius: '4px', fontSize: '12px'}}>
              <div>🌐 Solana wallet connected</div>
              <button
                style={{marginTop: '6px'}}
                onClick={handleSendTestSolanaTransaction}
              >
                Sign test Solana tx (devnet)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

