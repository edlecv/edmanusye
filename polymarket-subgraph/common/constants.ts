import { Address, BigInt } from '@graphprotocol/graph-ts';

const CONDITIONAL_TOKENS = Address.fromString(
  '0x4D97DCd97eC945f40cF65F87097ACe5EA0476045',
);
const USDC = Address.fromString('0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174');
const NEG_RISK_WRAPPED_COLLATERAL = Address.fromString(
  '0x3A3BD7bb9528E159577F7C2e685CC81A765002E2',
);
const NEG_RISK_ADAPTER = Address.fromString(
  '0xd91E80cF2E7be2e162c6513ceD06f1dD0dA35296',
);
const EXCHANGE = Address.fromString('0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E');
const NEG_RISK_EXCHANGE = Address.fromString(
  '0xC5d563A36AE78145C45a50134d48A1215220f80a',
);
const NEG_RISK_OPERATOR = Address.fromString(
  '0x71523d0f655B41E805Cec45b17163f528B59B820',
);
const PROXY_WALLET_FACTORY = Address.fromString(
  '0xaB45c5A4B0c941a2F231C04C3f49182e1A254052',
);
const PROXY_WALLET_IMPLEMENTATION = Address.fromString(
  '0x44e999d5c2F66Ef0861317f9A4805AC2e90aEB4f',
);
const RELAY_HUB = Address.fromString('0xD216153c06E857cD7f72665E0aF1d7D82172F494');

const COLLATERAL_SCALE = BigInt.fromI32(10).pow(6);
const COLLATERAL_SCALE_DEC = COLLATERAL_SCALE.toBigDecimal();

enum TradeType {
  BUY = 0,
  SELL = 1,
}

const FIFTY_CENTS = COLLATERAL_SCALE.div(BigInt.fromI32(2));

export {
  COLLATERAL_SCALE,
  COLLATERAL_SCALE_DEC,
  CONDITIONAL_TOKENS,
  EXCHANGE,
  FIFTY_CENTS,
  NEG_RISK_ADAPTER,
  NEG_RISK_EXCHANGE,
  NEG_RISK_OPERATOR,
  NEG_RISK_WRAPPED_COLLATERAL,
  PROXY_WALLET_FACTORY,
  PROXY_WALLET_IMPLEMENTATION,
  RELAY_HUB,
  USDC,
  TradeType,
};
