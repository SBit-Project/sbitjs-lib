var bitcoinjs = require('bitcoinjs-lib')
var BigNumber = require('bignumber.js')
var OPS = require('sbit-opcodes')
var Buffer = require('safe-buffer').Buffer

/**
 * This is a function for selecting SBIT utxos to build transactions
 * the transaction object takes at least 3 fields, value(unit is 1e-8 SBIT) , confirmations and isStake
 *
 * @param [transaction] unspentTransactions
 * @param Number amount(unit: SBIT)
 * @param Number fee(unit: SBIT)
 * @returns [transaction]
 */
function selectTxs(unspentTransactions, amount, fee) {
    //sort the utxo
    var matureList = []
    for(var i = 0; i < unspentTransactions.length; i++) {
      if(unspentTransactions[i].isStake === true) {
        if (unspentTransactions[i].confirmations >= 2000) {
          matureList[matureList.length] = unspentTransactions[i]
        }
      } else {
        matureList[matureList.length] = unspentTransactions[i]
      }
    }
    matureList.sort(function(a, b) {return a.value - b.value})

    var value = new BigNumber(amount).plus(fee).times(1e8)
    var find = []
    var findTotal = new BigNumber(0)
    for (var i = 0; i < matureList.length; i++) {
        var tx = matureList[i]
        findTotal = findTotal.plus(tx.value)
        find[find.length] = tx
        if (findTotal.isGreaterThanOrEqualTo(value)) break
    }
    if (value.isGreaterThan(findTotal)) {
        throw new Error('You do not have enough SBIT to send')
    }
    return find
}   

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
function buildPubKeyHashTransaction(keyPair, to, amount, fee, utxoList) {
    var from = keyPair.getAddress()
    var inputs = selectTxs(utxoList, amount, fee)
    var tx = new bitcoinjs.TransactionBuilder(keyPair.network)
    var totalValue = new BigNumber(0)
    var value = new BigNumber(amount).times(1e8)
    var sendFee = new BigNumber(fee).times(1e8)
    for (var i = 0; i < inputs.length; i++) {
        tx.addInput(inputs[i].hash, inputs[i].pos)
        totalValue = totalValue.plus(inputs[i].value)
    }
    tx.addOutput(to, new BigNumber(value).toNumber())
    if (totalValue.minus(value).minus(sendFee).toNumber() > 0) {
        tx.addOutput(from, totalValue.minus(value).minus(sendFee).toNumber())
    }
    for (var i = 0; i < inputs.length; i++) {
        tx.sign(i, keyPair)
    }
    return tx.build().toHex()
}

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
function buildCreateContractTransaction(keyPair, code, gasLimit, gasPrice, fee, utxoList) {
    var from = keyPair.getAddress()
    var amount = 0
    fee = new BigNumber(gasLimit).times(gasPrice).div(1e8).plus(fee).toNumber()
    var inputs = selectTxs(utxoList, amount, fee)
    var tx = new bitcoinjs.TransactionBuilder(keyPair.network)
    var totalValue = new BigNumber(0)
    var sendFee = new BigNumber(fee).times(1e8)
    for (var i = 0; i < inputs.length; i++) {
        tx.addInput(inputs[i].hash, inputs[i].pos)
        totalValue = totalValue.plus(inputs[i].value)
    }
    var contract =  bitcoinjs.script.compile([
        OPS.OP_4,
        number2Buffer(gasLimit),
        number2Buffer(gasPrice),
        hex2Buffer(code),
        OPS.OP_CREATE
    ])
    tx.addOutput(contract, 0)
    if (totalValue.minus(sendFee).toNumber() > 0) {
        tx.addOutput(from, totalValue.minus(sendFee).toNumber())
    }
    for (var i = 0; i < inputs.length; i++) {
        tx.sign(i, keyPair)
    }
    return tx.build().toHex()
}

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
 * @param Number amount
 * @returns String the built tx
 */
function buildSendToContractTransaction(keyPair, contractAddress, encodedData, gasLimit, gasPrice, fee, utxoList, amount=0) {
    var from = keyPair.getAddress()
    fee = new BigNumber(gasLimit).times(gasPrice).div(1e8).plus(fee).toNumber()
    var inputs = selectTxs(utxoList, amount, fee)
    var tx = new bitcoinjs.TransactionBuilder(keyPair.network)
    var totalValue = new BigNumber(0)
    var sendFee = new BigNumber(fee).times(1e8)
    for (var i = 0; i < inputs.length; i++) {
        tx.addInput(inputs[i].hash, inputs[i].pos)
        totalValue = totalValue.plus(inputs[i].value)
    }
    var contract =  bitcoinjs.script.compile([
        OPS.OP_4,
        number2Buffer(gasLimit),
        number2Buffer(gasPrice),
        hex2Buffer(encodedData),
        hex2Buffer(contractAddress),
        OPS.OP_CALL
    ])
    var sendAmount = new BigNumber(amount).times(1e8).toNumber()
    tx.addOutput(contract, sendAmount)
    if (totalValue.minus(sendFee).minus(sendAmount).toNumber() > 0.00072799) {
        tx.addOutput(from, totalValue.minus(sendFee).minus(sendAmount).toNumber())
    }
    for (var i = 0; i < inputs.length; i++) {
        tx.sign(i, keyPair)
    }
    return tx.build().toHex()
}

function number2Buffer(num) {
    var buffer = []
    var neg = (num < 0)
    num = Math.abs(num)
    while(num) {
        buffer[buffer.length] = num & 0xff
        num = num >> 8
    }

    var top = buffer[buffer.length - 1]
    if (top & 0x80) {
        buffer[buffer.length] = neg ? 0x80 : 0x00
    }
    else if (neg) {
        buffer[buffer.length - 1] = top | 0x80;
    }
    return Buffer.from(buffer)
}

function hex2Buffer(hexString) {
    var buffer = []
    for (var i = 0; i < hexString.length; i += 2) {
        buffer[buffer.length] = (parseInt(hexString[i], 16) << 4) | parseInt(hexString[i+1], 16)
    }
    return Buffer.from(buffer)
}

module.exports = {
    selectTxs: selectTxs,
    buildPubKeyHashTransaction: buildPubKeyHashTransaction,
    buildCreateContractTransaction: buildCreateContractTransaction,
    buildSendToContractTransaction: buildSendToContractTransaction,
}
