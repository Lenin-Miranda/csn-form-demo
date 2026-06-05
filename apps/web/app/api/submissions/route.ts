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

function mapSubmissionPayload(payload: Record<string, unknown>) {
    return {
        program: payload.program,
        availability: payload.availability,
        location: payload.location,
        csn_before: payload.csnBefore,
        ged_hiset: payload.gedHiset,
        heard_about: payload.heardAbout,
        transportation: payload.transportation,
        level: payload.level,
        improve: payload.improve,
        studied_before: payload.studiedBefore,
        passed_subjects: payload.passedSubjects,
        support_subject: payload.supportSubject,
        area: payload.area,
        prior_experience: payload.priorExperience,
        work_authorization: payload.workAuthorization,
    }
}

function mapStudentPayload(payload: Record<string, unknown>) {
    return {
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
    }
}

async function getStudentId(supabase: any, payload: Record<string, unknown>) {
    const email = payload.email as string | undefined

    if (!email) {
        throw new Error('Missing student email')
    }

    const studentTable = supabase.from('students') as any

    const existingStudentResponse = (await studentTable
        .select('id')
        .eq('email', email)
        .maybeSingle()) as {
            data: { id: string } | null
            error: unknown
        }

    const { data: existingStudent, error: selectError } = existingStudentResponse

    if (selectError) {
        throw selectError
    }

    if (existingStudent?.id) {
        return existingStudent.id
    }

    const newStudentResponse = (await studentTable
        .insert([mapStudentPayload(payload)])
        .select('id')
        .single()) as {
            data: { id: string }
            error: unknown
        }

    const { data: newStudent, error: insertError } = newStudentResponse

    if (insertError) {
        throw insertError
    }

    return newStudent.id
}

export async function POST(request: Request) {
    const payload = await request.json()
    const supabase = getSupabaseClient()

    try {
        const studentId = await getStudentId(supabase, payload)
        const submission = {
            ...mapSubmissionPayload(payload),
            student_id: studentId,
        }

        const { data, error } = await supabase
            .from('submissions')
            .insert([submission])
            .select()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ data }, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 })
    }
}
