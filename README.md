# sbitjs-lib
This is an extend library called sbitjs-lib, it supports two networks; sbit-mainnet and sbit-testnet. It can generate contracts and creating and send transactions

## Installation
``` bash
npm install sbitjs-lib
```

## Setup
### Node.js
``` javascript
var sbitjs = require('sbitjs-lib')
```

## New features
### Network
[List of address prefixes](https://en.bitcoin.it/wiki/List_of_address_prefixes)

```js
{
    sbit: {
        messagePrefix: '\x15Sbit Signed Message:\n',
        bech32: 'sc',
        bip32: {
            public: 0x0488B21E,
            private: 0x0488ADE4
        },
        pubKeyHash: 0x3f,
        scriptHash: 0x32,
        wif: 0x80
    },
    sbit_testnet: {
        messagePrefix: '\x15Sbit Signed Message:\n',
        bech32: 'ts',
        bip32: {
            public: 0x043587CF,
            private: 0x04358394
        },
        pubKeyHash: 0x7d,
        scriptHash: 0x6e,
        wif: 0xef
    }
}

```

### Utils
#### Utils.selectTxs
```javascript
/**
 * This is a function for selecting SBIT utxos to build transactions
 * the transaction object takes at least 3 fields, value(unit is 1e-8 SBIT) , confirmations and isStake
 *
 * @param [transaction] unspentTransactions
 * @param Number amount(unit: SBIT)
 * @param Number fee(unit: SBIT)
 * @returns [transaction]
 */
function selectTxs(unspentTransactions, amount, fee)
```
#### Utils.buildPubKeyHashTransaction
```javascript
/**
 * This is a helper function to build a pubkeyhash transaction
 * the transaction object takes at least 5 fields, value(unit is 1e-8 SBIT), confirmations, isStake, hash and pos
 *
 * @param bitcoinjs-lib.KeyPair keyPair
 * @param String to
 * @param Number amount(unit: SBIT)
 * @param Number fee(unit: SBIT)
 * @param [transaction] utxoList
 * @returns String the built tx
 */
function buildPubKeyHashTransaction(keyPair, to, amount, fee, utxoList)
```
#### Utils.buildCreateContractTransaction
```javascript
/**
 * This is a helper function to build a create-contract transaction
 * the transaction object takes at least 5 fields, value(unit is 1e-8 SBIT), confirmations, isStake, hash and pos
 *
 * @param bitcoinjs-lib.KeyPair keyPair
 * @param String code The contract byte code
 * @param Number gasLimit
 * @param Number gasPrice(unit: 1e-8 SBIT/gas)
 * @param Number fee(unit: SBIT)
 * @param [transaction] utxoList
 * @returns String the built tx
 */
function buildCreateContractTransaction(keyPair, code, gasLimit, gasPrice, fee, utxoList)
```
#### Utils.buildSendToContractTransaction
```javascript
/**
 * This is a helper function to build a send-to-contract transaction
 * the transaction object takes at least 5 fields, value(unit is 1e-8 SBIT), confirmations, isStake, hash and pos
 *
 * @param bitcoinjs-lib.KeyPair keyPair
 * @param String contractAddress The contract address
 * @param String encodedData The encoded abi data
 * @param Number gasLimit
 * @param Number gasPrice(unit: 1e-8 SBIT/gas)
 * @param Number fee(unit: SBIT)
 * @param [transaction] utxoList
 * @returns String the built tx
 */
function buildSendToContractTransaction(keyPair, contractAddress, encodedData, gasLimit, gasPrice, fee, utxoList)
```
