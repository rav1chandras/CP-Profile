import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'DATABASE_URL not configured' },
        { status: 500 }
      );
    }

    const sql = neon(process.env.DATABASE_URL);
    
    const result = await sql`
      SELECT * FROM user_profiles 
      ORDER BY updated_at DESC 
      LIMIT 1
    `;
    
    if (result.length === 0) {
      return NextResponse.json({ profile: null });
    }
    
    return NextResponse.json({ profile: result[0] });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'DATABASE_URL not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const {
      gpa,
      sat,
      act,
      ap_offered,
      ap_taken,
      ec_tier,
      roles,
      major_multiplier,
      is_ed,
      is_athlete,
      is_legacy,
    } = body;

    const sql = neon(process.env.DATABASE_URL);

    // Create table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id SERIAL PRIMARY KEY,
        gpa DECIMAL(3, 2),
        sat INTEGER,
        act INTEGER,
        ap_offered INTEGER,
        ap_taken INTEGER,
        ec_tier INTEGER,
        roles INTEGER,
        major_multiplier DECIMAL(3, 2),
        is_ed BOOLEAN,
        is_athlete BOOLEAN,
        is_legacy BOOLEAN,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Insert new profile
    const result = await sql`
      INSERT INTO user_profiles (
        gpa, sat, act, ap_offered, ap_taken, ec_tier, roles, 
        major_multiplier, is_ed, is_athlete, is_legacy, updated_at
      )
      VALUES (
        ${gpa}, ${sat}, ${act}, ${ap_offered}, ${ap_taken}, ${ec_tier}, 
        ${roles}, ${major_multiplier}, ${is_ed}, ${is_athlete}, ${is_legacy},
        CURRENT_TIMESTAMP
      )
      RETURNING *
    `;

    return NextResponse.json({ 
      success: true, 
      profile: result[0] 
    });
  } catch (error) {
    console.error('Error saving profile:', error);
    return NextResponse.json(
      { error: 'Failed to save profile', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}