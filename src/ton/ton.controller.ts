import { Response, Request } from 'express'
import { TonService } from './ton.service'

type TTonRequest = Request<
  {},
  {},
  {},
  {
    walletAddress: string
  }
>

const tonService = new TonService()

export class TonController {
  async getBalance(req: TTonRequest, res: Response) {
    try {
      const balance = await tonService.getBalance(req.query.walletAddress, true)
      res.json({ balance })
    } catch (error) {
      console.error('Error getting balance:', error)
      throw new Error('Internal Server Error')
    }
  }

  async getLastTransactionAddress(req: TTonRequest, res: Response) {
    try {
      const lastTransactionAddress = await tonService.getLastTransactionAddress(
        req.query.walletAddress,
        true,
      )
      res.json({ lastTransactionAddress })
    } catch (error) {
      console.error('Error getting last transaction address:', error)
      throw new Error('Internal Server Error')
    }
  }
}
