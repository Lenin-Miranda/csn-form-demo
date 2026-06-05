import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabaseClient() {
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseServiceRoleKey =
        process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY

    if (!supabaseUrl || !supabaseServiceRoleKey) {
        throw new Error(
            'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables',
        )
    }

    return createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    })
}

export async function POST(request: Request) {
    const payload = await request.json()
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
        .from('submissions')
        .insert([payload])
        .select()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
}
