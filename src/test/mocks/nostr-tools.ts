/**
 * Mock for nostr-tools — crypto operations not needed in UI tests.
 */
export const nip44 = {
  v2: {
    encrypt: () => '',
    decrypt: () => '',
  },
}

export const finalizeEvent = (event: any) => event

export const generateSecretKey = () => new Uint8Array(32)
export const getPublicKey = () => ''
