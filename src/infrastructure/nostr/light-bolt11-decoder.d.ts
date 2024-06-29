declare module 'light-bolt11-decoder' {
  export interface Network {
    bech32: string
    pubKeyHash: number
    scriptHash: number
    validWitnessVersions: number[]
  }

  export interface RouteHint {
    pubkey: string
    short_channel_id: string
    fee_base_msat: number
    fee_proportional_millionths: number
    cltv_expiry_delta: number
  }

  export interface FeatureBits {
    [key: string]: 'required' | 'supported' | 'unsupported'
    extra_bits: {
      start_bit: number
      bits: boolean[]
      has_required: boolean
    }
  }

  export interface DecodedSection {
    name: string
    letters: string
    value?: any
    tag?: string
  }

  export interface DecodedInvoice {
    paymentRequest: string
    sections: DecodedSection[]
    expiry?: number
    route_hints: RouteHint[]
    payment_hash?: string
    payment_secret?: string
    description?: string
    payee?: string
    description_hash?: string
    min_final_cltv_expiry?: number
    fallback_address?: string
    feature_bits?: FeatureBits
    metadata?: string
  }

  export function decode(
    paymentRequest: string,
    network?: Network
  ): DecodedInvoice

  export function hrpToMillisat(
    hrpString: string,
    outputString?: boolean
  ): string | bigint

  export const DEFAULTNETWORK: Network
  export const TESTNETWORK: Network
  export const SIGNETNETWORK: Network
  export const REGTESTNETWORK: Network
  export const SIMNETWORK: Network
}
