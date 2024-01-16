import { Schema, model } from 'mongoose'

const schema = new Schema({
  userTelegramId: { type: String, required: true, unique: true },
  walletAddress: { type: String, required: true },
  mnemonic: { type: Object, required: true },
  publicKey: { type: Buffer, required: true },
})

export const UserModel = model('User', schema)
