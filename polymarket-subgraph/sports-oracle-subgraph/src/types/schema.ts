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

export class Game extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Game entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type Game must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`,
      );
      store.set("Game", id.toString(), this);
    }
  }

  static loadInBlock(id: string): Game | null {
    return changetype<Game | null>(store.get_in_block("Game", id));
  }

  static load(id: string): Game | null {
    return changetype<Game | null>(store.get("Game", id));
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

  get ancillaryData(): string {
    let value = this.get("ancillaryData");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set ancillaryData(value: string) {
    this.set("ancillaryData", Value.fromString(value));
  }

  get ordering(): string {
    let value = this.get("ordering");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set ordering(value: string) {
    this.set("ordering", Value.fromString(value));
  }

  get state(): string {
    let value = this.get("state");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set state(value: string) {
    this.set("state", Value.fromString(value));
  }

  get homeScore(): BigInt {
    let value = this.get("homeScore");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set homeScore(value: BigInt) {
    this.set("homeScore", Value.fromBigInt(value));
  }

  get awayScore(): BigInt {
    let value = this.get("awayScore");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set awayScore(value: BigInt) {
    this.set("awayScore", Value.fromBigInt(value));
  }
}

export class Market extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Market entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type Market must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`,
      );
      store.set("Market", id.toString(), this);
    }
  }

  static loadInBlock(id: string): Market | null {
    return changetype<Market | null>(store.get_in_block("Market", id));
  }

  static load(id: string): Market | null {
    return changetype<Market | null>(store.get("Market", id));
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

  get gameId(): string {
    let value = this.get("gameId");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set gameId(value: string) {
    this.set("gameId", Value.fromString(value));
  }

  get state(): string {
    let value = this.get("state");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set state(value: string) {
    this.set("state", Value.fromString(value));
  }

  get marketType(): string {
    let value = this.get("marketType");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set marketType(value: string) {
    this.set("marketType", Value.fromString(value));
  }

  get underdog(): string {
    let value = this.get("underdog");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set underdog(value: string) {
    this.set("underdog", Value.fromString(value));
  }

  get line(): BigInt {
    let value = this.get("line");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set line(value: BigInt) {
    this.set("line", Value.fromBigInt(value));
  }

  get payouts(): Array<BigInt> {
    let value = this.get("payouts");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigIntArray();
    }
  }

  set payouts(value: Array<BigInt>) {
    this.set("payouts", Value.fromBigIntArray(value));
  }
}
