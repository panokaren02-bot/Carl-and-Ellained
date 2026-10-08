import { type NextRequest, NextResponse } from "next/server"
import { siteConfig } from "@/content/site"
import {
  asSheetRows,
  fetchGoogleScriptJson,
  invalidateSheetsCache,
  listResponseHeaders,
  SHEETS_CACHE_KEYS,
  withSheetsCache,
} from "@/lib/sheets-cache"

// You'll need to replace this with your PrincipalSponsor Google Apps Script URL
const PRINCIPAL_SPONSOR_SCRIPT_URL =  siteConfig.googleAPI.sponsors

// PrincipalSponsor interface matching the Google Sheets structure
export interface PrincipalSponsor {
  MalePrincipalSponsor: string
  FemalePrincipalSponsor: string
}

// ?list=one | ?list=two → sponsor sheet for /inviteone or /invitetwo
const SPONSOR_LISTS: Record<string, string> = {
  one: siteConfig.googleAPI.sponsorsInviteOne,
  two: siteConfig.googleAPI.sponsorsInviteTwo,
}

// GET: Fetch all principal sponsors
export async function GET(request: NextRequest) {
  const list = request.nextUrl.searchParams.get("list") ?? ""
  const listUrl = SPONSOR_LISTS[list]
  const scriptUrl = listUrl || PRINCIPAL_SPONSOR_SCRIPT_URL
  const cacheKey = listUrl ? `${SHEETS_CACHE_KEYS.sponsors}:${list}` : SHEETS_CACHE_KEYS.sponsors
  try {
    const data = await withSheetsCache(cacheKey, async () => {
      const payload = await fetchGoogleScriptJson(scriptUrl)
      const rows = asSheetRows(payload)
      if (!rows) {
        throw new Error("Failed to fetch principal sponsors")
      }
      return rows
    })

    return NextResponse.json(data, { status: 200, headers: listResponseHeaders })
  } catch (error) {
    console.error('Error fetching principal sponsors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch principal sponsors' },
      { status: 500 }
    )
  }
}

// POST: Add a new principal sponsor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { MalePrincipalSponsor, FemalePrincipalSponsor } = body

    // Validation
    if (!MalePrincipalSponsor || typeof MalePrincipalSponsor !== 'string') {
      return NextResponse.json(
        { error: 'MalePrincipalSponsor is required' },
        { status: 400 }
      )
    }

    const sponsorData = {
      MalePrincipalSponsor: MalePrincipalSponsor.trim(),
      FemalePrincipalSponsor: FemalePrincipalSponsor?.trim() || '',
    }

    const response = await fetch(PRINCIPAL_SPONSOR_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sponsorData),
    })

    if (!response.ok) {
      throw new Error('Failed to add principal sponsor')
    }

    const data = await response.json()
    invalidateSheetsCache(SHEETS_CACHE_KEYS.sponsors)
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error adding principal sponsor:', error)
    return NextResponse.json(
      { error: 'Failed to add principal sponsor' },
      { status: 500 }
    )
  }
}

// PUT: Update an existing principal sponsor
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { MalePrincipalSponsor, FemalePrincipalSponsor, originalMale, originalFemale } = body

    // Validation
    if (!originalMale && !originalFemale) {
      return NextResponse.json(
        { error: 'Original sponsor information is required for update' },
        { status: 400 }
      )
    }

    const updateData = {
      action: 'update',
      originalMale: originalMale || '',
      originalFemale: originalFemale || '',
      MalePrincipalSponsor: MalePrincipalSponsor?.trim() || '',
      FemalePrincipalSponsor: FemalePrincipalSponsor?.trim() || '',
    }

    const response = await fetch(PRINCIPAL_SPONSOR_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    })

    if (!response.ok) {
      throw new Error('Failed to update principal sponsor')
    }

    const data = await response.json()
    invalidateSheetsCache(SHEETS_CACHE_KEYS.sponsors)
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('Error updating principal sponsor:', error)
    return NextResponse.json(
      { error: 'Failed to update principal sponsor' },
      { status: 500 }
    )
  }
}

// DELETE: Delete a principal sponsor
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { MalePrincipalSponsor } = body

    // Validation
    if (!MalePrincipalSponsor || typeof MalePrincipalSponsor !== 'string') {
      return NextResponse.json(
        { error: 'MalePrincipalSponsor is required' },
        { status: 400 }
      )
    }

    const deleteData = {
      action: 'delete',
      MalePrincipalSponsor: MalePrincipalSponsor.trim(),
    }

    const response = await fetch(PRINCIPAL_SPONSOR_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deleteData),
    })

    if (!response.ok) {
      throw new Error('Failed to delete principal sponsor')
    }

    const data = await response.json()
    invalidateSheetsCache(SHEETS_CACHE_KEYS.sponsors)
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('Error deleting principal sponsor:', error)
    return NextResponse.json(
      { error: 'Failed to delete principal sponsor' },
      { status: 500 }
    )
  }
}

