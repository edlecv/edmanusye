// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  TypedMap,
  Entity,
  Value,
  ValueKind,
  store,
  Bytes,
  BigInt,
  BigDecimal,
} from "@graphprotocol/graph-ts";

export class MarketData extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save MarketData entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type MarketData must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`,
      );
      store.set("MarketData", id.toString(), this);
    }
  }

  static loadInBlock(id: string): MarketData | null {
    return changetype<MarketData | null>(store.get_in_block("MarketData", id));
  }

  static load(id: string): MarketData | null {
    return changetype<MarketData | null>(store.get("MarketData", id));
  }

  get id(): string {
    let value = this.get("id");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get condition(): string {
    let value = this.get("condition");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set condition(value: string) {
    this.set("condition", Value.fromString(value));
  }

  get outcomeIndex(): BigInt | null {
    let value = this.get("outcomeIndex");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toBigInt();
    }
  }

  set outcomeIndex(value: BigInt | null) {
    if (!value) {
      this.unset("outcomeIndex");
    } else {
      this.set("outcomeIndex", Value.fromBigInt(<BigInt>value));
    }
  }
}

export class OrderFilledEvent extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save OrderFilledEvent entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type OrderFilledEvent must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`,
      );
      store.set("OrderFilledEvent", id.toString(), this);
    }
  }

  static loadInBlock(id: string): OrderFilledEvent | null {
    return changetype<OrderFilledEvent | null>(
      store.get_in_block("OrderFilledEvent", id),
    );
  }

  static load(id: string): OrderFilledEvent | null {
    return changetype<OrderFilledEvent | null>(
      store.get("OrderFilledEvent", id),
    );
  }

  get id(): string {
    let value = this.get("id");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get transactionHash(): Bytes {
    let value = this.get("transactionHash");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBytes();
    }
  }

  set transactionHash(value: Bytes) {
    this.set("transactionHash", Value.fromBytes(value));
  }

  get timestamp(): BigInt {
    let value = this.get("timestamp");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set timestamp(value: BigInt) {
    this.set("timestamp", Value.fromBigInt(value));
  }

  get orderHash(): Bytes {
    let value = this.get("orderHash");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBytes();
    }
  }

  set orderHash(value: Bytes) {
    this.set("orderHash", Value.fromBytes(value));
  }

  get maker(): string {
    let value = this.get("maker");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set maker(value: string) {
    this.set("maker", Value.fromString(value));
  }

  get taker(): string {
    let value = this.get("taker");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set taker(value: string) {
    this.set("taker", Value.fromString(value));
  }

  get makerAssetId(): string {
    let value = this.get("makerAssetId");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set makerAssetId(value: string) {
    this.set("makerAssetId", Value.fromString(value));
  }

  get takerAssetId(): string {
    let value = this.get("takerAssetId");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set takerAssetId(value: string) {
    this.set("takerAssetId", Value.fromString(value));
  }

  get makerAmountFilled(): BigInt {
    let value = this.get("makerAmountFilled");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set makerAmountFilled(value: BigInt) {
    this.set("makerAmountFilled", Value.fromBigInt(value));
  }

  get takerAmountFilled(): BigInt {
    let value = this.get("takerAmountFilled");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set takerAmountFilled(value: BigInt) {
    this.set("takerAmountFilled", Value.fromBigInt(value));
  }

  get fee(): BigInt {
    let value = this.get("fee");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set fee(value: BigInt) {
    this.set("fee", Value.fromBigInt(value));
  }
}

export class OrdersMatchedEvent extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save OrdersMatchedEvent entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type OrdersMatchedEvent must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`,
      );
      store.set("OrdersMatchedEvent", id.toString(), this);
    }
  }

  static loadInBlock(id: string): OrdersMatchedEvent | null {
    return changetype<OrdersMatchedEvent | null>(
      store.get_in_block("OrdersMatchedEvent", id),
    );
  }

  static load(id: string): OrdersMatchedEvent | null {
    return changetype<OrdersMatchedEvent | null>(
      store.get("OrdersMatchedEvent", id),
    );
  }

  get id(): string {
    let value = this.get("id");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get timestamp(): BigInt {
    let value = this.get("timestamp");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set timestamp(value: BigInt) {
    this.set("timestamp", Value.fromBigInt(value));
  }

  get makerAssetID(): BigInt {
    let value = this.get("makerAssetID");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set makerAssetID(value: BigInt) {
    this.set("makerAssetID", Value.fromBigInt(value));
  }

  get takerAssetID(): BigInt {
    let value = this.get("takerAssetID");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set takerAssetID(value: BigInt) {
    this.set("takerAssetID", Value.fromBigInt(value));
  }

  get makerAmountFilled(): BigInt {
    let value = this.get("makerAmountFilled");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set makerAmountFilled(value: BigInt) {
    this.set("makerAmountFilled", Value.fromBigInt(value));
  }

  get takerAmountFilled(): BigInt {
    let value = this.get("takerAmountFilled");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set takerAmountFilled(value: BigInt) {
    this.set("takerAmountFilled", Value.fromBigInt(value));
  }
}

export class Orderbook extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Orderbook entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type Orderbook must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`,
      );
      store.set("Orderbook", id.toString(), this);
    }
  }

  static loadInBlock(id: string): Orderbook | null {
    return changetype<Orderbook | null>(store.get_in_block("Orderbook", id));
  }

  static load(id: string): Orderbook | null {
    return changetype<Orderbook | null>(store.get("Orderbook", id));
  }

  get id(): string {
    let value = this.get("id");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get tradesQuantity(): BigInt {
    let value = this.get("tradesQuantity");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set tradesQuantity(value: BigInt) {
    this.set("tradesQuantity", Value.fromBigInt(value));
  }

  get buysQuantity(): BigInt {
    let value = this.get("buysQuantity");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set buysQuantity(value: BigInt) {
    this.set("buysQuantity", Value.fromBigInt(value));
  }

  get sellsQuantity(): BigInt {
    let value = this.get("sellsQuantity");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set sellsQuantity(value: BigInt) {
    this.set("sellsQuantity", Value.fromBigInt(value));
  }

  get collateralVolume(): BigInt {
    let value = this.get("collateralVolume");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set collateralVolume(value: BigInt) {
    this.set("collateralVolume", Value.fromBigInt(value));
  }

  get scaledCollateralVolume(): BigDecimal {
    let value = this.get("scaledCollateralVolume");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigDecimal();
    }
  }

  set scaledCollateralVolume(value: BigDecimal) {
    this.set("scaledCollateralVolume", Value.fromBigDecimal(value));
  }

  get collateralBuyVolume(): BigInt {
    let value = this.get("collateralBuyVolume");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set collateralBuyVolume(value: BigInt) {
    this.set("collateralBuyVolume", Value.fromBigInt(value));
  }

  get scaledCollateralBuyVolume(): BigDecimal {
    let value = this.get("scaledCollateralBuyVolume");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigDecimal();
    }
  }

  set scaledCollateralBuyVolume(value: BigDecimal) {
    this.set("scaledCollateralBuyVolume", Value.fromBigDecimal(value));
  }

  get collateralSellVolume(): BigInt {
    let value = this.get("collateralSellVolume");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set collateralSellVolume(value: BigInt) {
    this.set("collateralSellVolume", Value.fromBigInt(value));
  }

  get scaledCollateralSellVolume(): BigDecimal {
    let value = this.get("scaledCollateralSellVolume");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigDecimal();
    }
  }

  set scaledCollateralSellVolume(value: BigDecimal) {
    this.set("scaledCollateralSellVolume", Value.fromBigDecimal(value));
  }
}

export class OrdersMatchedGlobal extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save OrdersMatchedGlobal entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type OrdersMatchedGlobal must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`,
      );
      store.set("OrdersMatchedGlobal", id.toString(), this);
    }
  }

  static loadInBlock(id: string): OrdersMatchedGlobal | null {
    return changetype<OrdersMatchedGlobal | null>(
      store.get_in_block("OrdersMatchedGlobal", id),
    );
  }

  static load(id: string): OrdersMatchedGlobal | null {
    return changetype<OrdersMatchedGlobal | null>(
      store.get("OrdersMatchedGlobal", id),
    );
  }

  get id(): string {
    let value = this.get("id");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get tradesQuantity(): BigInt {
    let value = this.get("tradesQuantity");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set tradesQuantity(value: BigInt) {
    this.set("tradesQuantity", Value.fromBigInt(value));
  }

  get buysQuantity(): BigInt {
    let value = this.get("buysQuantity");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set buysQuantity(value: BigInt) {
    this.set("buysQuantity", Value.fromBigInt(value));
  }

  get sellsQuantity(): BigInt {
    let value = this.get("sellsQuantity");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set sellsQuantity(value: BigInt) {
    this.set("sellsQuantity", Value.fromBigInt(value));
  }

  get collateralVolume(): BigDecimal {
    let value = this.get("collateralVolume");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigDecimal();
    }
  }

  set collateralVolume(value: BigDecimal) {
    this.set("collateralVolume", Value.fromBigDecimal(value));
  }

  get scaledCollateralVolume(): BigDecimal {
    let value = this.get("scaledCollateralVolume");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigDecimal();
    }
  }

  set scaledCollateralVolume(value: BigDecimal) {
    this.set("scaledCollateralVolume", Value.fromBigDecimal(value));
  }

  get collateralBuyVolume(): BigDecimal {
    let value = this.get("collateralBuyVolume");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigDecimal();
    }
  }

  set collateralBuyVolume(value: BigDecimal) {
    this.set("collateralBuyVolume", Value.fromBigDecimal(value));
  }

  get scaledCollateralBuyVolume(): BigDecimal {
    let value = this.get("scaledCollateralBuyVolume");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigDecimal();
    }
  }

  set scaledCollateralBuyVolume(value: BigDecimal) {
    this.set("scaledCollateralBuyVolume", Value.fromBigDecimal(value));
  }

  get collateralSellVolume(): BigDecimal {
    let value = this.get("collateralSellVolume");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigDecimal();
    }
  }

  set collateralSellVolume(value: BigDecimal) {
    this.set("collateralSellVolume", Value.fromBigDecimal(value));
  }

  get scaledCollateralSellVolume(): BigDecimal {
    let value = this.get("scaledCollateralSellVolume");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigDecimal();
    }
  }

  set scaledCollateralSellVolume(value: BigDecimal) {
    this.set("scaledCollateralSellVolume", Value.fromBigDecimal(value));
  }
}
