import { NextRequest, NextResponse } from 'next/server'
import { execSync } from 'child_process'

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

    // Generate Prisma Client
    console.log('[Migration] Generating Prisma Client...')
    execSync('npx prisma generate', { 
      stdio: 'inherit',
      env: { ...process.env }
    })

    // Run migrations with timeout
    console.log('[Migration] Deploying migrations...')
    const output = execSync('timeout 120 npx prisma migrate deploy || npx prisma migrate deploy', {
      encoding: 'utf-8',
      stdio: 'pipe',
      env: { ...process.env },
      maxBuffer: 10 * 1024 * 1024 // 10MB buffer
    })

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

