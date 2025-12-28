// Golf data models and storage
// In production, replace with proper database

export interface Course {
  id: string
  name: string
  holes: Hole[]
  createdAt: string
}

export interface Hole {
  number: number
  par: number
  yardage?: number
}

export interface Player {
  id: string
  name: string
}

export interface Round {
  id: string
  courseId: string
  courseName: string
  players: Player[]
  scores: { [playerId: string]: { [holeNumber: number]: number } }
  createdAt: string
  status: 'active' | 'completed'
}

// In-memory storage (replace with database in production)
const courses: Course[] = []
const rounds: Round[] = []

export function getCourses(): Course[] {
  return [...courses]
}

export function getCourse(id: string): Course | undefined {
  return courses.find(c => c.id === id)
}

export function createCourse(name: string, holes: Hole[]): Course {
  const course: Course = {
    id: `course_${Date.now()}_${Math.random()}`,
    name,
    holes,
    createdAt: new Date().toISOString(),
  }
  courses.push(course)
  return course
}

export function getRounds(): Round[] {
  return [...rounds]
}

export function getRound(id: string): Round | undefined {
  return rounds.find(r => r.id === id)
}

export function getActiveRounds(): Round[] {
  return rounds.filter(r => r.status === 'active')
}

export function createRound(courseId: string, courseName: string, players: Player[]): Round {
  const round: Round = {
    id: `round_${Date.now()}_${Math.random()}`,
    courseId,
    courseName,
    players,
    scores: {},
    createdAt: new Date().toISOString(),
    status: 'active',
  }
  rounds.push(round)
  return round
}

export function updateScore(roundId: string, playerId: string, holeNumber: number, score: number): boolean {
  const round = rounds.find(r => r.id === roundId)
  if (!round) return false
  
  if (!round.scores[playerId]) {
    round.scores[playerId] = {}
  }
  round.scores[playerId][holeNumber] = score
  return true
}

export function completeRound(roundId: string): boolean {
  const round = rounds.find(r => r.id === roundId)
  if (!round) return false
  round.status = 'completed'
  return true
}

