# Security Report: Swap

Smart Contract Security Report by Team Fluidity (team[at]fluidity[dot]io) and Phil Daian (feedback[at]stableset[dot]com)
Hash of master used for report: [6e6c314f1d082dbb98e8ca2fd671dddfd36e37fa](https://github.com/airswap/airswap-protocols/commit/6e6c314f1d082dbb98e8ca2fd671dddfd36e37fa)
Swap [Source Code](https://github.com/airswap/airswap-protocols/tree/master/protocols/swap) and [README](../README.md)

## Introduction

The Swap Protocol is a peer-to-peer protocol for trading Ethereum tokens that allows two parties to exchange tokens in an atomic transaction. It is a non-custodial exchange settlement contract. The new additions to the contract allow for trading of ERC-721 tokens, delegation for token trades to pre-authorized parties, and optionally distributing affiliate fees in tokens to a party who facilitates peers meeting. In addition, previous behavior of the AirSwap protocol is maintained in terms of swapping ERC-20 tokens. One significant change related to security is that the Swap protocol now does not deal with Ether at all.
Structure

A mono-repo structure contains all the airswap-protocols contracts. Lerna is used for the coordination of the mono-repo. Deployment of the Swap.sol and Types.sol was done from the swap sub-modules that pulled in the Types library. The contracts are compiled with v0.5.10.a6ea5b19 (0.5.10 stable release).

## Structure

The Swap contract is comprised a contract, an interface, and a library.

[@airswap/swap/contracts/Swap.sol](../contracts/Swap.sol) @ [6e6c314f1d082dbb98e8ca2fd671dddfd36e37fa](https://github.com/airswap/airswap-protocols/commit/6e6c314f1d082dbb98e8ca2fd671dddfd36e37fa)
[@airswap/swap/interfaces/ISwap.sol](../interfaces/ISwap.sol) @ [6e6c314f1d082dbb98e8ca2fd671dddfd36e37fa](https://github.com/airswap/airswap-protocols/commit/6e6c314f1d082dbb98e8ca2fd671dddfd36e37fa)
[@airswap/types/contracts/Types.sol](../../types/contracts/Types.sol) @ [6e6c314f1d082dbb98e8ca2fd671dddfd36e37fa](https://github.com/airswap/airswap-protocols/commit/6e6c314f1d082dbb98e8ca2fd671dddfd36e37fa)

## Dependencies

[Open Zeppelin v2.0 Security Audit](https://drive.google.com/file/d/1gWUV0qz3n52VEUwoT-VlYmscPxxo9xhc/view)

_Externally Audited Files from the OpenZeppelin library (v2.2)_

```
IERC20.sol
IERC721.sol
```

_Externally Audited files from OpenZeppelin library used solely for tests_

```
ERC20Mintable.sol
ERC721Mintable.sol
```

## Contracts

```
Swap.sol
ISwap.sol
Types.sol
** IERC20.sol
** IERC721.sol
```

_\*\* OpenZeppelin contract_

#### Public and external functions (non-getter functions)

| Function   | Source   | Visibility | Params                                                                                                                                                                                                                  | Payable |
| :--------- | :------- | :--------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------ |
| swapSimple | Swap.sol | external   | `uint256 _nonce`, `uint256 _expiry`, `address _makerWallet`, `uint256 _makerParam`, `address _makerToken`, `address _takerWallet`, `uint256 _takerParam`, `address _takerToken`, `uint8 _v`, `bytes32 _r`, `bytes32 _s` | no      |
| cancel     | Swap.sol | external   | `uint256[] calldata _nonces`                                                                                                                                                                                            | no      |
| invalidate | Swap.sol | external   | `uint256 _minimumNonce`                                                                                                                                                                                                 | no      |
| authorize  | Swap.sol | external   | `address _delegate`, `uint256 _expiry`                                                                                                                                                                                  | no      |
| revoke     | Swap.sol | external   | `address _delegate`                                                                                                                                                                                                     | no      |

Note that state-modifying public entry points are minimized in this contract, reducing
the exploit surface to incorrect arguments to swap, swapSimple, authorize, cancel, invalidate, and revoke.

## Invariants

#### 1. No ether or tokens should be held by the contract address.

- Although `selfdestruct` can forcefully send money to any non-payable contract; this is out of scope of review, and because this.balance is not used in the code, cannot lead to security issues.
  No functions are payable and thus stuck Ether due to improper function calls is not possible.
  By inspection, in all branches of this function, swap, and safeTransferAny/transferAny, either the trade succeeds or an exception is generated by a ‘require’. At no point can these functions return false or fail silently without throwing.
- All transfers in the execution function are between the maker and taker or a maker and affiliate; at no point is a token transfer performed using the Swap contract’s address. Tokens can however be sent to the contract by accident, and will remain stuck as there is no withdrawal mechanism for any of the supported token standards. Per V1 Exchange contract (0x8fd3121013a07c57f0d69646e86e7a4880b467b7), there is 0 Ether and < \$.10 stored. While we recommend considering a withdrawal backdoor, it introduces complexity that may be undesirable from a business perspective.
- **This invariant currently holds as-is.**

#### Affiliate trades supply appropriate fees

- safeTransferFrom is used for ERC-721 and transferFrom is called with affiliate.param as amount, transfer works by manual verification of transfer flow and testing; see also the original Swap audit report. A require is not required for safeTransferFrom as the contract signature guarantees there is no return parameter.
  This invariant currently holds as-is.

- ERC-721 - ERC-20 flow. All flows are identical (no calls to underlying token contract) until the internal transferToken call.

```
    if (_kind == ERC-721_INTERFACE_ID) {
      // Attempt to transfer an ERC-721 token.
      IERC-721(_token).safeTransferFrom(_from, _to, _param);
    } else {
      // Attempt to transfer an ERC-20 token.
      require(IERC-20(_token).transferFrom(_from, _to, _param));
    }
```

- In the ERC-20 case, reverts will occur on the underlying transferFrom implemented methods. Applications using this contract may want to do pre-checks on known tokens to do better user experience.
- **This invariant currently holds as-is.**

#### Signatures cannot be forged or duplicated.

- Both in the simpleSimple and full swap flow, validation is required on all of the order parameters to the swap function. Every item in the order is included in a hash along with an identifier tag (nonce), uniquely identifying each Order object and preventing hash/signature reuse between different items. All items that are hashed are fixed size and stored in memory, making it impossible to exploit padding or offset vulnerabilities.
- In both cases, ecrecover is performed, and checked against the relevant maker (or signer, checked separately for authorization).
- The output of a correct ecrecover cannot be forged without knowledge of the signing private key.
- **This invariant currently holds as-is.**

#### Trades performed cannot exceed authorized timestamp.

- Only two methods can be used to authorize delegated signing in the contract: authorize and revoke. No other methods modify the approval state.
- Both allow setting of an expiry parameter, and the authorization check used in Swap.sol checks that the block timestamp is less than this parameter or throws.
- Revoke deletes the mapping entry, which will default the value to 0 if queried.
- Block timestamp can technically be manipulated by miners, who may attempt to prolong authorizations that are about to expire. The gain, however, seems marginal, and the cost of this attack relative to Swap trading volume make it unlikely to be of concern.
- **This invariant currently holds as-is.**

#### Legacy flow (swapSimple) and previous swap contract flow are identical in behavior related to ERC-20 token transfers

- Legacy flow first checks if maker and taker are the same; otherwise fails. This has been removed from the new Swap contract.
- Both contracts check whether order is taken or cancelled; new one does this first, as order ID is available
- Both contracts check whether order is expired, otherwise fail.
- Eth transactions are disallowed in new legacy flow, with no function being payable.
- One important flow difference occurs in the use of the return-false-then-refund pattern as opposed to the newer require pattern with reason messages; we reason that these are equivalent through the invariants explored in the original Swap audit.
- **This invariant currently holds as-is.**

#### Full flow (swap) and legacy flow (swapSimple) are identical

- Full Flow: Order expiry checked -> order not taken -> order not cancelled -> valid nonce -> order marked taken -> sender is authorized -> signer is authorized -> signature is valid -> transfer to maker -> transfer to taker -> transfer to affiliate -> emit Swap event
- Simple Flow: Order expiry checked -> Order not taken or cancelled -> valid nonce -> order marked taken -> sender is authorized -> signature is valid (sender must be signer) -> transfer to maker -> transfer to taker -> emit Swap event
- They are consistent by inspection save for affiliate fees and slightly different signature. There are differences in order or checks though.
- **This invariant currently holds as-is.**

#### Orders can never move states once they are CANCELED or TAKEN.

- The first function check ensures an order is not already taken or cancelled or reverts, making further successful swaps impossible. Ensuring that an order status cannot move from CANCELED to something else.
- Cancels also can only be performed on OPEN order and checks are done to ensure the order was not TAKEN.
- **This invariant currently holds as-is.**

#### Orders can only be successfully taken once.

- By (8), orders either revert or complete successfully. The TAKEN flag is set before any functions that have side effects or external calls are used, preventing its modification through e.g. re-entrancy, and it is not reset in the function, indicating the TAKEN flag will remain set unless a revert occurs.
- If a revert occurs, the trade is not taken, so this is correct. If no revert occurs, the trade was (and will stay) taken, so this is correct.
- The first function check ensures an order is not already taken or cancelled or reverts, making further successful swaps impossible.
- Orders could potentially be replayed on a different Swap contract, if e.g. old au- throizations exist on another contract. The legacy signature is modified to require an additional "0" byte to prevent such replay attacks; all future Swap contracts should increment this bid to maintain replay protection against old authorizations.
- **This invariant currently holds as-is.**

#### Swap and SwapSimple functions either successfully execute swap or revert

- By manual inspection of all branches of swap, swapSimple and transferFrom, no functions can fail silently without causing a REVERT. In the case no REVERT branch is hit, both sides of the swap must have been successfully executed. Note that require is used in the ERC-20 case to handle tokens where a bad transfer may fail silently without reversions. This is the only external call other than safeTransferFrom, which has no return value and therefore cannot fail silently.
- **This invariant currently holds as-is.**

## Analysis

####Slither (static analyzer)

- No medium or severe issues were found.
- Choosing Solidity compiler 0.5.10 over the recommended 0.5.3 because of issues fixed in ABIEncoderV2.
- Timestamps were used for comparisons though an attack seems unlikely to be of concern.
- Different Solidity versions are used not with AirSwap specific code, only with Migrations (used from Truffle boilerplate) and Open-Zeppelin library.
- Cases of \_name notation versus mixedCase were ignored.

## Testing

#### Unit and Integration Tests

```
protocols/swap/tests/Swap-unit.js
protocols/swap/test/Swap.js
```

#### Test Coverage

100% coverage between unit and integration tests.

| File        | % Stmts | % Branch | % Funcs | % Lines | Uncovered Lines |
| :---------- | :------ | :------- | :------ | :------ | :-------------- |
| contracts/  | 100     | 100      | 100     | 100     |                 |
| Imports.sol | 100     | 100      | 100     | 100     |                 |
| Swap.sol    | 100     | 100      | 100     | 100     |                 |
| All files   | 100     | 100      | 100     | 100     |                 |

#### Regression Tests

End-to-end tests for the ERC-20 flow were performed on Rinkeby prior to deploy on Mainnet to confirm behavior was consistent with prior Swap contract.

## Migrations

Hash of master used for deploy: [6e6c314f1d082dbb98e8ca2fd671dddfd36e37fa](https://github.com/airswap/airswap-protocols/commit/6e6c314f1d082dbb98e8ca2fd671dddfd36e37fa)
Rinkeby Etherscan (Swap): https://rinkeby.etherscan.io/address/0x78db49d0459a67158bdca6e161be3d90342c7247
Rinkeby Etherscan (Types); https://rinkeby.etherscan.io/address/0xaaf6cb19298e7d0abc410eb2a0d5b8fef747573d#code
Mainnet Etherscan (verified Swap): https://etherscan.io/address/0x54d2690e97e477a4b33f40d6e4afdd4832c07c57
Mainnet Etherscan (verified lib Types):
https://etherscan.io/address/0xc65ff60eb8e4038a2415bb569d1fa6dca47d692e

## Notes

- Because of two issues found with ABIEncoderV2, we ensured that the newest version of the Solidity compiler was used where those issues were resolved. More information can be found at the [Ethereum Foundation blog](https://blog.ethereum.org/2019/03/26/solidity-optimizer-and-abiencoderv2-bug/).
- There may be issues where if someone tries to use the cancel function and submit a large array of order nonces, out of gas issues.
- We note a potential loss vector for Swap contract users; the affiliate fee could exceed the token fee. If the user-facing libraries or interfaces are not appropriately checking affiliate fee size, this could lead to makers being tricked into spending all or most of their money as an affiliate fee. We recommend clearly communicating this to users and including a check in any high-level code released for distribution. Another mitigation is to switch to limited, amount-based approvals (as in ERC-20), or to require that the affiliate fee cannot exceed the trade size.
- We assume the ERC-20 super-contract is good; recommend noting its audit trail / history as well as the audit trail / history for the version of Zeppelin being used. Recommend fixing this dependency version formally. This is done, and a version of Zeppelin audited by "Level K" is used; we recommend carefully considering the scope/impact of their audit. (noted above by AirSwap)
- Constants are ABI decoded at deployment time rather than hardcoded; this is fine assuming the ABI encoder works (which is required to decode orders from memory regardless).
- Smart contracts are a nascent space, and no perfect security audit procedure has thus far been perfected for their deployment. We welcome any suggestions or comments on this report, its contents, our methodology, or potential gaps in coverage.