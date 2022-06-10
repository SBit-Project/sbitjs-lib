module.exports = {
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
