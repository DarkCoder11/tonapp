import { Telegraf, Context } from 'telegraf'

import { TonService } from '../ton/ton.service'
import { UserModel } from '../models/user.model'

const tonService = new TonService()
const bot = new Telegraf('6900920159:AAGCpyVjHXghzgn8HAGVwaai_7UZV15H1lY')

export class TelegramBot {
  constructor() {
    this.setupCommands()
  }

  public setupCommands() {
    bot.command('start', (ctx) => {
      ctx.reply(
        'Welcom to bot.Here are the available commands:\n/createWallet - Create a new wallet\n/wallet - Get wallet adress\n/getBalance - Get your wallet balance\n/getLastAddress - get your last transaction adress\n/word - get 24 wallet words',
      )
    })

    bot.command('help', (ctx) => {
      ctx.reply(
        'Here are the available commands:\n/createWallet - Create a new wallet\n/wallet - Get wallet adress\n/getBalance - Get your wallet balance\n/getLastAddress - get your last transaction adress\n/word - get 24 wallet words',
      )
    })

    bot.command('createWallet', async (ctx: Context) => {
      try {
        const userTelegramId = String(ctx?.message?.from.id)
        const user = await UserModel.findOne({ userTelegramId })
        if (userTelegramId && !user) {
          const { address, mnemonic, publicKey } = await tonService.createWallet()
          const user = await new UserModel({
            userTelegramId,
            walletAddress: address,
            mnemonic,
            publicKey,
          }).save()
          ctx.reply(`Your wallet address: ${address} and userinfo: ${user}`)
        } else if (user) {
          ctx.reply('you already have wallet')
        }
      } catch (error: any) {
        ctx.reply(`Error: ${error.message}`)
      }
    })

    bot.command('wallet', async (ctx: Context) => {
      try {
        const userTelegramId = String(ctx?.message?.from.id)
        if (userTelegramId) {
          const user = await UserModel.findOne({ userTelegramId })
          ctx.reply(`Your wallet address: ${user?.walletAddress}`)
        }
      } catch (error: any) {
        ctx.reply(`Error: ${error.message}`)
      }
    })

    bot.command('word', async (ctx: Context) => {
      try {
        const userTelegramId = String(ctx?.message?.from.id)
        if (userTelegramId) {
          const user = await UserModel.findOne({ userTelegramId })
          const formattedWords = user?.mnemonic.map((word: any) => `*${word}*`).join(' ')

          ctx.reply(`Your wallet 24 words:\n${formattedWords}`)
        }
      } catch (error: any) {
        ctx.reply(`Error: ${error.message}`)
      }
    })

    bot.command('createTransaction', async (ctx: Context) => {
      try {
        const transaction = await tonService.createTransfer()
        ctx.reply(`${transaction}`)
      } catch (error: any) {
        ctx.reply(`Error: ${error.message}`)
      }
    })

    bot.command('getBalance', async (ctx: Context) => {
      try {
        const userTelegramId = String(ctx?.message?.from.id)
        const user = await UserModel.findOne({ userTelegramId })

        if (user) {
          const balance = await tonService.getBalance(user.publicKey)
          ctx.reply(`Your balance: ${balance}`)
        }
      } catch (error: any) {
        ctx.reply(`Error: ${error.message}`)
      }
    })

    bot.command('getLastAddress', async (ctx: Context) => {
      try {
        const userTelegramId = String(ctx?.message?.from.id)
        const user = await UserModel.findOne({ userTelegramId })

        if (user) {
          const lastAddress = await tonService.getLastTransactionAddress(user.walletAddress)
          ctx.reply(`Last transaction address: ${lastAddress}`)
        }
      } catch (error: any) {
        ctx.reply(`Error: ${error.message}`)
      }
    })
  }

  startBot() {
    bot.launch()
  }
}
