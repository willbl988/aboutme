import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

/**
 * Temporary migration endpoint
 * DELETE THIS FILE AFTER MIGRATION IS COMPLETE
 * 
 * Usage:
 * POST /api/admin/migrate
 * Headers: Authorization: Bearer <MIGRATION_SECRET>
 * 
 * Set MIGRATION_SECRET in Vercel environment variables
 */
export async function POST(request: NextRequest) {
  try {
    // Check authorization
    const authHeader = request.headers.get('authorization')
    const expectedSecret = process.env.MIGRATION_SECRET || 'temporary-migration-secret-change-me'
    
    if (!authHeader || authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized. Provide Authorization: Bearer <MIGRATION_SECRET>' },
        { status: 401 }
      )
    }

    console.log('[Migration] Starting database migration...')

    // Note: Prisma Client is already generated during build, so we skip that step
    // Run migrations with timeout
    console.log('[Migration] Deploying migrations...')
    
    // Try multiple ways to run prisma migrate deploy
    // In Vercel, we need to use the node_modules/.bin path or direct prisma command
    const prismaCommands = [
      './node_modules/.bin/prisma migrate deploy',
      'node_modules/.bin/prisma migrate deploy',
      'prisma migrate deploy',
      'npx --yes prisma migrate deploy'
    ]
    
    let output = ''
    let lastError: any = null
    
    for (const cmd of prismaCommands) {
      try {
        console.log(`[Migration] Trying: ${cmd}`)
        const migratePromise = execAsync(cmd, {
          encoding: 'utf-8',
          maxBuffer: 10 * 1024 * 1024, // 10MB buffer
          env: { ...process.env },
          cwd: process.cwd()
        })
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Migration timed out after 120 seconds')), 120000)
        )
        
        const result = await Promise.race([migratePromise, timeoutPromise]) as any
        output = result.stdout || result.stderr || ''
        console.log(`[Migration] Success with: ${cmd}`)
        break
      } catch (error: any) {
        lastError = error
        console.log(`[Migration] Failed with ${cmd}:`, error.message)
        continue
      }
    }
    
    if (!output && lastError) {
      throw lastError
    }
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Migration timed out after 120 seconds')), 120000)
    )
    
    const { stdout, stderr } = await Promise.race([migratePromise, timeoutPromise]) as any
    const output = stdout || stderr || ''

    console.log('[Migration] Migration output:', output)

    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully',
      output: output.split('\n').slice(-10).join('\n') // Last 10 lines
    })
  } catch (error: any) {
    console.error('[Migration] Error:', error)
    
    const errorOutput = error.stdout || error.stderr || error.message || 'Unknown error'
    
    return NextResponse.json(
      {
        success: false,
        error: 'Migration failed',
        details: errorOutput.toString().split('\n').slice(-20).join('\n'), // Last 20 lines
        fullError: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

// Also allow GET for easy testing
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Migration endpoint. Use POST with Authorization header.',
    usage: 'POST /api/admin/migrate\nHeaders: Authorization: Bearer <MIGRATION_SECRET>',
    note: 'Set MIGRATION_SECRET in Vercel environment variables'
  })
}

