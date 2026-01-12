import { supabaseAdmin } from '@/app/lib/supabaseAdmin'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const pageSize = parseInt(url.searchParams.get('pageSize') || '5')
    const userId = url.searchParams.get('userId')

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Missing userId' }), { status: 400 })
    }

    const from = (page - 1) * pageSize
    const to = page * pageSize - 1

    const { count: totalCount } = await supabaseAdmin
      .from('journals')
      .select('id', { count: 'exact', head: true })
      .eq('clerk_user_id', userId)

    const totalPages = Math.ceil((totalCount || 0) / pageSize)

    const { data, error } = await supabaseAdmin
      .from('journals')
      .select('*')
      .eq('clerk_user_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }

    return new Response(
      JSON.stringify({
        records: data || [],
        totalPages: totalPages || 1,
      }),
      { status: 200 }
    )
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500 })
  }
}
