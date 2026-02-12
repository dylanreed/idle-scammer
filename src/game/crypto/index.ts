// ABOUTME: Barrel exports for the crypto system
// ABOUTME: Re-exports types, constants, market engine, and store for convenient imports

export type {
  MarketState,
  MarketEvent,
  MarketEventType,
  ProjectDefinition,
  ProjectState,
  NFTRarity,
  NFTItem,
  NFTCollection,
  CryptoSaveData,
} from './types';
export { DEFAULT_MARKET_STATE, DEFAULT_CRYPTO_SAVE_DATA } from './types';
export {
  BASE_EXCHANGE_RATE,
  MARKET_TICK_INTERVAL_MS,
  BASE_VOLATILITY,
  BASE_DRIFT,
  EVENT_CHANCE_PER_TICK,
  EVENT_DURATION_TICKS,
  MIN_EXCHANGE_RATE,
  MAX_EXCHANGE_RATE,
  EXCHANGE_FEE,
  MARKET_EVENTS,
  MARKET_EVENT_TYPES,
  MAX_ACTIVE_PROJECTS,
  PROJECT_DEFINITIONS,
  MAX_COLLECTIONS,
  NFT_RARITY_WEIGHTS,
  BASE_MINT_COST,
  NFT_RARITY_MULTIPLIERS,
  HYPE_DECAY_RATE,
  HYPE_SHILL_BOOST,
  MAX_HYPE,
  RUG_PULL_FRACTION,
  BASE_FLOOR_PRICE_PER_HYPE,
} from './constants';
export {
  nextSeed,
  seedToRandom,
  boxMuller,
  tickMarket,
  calculateCryptoFromMoney,
  calculateMoneyFromCrypto,
} from './market';
export {
  checkRugPull,
  calculateReturn,
  isProjectMatured,
  calculatePayout,
  getProjectDefinition,
} from './projects';
export {
  rollNFTRarity,
  calculateMintCost,
  calculateFloorPrice,
  calculateCollectionFloorPrice,
  tickHype,
  calculateRugPullReturn,
} from './nfts';
export { useCryptoStore } from './cryptoStore';
export type { CryptoStoreActions, CryptoStoreState } from './cryptoStore';
