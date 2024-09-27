import express, { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import {
  createReservation,
  findAvailableRestaurants,
} from './service/restaurant'
import {
  isValidAvailableRestaurant,
  hasValidTable,
} from './util/validateReuqest'
import { logger } from './util/logger'
import { ReservationError } from './errors/ReservationError'

const app = express()
const prisma = new PrismaClient()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req: Request, res: Response) => {
  res.send('API Service is running!')
})

app.get('/restaurant/available', async (req: Request, res: Response) => {
  try {
    const { diners, reservationTime } = req.body
    const { isValid, message } = await isValidAvailableRestaurant(
      diners,
      reservationTime
    )
    if (!isValid) {
      return res.status(422).json({ message })
    }
    const dinerList = diners
      .split(',')
      .map((diner: string) => diner.toLowerCase())
    const listOfAvailableRestaurant = await findAvailableRestaurants(
      dinerList,
      reservationTime
    )
    return res.status(200).json({ restaurant: listOfAvailableRestaurant })
  } catch (error) {
    logger.error({ error })
    res
      .status(500)
      .json({ error: 'An error occurred while fetching restaurant' })
  }
})

app.post('/reservations', async (req: Request, res: Response) => {
  try {
    const { tableId, diners, reservationTime } = req.body
    let { isValid, message } = await isValidAvailableRestaurant(
      diners,
      reservationTime
    )
    if (!isValid) {
      return res.status(422).json({ message })
    }
    let { isValidTable, tableMessage } = await hasValidTable(tableId)
    if (!isValidTable) {
      return res.status(422).json({ tableMessage })
    }
    logger.debug(`request is valid now booking reservation`)
    const parsedTableId = parseInt(tableId)
    const listOfDinersEmail = diners
      .split(',')
      .map((diner: string) => diner.toLowerCase())
    await createReservation(parsedTableId, listOfDinersEmail, reservationTime)
    return res.status(200).json({ diners: ['Success'] })
  } catch (error) {
    if (error instanceof ReservationError) {
      res.status(409).json({ error: `${error.message}` })
    } else {
      res
        .status(500)
        .json({ error: 'An error occurred while reserving the table' })
    }
  }
})

app.get('/diners', async (req: Request, res: Response) => {
  try {
    // logic to reserve restaurant
    return res.status(200).json({ diners: ['Hello'] })
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching users' })
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`API Service listening on port ${PORT}`)
})
