// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  EthereumCall,
  EthereumEvent,
  SmartContract,
  EthereumValue,
  JSONValue,
  TypedMap,
  Entity,
  EthereumTuple,
  Bytes,
  Address,
  BigInt,
  CallResult
} from "@graphprotocol/graph-ts";

export class CreateDelegate extends EthereumEvent {
  get params(): CreateDelegate__Params {
    return new CreateDelegate__Params(this);
  }
}

export class CreateDelegate__Params {
  _event: CreateDelegate;

  constructor(event: CreateDelegate) {
    this._event = event;
  }

  get delegateContract(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get swapContract(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get indexerContract(): Address {
    return this._event.parameters[2].value.toAddress();
  }

  get delegateContractOwner(): Address {
    return this._event.parameters[3].value.toAddress();
  }

  get delegateTradeWallet(): Address {
    return this._event.parameters[4].value.toAddress();
  }
}

export class DelegateFactory extends SmartContract {
  static bind(address: Address): DelegateFactory {
    return new DelegateFactory("DelegateFactory", address);
  }

  createDelegate(delegateTradeWallet: Address): Address {
    let result = super.call("createDelegate", [
      EthereumValue.fromAddress(delegateTradeWallet)
    ]);

    return result[0].toAddress();
  }

  try_createDelegate(delegateTradeWallet: Address): CallResult<Address> {
    let result = super.tryCall("createDelegate", [
      EthereumValue.fromAddress(delegateTradeWallet)
    ]);
    if (result.reverted) {
      return new CallResult();
    }
    let value = result.value;
    return CallResult.fromValue(value[0].toAddress());
  }

  has(locator: Bytes): boolean {
    let result = super.call("has", [EthereumValue.fromFixedBytes(locator)]);

    return result[0].toBoolean();
  }

  try_has(locator: Bytes): CallResult<boolean> {
    let result = super.tryCall("has", [EthereumValue.fromFixedBytes(locator)]);
    if (result.reverted) {
      return new CallResult();
    }
    let value = result.value;
    return CallResult.fromValue(value[0].toBoolean());
  }

  indexerContract(): Address {
    let result = super.call("indexerContract", []);

    return result[0].toAddress();
  }

  try_indexerContract(): CallResult<Address> {
    let result = super.tryCall("indexerContract", []);
    if (result.reverted) {
      return new CallResult();
    }
    let value = result.value;
    return CallResult.fromValue(value[0].toAddress());
  }

  protocol(): Bytes {
    let result = super.call("protocol", []);

    return result[0].toBytes();
  }

  try_protocol(): CallResult<Bytes> {
    let result = super.tryCall("protocol", []);
    if (result.reverted) {
      return new CallResult();
    }
    let value = result.value;
    return CallResult.fromValue(value[0].toBytes());
  }

  swapContract(): Address {
    let result = super.call("swapContract", []);

    return result[0].toAddress();
  }

  try_swapContract(): CallResult<Address> {
    let result = super.tryCall("swapContract", []);
    if (result.reverted) {
      return new CallResult();
    }
    let value = result.value;
    return CallResult.fromValue(value[0].toAddress());
  }
}

export class ConstructorCall extends EthereumCall {
  get inputs(): ConstructorCall__Inputs {
    return new ConstructorCall__Inputs(this);
  }

  get outputs(): ConstructorCall__Outputs {
    return new ConstructorCall__Outputs(this);
  }
}

export class ConstructorCall__Inputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }

  get factorySwapContract(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get factoryIndexerContract(): Address {
    return this._call.inputValues[1].value.toAddress();
  }

  get factoryProtocol(): Bytes {
    return this._call.inputValues[2].value.toBytes();
  }
}

export class ConstructorCall__Outputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }
}

export class CreateDelegateCall extends EthereumCall {
  get inputs(): CreateDelegateCall__Inputs {
    return new CreateDelegateCall__Inputs(this);
  }

  get outputs(): CreateDelegateCall__Outputs {
    return new CreateDelegateCall__Outputs(this);
  }
}

export class CreateDelegateCall__Inputs {
  _call: CreateDelegateCall;

  constructor(call: CreateDelegateCall) {
    this._call = call;
  }

  get delegateTradeWallet(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class CreateDelegateCall__Outputs {
  _call: CreateDelegateCall;

  constructor(call: CreateDelegateCall) {
    this._call = call;
  }

  get delegateContractAddress(): Address {
    return this._call.outputValues[0].value.toAddress();
  }
}
