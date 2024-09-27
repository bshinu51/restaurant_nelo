import fs from 'fs'
import csv from 'csv-parser'
import { PrismaClient } from '@prisma/client'
import { logger } from './src/util/logger'

const prisma = new PrismaClient()

const parseCSV = (filePath: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const results: any[] = []
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data: any) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject)
  })
}

const createTables = (twoTop: number, fourTop: number, sixTop: number) => {
  const tables = []
  for (let i = 0; i < twoTop; i++) {
    tables.push({ capacity: 2 })
  }
  for (let i = 0; i < fourTop; i++) {
    tables.push({ capacity: 4 })
  }
  for (let i = 0; i < sixTop; i++) {
    tables.push({ capacity: 6 })
  }
  return tables
}

const processDietaryRestrictions = (dietaryRestrictions: string): string[] => {
  if (!dietaryRestrictions) return []
  // Remove leading/trailing quotes and spaces, then split by commas
  return dietaryRestrictions
    .trim()
    .replace(/^"|"$/g, '')
    .split(',')
    .map((restriction) => restriction.trim().toLowerCase())
}

const loadDiners = async (dinersData: any[]) => {
  for (const diner of dinersData) {
    const { name, email, dietaryRestrictions } = diner
    logger.info(`Loaded CSV file: ${JSON.stringify(diner)}`)

    // Process dietary restrictions to convert them into an array
    const restrictionsArray = processDietaryRestrictions(dietaryRestrictions)

    // Create diner and associate dietary restrictions
    const createdDiner = await prisma.diner.create({
      data: {
        name: (name as string).toLowerCase(),
        email: email.toLowerCase(),
        dietaryRestrictions: {
          create: restrictionsArray.map((restriction) => ({
            dietaryRestriction: {
              connectOrCreate: {
                where: { name: restriction },
                create: { name: restriction },
              },
            },
          })),
        },
      },
    })

    console.log(`Diner created: ${createdDiner.name}`)
  }
}

const loadRestaurants = async (restaurantData: any[]) => {
  for (const restaurant of restaurantData) {
    const {
      Name,
      TwoTopTable: twoTop,
      FourTopTables: fourTop,
      SixTopables: sixTop,
      Endorsement: dietaryRestrictions,
    } = restaurant

    const restrictions = processDietaryRestrictions(dietaryRestrictions)

    const createdRestaurant = await prisma.restaurant.create({
      data: {
        name: Name,
        tables: {
          create: createTables(
            parseInt(twoTop),
            parseInt(fourTop),
            parseInt(sixTop)
          ),
        },
        endorsements: {
          create: restrictions.map((restriction: string) => ({
            dietaryRestriction: {
              connectOrCreate: {
                where: { name: restriction.toLowerCase() },
                create: { name: restriction.toLowerCase() },
              },
            },
          })),
        },
      },
    })

    console.log(
      `Restaurant created: ${createdRestaurant.name} with tables: 2-tops: ${twoTop}, 4-tops: ${fourTop}, 6-tops: ${sixTop}`
    )
  }
}

const main = async () => {
  try {
    // Load diners from diners.csv
    const diners = await parseCSV('./data/diners.csv')
    await loadDiners(diners)

    // Load diners from restaurant.csv
    const restaurants = await parseCSV('./data/restaurant.csv')
    await loadRestaurants(restaurants)

    console.log('Data loading complete.')
  } catch (error) {
    console.error('Error loading data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
