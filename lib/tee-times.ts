import { prisma } from './db'

export interface TeeTimeSearchParams {
  query?: string
  lat?: number
  lon?: number
  radius?: number // in miles
  date?: string // ISO date string
  minDate?: string
  maxDate?: string
  players?: number
}

export interface TeeTimeResult {
  id: string
  courseId: string
  courseName: string
  courseAddress?: string
  courseCity?: string
  courseState?: string
  courseLatitude?: number
  courseLongitude?: number
  date: string
  time: string
  players: number
  availableSpots: number
  price?: number
  distance?: number // in miles
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959 // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Generate mock tee times for a course (for demo purposes)
// In production, this would fetch from a real tee time API
async function generateTeeTimesForCourse(courseId: string, startDate: Date, days: number = 7): Promise<void> {
  const course = await prisma.course.findUnique({ where: { id: courseId } })
  if (!course) return

  const teeTimes: any[] = []
  const startTimes = ['07:00', '07:15', '07:30', '07:45', '08:00', '08:15', '08:30', '08:45', 
                      '09:00', '09:15', '09:30', '09:45', '10:00', '10:15', '10:30', '10:45',
                      '11:00', '11:15', '11:30', '11:45', '12:00', '12:15', '12:30', '12:45',
                      '13:00', '13:15', '13:30', '13:45', '14:00', '14:15', '14:30', '14:45',
                      '15:00', '15:15', '15:30', '15:45', '16:00', '16:15', '16:30', '16:45']

  for (let day = 0; day < days; day++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + day)
    date.setHours(0, 0, 0, 0)

    // Skip past dates
    if (date < new Date(new Date().setHours(0, 0, 0, 0))) continue

    for (const time of startTimes) {
      const [hours, minutes] = time.split(':').map(Number)
      const teeTimeDate = new Date(date)
      teeTimeDate.setHours(hours, minutes, 0, 0)

      // Skip past times today
      if (teeTimeDate < new Date()) continue

      // Randomly make some tee times unavailable (30% chance)
      const isAvailable = Math.random() > 0.3
      if (!isAvailable) continue

      // Random price between $25-$150
      const price = Math.round((Math.random() * 125 + 25) * 100) / 100

      teeTimes.push({
        courseId,
        date: teeTimeDate,
        players: 4,
        price,
        status: 'available',
      })
    }
  }

  // Batch create tee times (check for existing first to avoid duplicates)
  // Use Promise.all for better performance, but limit concurrency
  const batchSize = 10
  for (let i = 0; i < teeTimes.length; i += batchSize) {
    const batch = teeTimes.slice(i, i + batchSize)
    await Promise.all(
      batch.map(async (teeTime) => {
        const existing = await prisma.teeTime.findFirst({
          where: {
            courseId: teeTime.courseId,
            date: teeTime.date,
          },
        })

        if (!existing) {
          await prisma.teeTime.create({
            data: {
              courseId: teeTime.courseId,
              date: teeTime.date,
              players: teeTime.players,
              price: teeTime.price,
              status: teeTime.status,
            },
          }).catch(() => {
            // Ignore errors (might be duplicate)
          })
        }
      })
    )
  }
}

export async function searchTeeTimes(params: TeeTimeSearchParams): Promise<TeeTimeResult[]> {
  try {
    const {
      query,
      lat,
      lon,
      radius = 25, // Default 25 miles
      date,
      minDate,
      maxDate,
      players = 1,
    } = params

    // Build course search conditions
    const courseWhere: any = {}
    
    if (query) {
      courseWhere.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { city: { contains: query, mode: 'insensitive' } },
        { state: { contains: query, mode: 'insensitive' } },
        { address: { contains: query, mode: 'insensitive' } },
      ]
    }

    // Build tee time search conditions
    const teeTimeWhere: any = {
      status: 'available',
    }

    // Date filtering
    if (date) {
      const searchDate = new Date(date)
      searchDate.setHours(0, 0, 0, 0)
      const nextDay = new Date(searchDate)
      nextDay.setDate(nextDay.getDate() + 1)
      teeTimeWhere.date = {
        gte: searchDate,
        lt: nextDay,
      }
    } else {
      const now = new Date()
      if (minDate) {
        teeTimeWhere.date = { gte: new Date(minDate) }
      } else {
        teeTimeWhere.date = { gte: now }
      }
      if (maxDate) {
        teeTimeWhere.date = {
          ...teeTimeWhere.date,
          lte: new Date(maxDate),
        }
      }
    }

    // Get courses
    const courses = await prisma.course.findMany({
      where: courseWhere,
      include: {
        TeeTimes: {
          where: teeTimeWhere,
          orderBy: { date: 'asc' },
        },
      },
    })

  // Generate tee times for courses that don't have any (for demo)
  for (const course of courses) {
    if (course.TeeTimes.length === 0) {
      const startDate = date ? new Date(date) : new Date()
      await generateTeeTimesForCourse(course.id, startDate, 7)
    }
  }

  // Re-fetch courses with generated tee times
  const coursesWithTeeTimes = await prisma.course.findMany({
    where: courseWhere,
    include: {
      TeeTimes: {
        where: teeTimeWhere,
        orderBy: { date: 'asc' },
      },
    },
  })

  // Build results
  const results: TeeTimeResult[] = []

  for (const course of coursesWithTeeTimes) {
    // Filter by distance if lat/lon provided
    if (lat && lon && course.latitude && course.longitude) {
      const distance = calculateDistance(lat, lon, course.latitude, course.longitude)
      if (distance > radius) continue
    }

    for (const teeTime of course.TeeTimes) {
      // Check available spots
      const bookings = await prisma.teeTimeBooking.findMany({
        where: {
          teeTimeId: teeTime.id,
          status: 'confirmed',
        },
      })
      const bookedSpots = bookings.reduce((sum, booking) => sum + booking.players, 0)
      const availableSpots = teeTime.players - bookedSpots

      if (availableSpots < players) continue

      const teeTimeDate = new Date(teeTime.date)
      const distance = lat && lon && course.latitude && course.longitude
        ? calculateDistance(lat, lon, course.latitude, course.longitude)
        : undefined

      results.push({
        id: teeTime.id,
        courseId: course.id,
        courseName: course.name,
        courseAddress: course.address || undefined,
        courseCity: course.city || undefined,
        courseState: course.state || undefined,
        courseLatitude: course.latitude || undefined,
        courseLongitude: course.longitude || undefined,
        date: teeTimeDate.toISOString().split('T')[0],
        time: teeTimeDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        players: teeTime.players,
        availableSpots,
        price: teeTime.price || undefined,
        distance,
      })
    }
  }

  // Sort by distance if provided, otherwise by date/time
  if (lat && lon) {
    results.sort((a, b) => {
      if (a.distance && b.distance) {
        return a.distance - b.distance
      }
      if (a.distance) return -1
      if (b.distance) return 1
      return new Date(`${a.date} ${a.time}`).getTime() - new Date(`${b.date} ${b.time}`).getTime()
    })
  } else {
    results.sort((a, b) => {
      return new Date(`${a.date} ${a.time}`).getTime() - new Date(`${b.date} ${b.time}`).getTime()
    })
  }

  return results
}

export async function bookTeeTime(
  teeTimeId: string,
  userId: string,
  players: number,
  playerNames: string[] = []
): Promise<{ success: boolean; bookingId?: string; error?: string }> {
  try {
    // Check if tee time exists and is available
    const teeTime = await prisma.teeTime.findUnique({
      where: { id: teeTimeId },
      include: {
        Bookings: {
          where: { status: 'confirmed' },
        },
      },
    })

    if (!teeTime) {
      return { success: false, error: 'Tee time not found' }
    }

    if (teeTime.status !== 'available') {
      return { success: false, error: 'Tee time is not available' }
    }

    // Check available spots
    const bookedSpots = teeTime.Bookings.reduce((sum, booking) => sum + booking.players, 0)
    const availableSpots = teeTime.players - bookedSpots

    if (availableSpots < players) {
      return { success: false, error: `Not enough spots available. Only ${availableSpots} spot(s) remaining.` }
    }

    // Create booking
    const booking = await prisma.teeTimeBooking.create({
      data: {
        teeTimeId,
        userId,
        players,
        playerNames: playerNames.length > 0 ? playerNames : [],
      },
    })

    // Update tee time status if fully booked
    if (availableSpots === players) {
      await prisma.teeTime.update({
        where: { id: teeTimeId },
        data: { status: 'booked' },
      })
    }

    return { success: true, bookingId: booking.id }
  } catch (error: any) {
    console.error('Error booking tee time:', error)
    return { success: false, error: error.message || 'Failed to book tee time' }
  }
}

export async function getUserBookings(userId: string): Promise<any[]> {
  const bookings = await prisma.teeTimeBooking.findMany({
    where: {
      userId,
      status: 'confirmed',
    },
    include: {
      TeeTime: {
        include: {
          Course: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return bookings.map(booking => ({
    id: booking.id,
    courseName: booking.TeeTime.Course.name,
    courseAddress: booking.TeeTime.Course.address,
    courseCity: booking.TeeTime.Course.city,
    courseState: booking.TeeTime.Course.state,
    date: booking.TeeTime.date.toISOString().split('T')[0],
    time: booking.TeeTime.date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
    players: booking.players,
    playerNames: booking.playerNames,
    price: booking.TeeTime.price,
    status: booking.status,
    createdAt: booking.createdAt,
  }))
}

