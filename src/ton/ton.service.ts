import axios from 'axios'
import { TonClient, WalletContractV4, internal } from '@ton/ton'
import { mnemonicNew, mnemonicToPrivateKey } from '@ton/crypto'

import { UserModel } from '../models/user.model'

const tonClient = new TonClient({
  endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
})

export class TonService {
  async generatePrivateKey() {
    const mnemonic = await mnemonicNew(24)
    const key = await mnemonicToPrivateKey(mnemonic)
    return { key, mnemonic }
  }

  async getBalance(
    walletAddress: string | Buffer,
    walletAddressFromQuery?: boolean,
  ): Promise<number | null> {
    let publicKey = walletAddress as Buffer

    if (walletAddressFromQuery) {
      const user = await UserModel.findOne({ walletAddress })

      if (user) {
        publicKey = user.publicKey
      }
    }

    const wallet = WalletContractV4.create({ workchain: 0, publicKey })
    const contract = tonClient.open(wallet)

    const balance: bigint = await contract.getBalance()

    return Number(balance)
  }

  async createWallet() {
    const { key, mnemonic } = await this.generatePrivateKey()
    const { publicKey } = key
    const wallet = WalletContractV4.create({ workchain: 0, publicKey })
    const contract = tonClient.open(wallet)
    const address = contract.address.toString()

    return { address, mnemonic, publicKey }
  }

  async getLastTransactionAddress(walletAddress: string, walletAddressFromQuery?: boolean) {
    try {
      let initialWalletAddress = walletAddress
      if (walletAddressFromQuery) {
        const user = await UserModel.findOne({ walletAddress })

        if (user) {
          initialWalletAddress = user.walletAddress
        }
      }

      const response = await axios.get(
        `https://tonapi.io/v2/blockchain/transactions/${initialWalletAddress}`,
      )

      const transactions = response.data.transactions
      if (transactions.length === 0) {
        throw new Error('No transactions found for this wallet.')
      }

      const lastTransaction = transactions[transactions.length - 1]
      const lastTransactionAddress = lastTransaction.toAddress

      return lastTransactionAddress
    } catch (error) {
      console.error('Error fetching last transaction address:', error)
      throw error
    }
  }

  async createTransfer(): Promise<void> {
    const { key } = await this.generatePrivateKey()
    const { publicKey, secretKey } = key
    const wallet = WalletContractV4.create({ workchain: 0, publicKey })
    const walletContract = tonClient.open(wallet)
    const seqno = await walletContract.getSeqno()
    await walletContract.sendTransfer({
      secretKey,
      seqno,
      messages: [
        internal({
          to: 'EQA4V9tF4lY2S_J-sEQR7aUj9IwW-Ou2vJQlCn--2DLOLR5e',
          value: '0.05',
          body: 'Hello',
          bounce: false,
        }),
      ],
    })

    let currentSeqno = seqno
    while (currentSeqno == seqno) {
      await this.sleep(1500)
      currentSeqno = await walletContract.getSeqno()
    }
    console.log('transaction confirmed!')
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
