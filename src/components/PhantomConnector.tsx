import {type ReactNode, useEffect} from 'react';
import {usePhantomAdapter} from "wallet-hub";
import bs58 from 'bs58';

export function PhantomConnector(): ReactNode {
  const {
    connect, connecting, publicKey, adapter, shortenedPublicKey,
    connected, disconnect, errorResponse, signMessageAndEncodeToBase58, signMessage
  } = usePhantomAdapter()

  const handleConnect = async () => {
    await connect()
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

  useEffect(() => {
    if(errorResponse) {
      alert(errorResponse.reason)
    }
  }, [errorResponse]);

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '10px', border: '1px solid grey', padding: '15px'}}>
      <p>{adapter.name}</p>
      <img src={adapter.icon} alt=""/>
      {connecting && 'connecting'}
      {publicKey && <>{shortenedPublicKey}</>}
      {connected && <button onClick={handleDisconnect}>Disconnect</button>}
      {!connected && <button onClick={handleConnect}>Connect</button>}

      {connected && (
        <>
          <button onClick={handleSignMessageAndEncodeToBase58}>Sign Message And Encode To Base58 (string → base58)</button>
          <button onClick={handleSignMessage}>Sign Message (Uint8Array → Uint8Array)</button>
        </>
      )}
    </div>
  );
}
