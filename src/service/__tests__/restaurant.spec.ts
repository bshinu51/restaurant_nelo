import { createReservation } from '../restaurant'
import { PrismaClient } from '@prisma/client'

jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    table: {
      findFirst: jest.fn(),
    },
    reservation: {
      create: jest.fn(),
    },
    reservation_diner: {
      createMany: jest.fn(),
    },
  }
  return { PrismaClient: jest.fn(() => mPrismaClient) }
})

const prisma = new PrismaClient()

describe('createReservation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create a reservation and associated diners', async () => {
    const tableId = 1

    const dinerJohn = { name: 'John', email: 'john@gmail.com' }
    const dinerJane = { name: 'Jane', email: 'jane@gmail.com' }
    const mockDinersEmails = [dinerJohn.email, dinerJane.email]

    ;(prisma.table.findFirst as jest.Mock).mockResolvedValueOnce({
      id: tableId,
    })

    const newReservationTime = new Date()
    const newEndTime = new Date()
    newEndTime.setHours(newEndTime.getHours() + 2)

    const mockNewReservation = {
      id: 1,
      tableId: tableId,
      reservationTime: newReservationTime,
      endTime: newEndTime,
    }

    ;(prisma.reservation.create as jest.Mock).mockResolvedValue(
      mockNewReservation
    )
    ;(prisma.reservation_diner.createMany as jest.Mock).mockResolvedValue({
      count: 2,
    })

    const result = await createReservation(
      tableId,
      mockDinersEmails,
      newReservationTime
    )

    expect(prisma.table.findFirst).toHaveBeenCalledWith({
      where: {
        id: tableId,
        reservations: {
          none: {
            reservationTime: { lte: newReservationTime },
            endTime: { gte: newReservationTime },
          },
        },
      },
    })

    expect(prisma.reservation.create).toHaveBeenCalledWith({
      data: {
        tableId: tableId,
        reservationTime: expect.any(Date),
        endTime: expect.any(Date),
      },
    })

    expect(prisma.reservation_diner.createMany).toHaveBeenCalledWith({
      data: [
        { reservationId: mockNewReservation.id, dinerId: dinerJohn.email },
        { reservationId: mockNewReservation.id, dinerId: dinerJane.email },
      ],
    })

    expect(result).toEqual(mockNewReservation)
  })

  it('should throw an error if no diners are provided', async () => {
    await expect(createReservation(1, [], new Date())).rejects.toThrow(
      'Table is already reserved at that time.'
    )
  })
})
