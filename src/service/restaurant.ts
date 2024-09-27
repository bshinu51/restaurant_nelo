import { PrismaClient } from '@prisma/client'
import { logger } from '../util/logger'
import { debug } from 'console'
import { ReservationError } from '../errors/ReservationError'

const prisma = new PrismaClient()

// Find restaurants with available tables for a group of diners
export async function findAvailableRestaurants(
  diners: string[],
  reservationTime: Date
) {
  // Get the dietary restrictions of the diners
  const dinerDietaryRestrictions =
    await prisma.diner_dietary_restriction.findMany({
      where: {
        dinerId: {
          in: diners,
        },
      },
      include: {
        dietaryRestriction: true,
      },
    })

  const restrictionsIds = Array.from(
    new Set(
      dinerDietaryRestrictions.map(
        (ddr: { dietaryRestriction: { name: string; id: number } }) =>
          ddr.dietaryRestriction.id
      )
    )
  )
  logger.debug(`restrictions: ${restrictionsIds} for diners:${diners}`)

  // Find restaurants that meet all the group's dietary restrictions
  const restaurants = await prisma.restaurant.findMany({
    where: {
      endorsements: {
        some: {
          dietaryRestriction: {
            id: {
              in: restrictionsIds, // Match any of the restrictions
            },
          },
        },
      },
    },
    include: {
      tables: {
        where: {
          capacity: {
            gte: diners.length,
          },
          reservations: {
            none: {
              reservationTime: {
                lte: reservationTime,
              },
              endTime: {
                gte: reservationTime,
              },
            },
          },
        },
      },
      endorsements: true,
    },
  })

  // Filter restaurants to include only those with all the required dietary restrictions
  const matchingRestaurants = restaurants.filter(
    (restaurant: { endorsements: any[] }) => {
      if (!restaurant.endorsements || restaurant.endorsements.length === 0) {
        return false
      }

      const restaurantRestrictionsIds = restaurant.endorsements.map(
        (endorsement) => endorsement.restrictionId
      )
      // Check if the restaurant has all the restrictions in the list
      return restrictionsIds.every((restriction) =>
        restaurantRestrictionsIds.includes(restriction)
      )
    }
  )

  return matchingRestaurants.filter(
    (restaurant: { tables: string | any[] }) => restaurant.tables.length > 0
  )
}

// Create a reservation for a group of diners
export async function createReservation(
  tableId: number,
  dinerEmails: string[],
  reservationTime: Date
) {
  // Check if the table is available
  try {
    const tableAvailable = await prisma.table.findFirst({
      where: {
        id: tableId,
        reservations: {
          none: {
            reservationTime: {
              lte: reservationTime,
            },
            endTime: {
              gte: reservationTime,
            },
          },
        },
      },
    })

    if (!tableAvailable) {
      console.log(`tableAvailable:${tableAvailable}`)
      throw new ReservationError('Table is already reserved at that time.')
    }
    const endTime = new Date(reservationTime)
    endTime.setHours(endTime.getHours() + 2)
    // Create the reservation
    const reservation = await prisma.reservation.create({
      data: {
        tableId: tableId,
        reservationTime: reservationTime,
        endTime: endTime,
      },
    })

    // For each diner, create a reservation_diner entry
    await prisma.reservation_diner.createMany({
      data: dinerEmails.map((dinerEmail) => ({
        reservationId: reservation.id,
        dinerId: dinerEmail,
      })),
    })

    return reservation
  } catch (error) {
    logger.error(`Error while reserving the table for ${tableId}:`, error)
    throw error
  }
}
