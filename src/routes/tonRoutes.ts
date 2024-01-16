import express from 'express'

import { TonController } from '../ton/ton.controller'

const tonController = new TonController()

const router = express.Router()

router.get('/balance', tonController.getBalance)
router.get('/last-transaction-address', tonController.getLastTransactionAddress)

export default router
