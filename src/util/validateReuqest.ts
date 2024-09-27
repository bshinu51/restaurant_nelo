import { PrismaClient } from '@prisma/client'
import { logger } from './logger'

const prisma = new PrismaClient()

export async function isValidAvailableRestaurant(
  diners: any,
  reservationTime: string
) {
  if (typeof diners !== 'string') {
    return { isValid: false, message: `Diners ${diners} are not valid strings` }
  }
  const dinerEmails = diners
    .split(',')
    .map((diner: string) => diner.toLowerCase())
  logger.debug(
    `dinerEmails: ${dinerEmails}, reservationTime: ${reservationTime}`
  )
  function isValidTime(time: string): boolean {
    const reservationDate = new Date(time)
    const currentTime = new Date()

    // Reservation time must be a valid date in the future
    return !isNaN(reservationDate.getTime()) && reservationDate > currentTime
  }

  // if reservationTime is valid
  if (!isValidTime(reservationTime)) {
    return { isValid: false, message: "Time provided isn't valid" }
  }

  // check if the diners exists
  const dinersInDb = await prisma.diner.findMany({
    where: {
      email: {
        in: dinerEmails,
      },
    },
    select: { email: true },
  })

  logger.debug(
    `dinersInDb: ${JSON.stringify(dinersInDb)}, for dinersArray: ${dinerEmails}`
  )
  const validDiners = dinersInDb.map((diner: { email: any }) => diner.email)
  const nonRegisteredDiners = dinerEmails.filter(
    (email) => !validDiners.includes(email)
  )

  // if there are any non-registered diners
  if (nonRegisteredDiners.length > 0) {
    const registerUrl = 'https://localhost:3000/diners/register'

    return {
      isValid: false,
      message: `Register the new users {${nonRegisteredDiners.join(
        ', '
      )}} here: ${registerUrl}`,
    }
  }

  return { isValid: true, message: '' }
}

export async function hasValidTable(tableId: string) {
  // Check if tableId is undefined or null
  if (!tableId) {
    return {
      isValidTable: false,
      tableMessage: 'Table ID is undefined or invalid.',
    }
  }

  // Check if the table exists in the database
  try {
    const table = await prisma.table.findUnique({
      where: {
        id: parseInt(tableId),
      },
    })

    if (table) {
      return {
        isValidTable: true,
        tableMessage: 'Table is valid and exists.',
      }
    } else {
      return {
        isValidTable: false,
        tableMessage: 'Table ID does not exist in the database.',
      }
    }
  } catch (error) {
    logger.error('Error checking table ID:', error)
    return {
      isValidTable: false,
      tableMessage: `An error occurred while checking the table ID. ${tableId}`,
    }
  }
}
