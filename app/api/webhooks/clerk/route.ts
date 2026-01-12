import { UserActions } from "@/app/enums/UserActions";

export const runtime = 'nodejs'

import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { supabaseAdmin } from '@/app/lib/supabaseAdmin'

export async function POST(req: Request) {
  const payload = await req.text()
  const headerList = await headers()

  const svix_id = headerList.get('svix-id')
  const svix_timestamp = headerList.get('svix-timestamp')
  const svix_signature = headerList.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing headers', { status: 400 })
  }

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!)

  let event: any

  try {
    event = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    })
  } catch (err) {
    return new Response('Invalid signature', { status: 400 })
  }

  if (event.type === UserActions.USER_CREATED) {
    const { id, email_addresses } = event.data
    const email = email_addresses?.[0]?.email_address ?? null

    try {
      const { error } = await supabaseAdmin
        .from('profiles')
        .insert({
          clerk_user_id: id,
          email,
        })
        .select()
        .single()

      if (error) {
        return new Response('DB error: ' + error.message, { status: 500 })
      }
    } catch (e) {
      return new Response('Exception: ' + (e instanceof Error ? e.message : String(e)), { status: 500 })
    }
  }

  if (event.type === UserActions.USER_UPDATED) {
    const { id, email_addresses } = event.data
    const email = email_addresses?.[0]?.email_address ?? null

    try {
      const { error } = await supabaseAdmin
        .from('profiles')
        .update({ email })
        .eq('clerk_user_id', id)

      if (error) {
        return new Response('DB update error: ' + error.message, { status: 500 })
      }
    } catch (e) {
      return new Response('Update exception: ' + (e instanceof Error ? e.message : String(e)), { status: 500 })
    }
  }

  if (event.type === UserActions.USER_DELETED) {
    const { id } = event.data

    try {
      const { error: journalError } = await supabaseAdmin
        .from('journals')
        .delete()
        .eq('clerk_user_id', id)

      if (journalError) {
        console.error('Failed to delete journals:', journalError)
        return new Response('DB delete journals error: ' + journalError.message, { status: 500 })
      }

      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('clerk_user_id', id)

      if (profileError) {
        console.error('Failed to delete profile:', profileError)
        return new Response('DB delete profile error: ' + profileError.message, { status: 500 })
      }

      console.log('🗑 Deleted profile and journals for:', id)
    } catch (e) {
      return new Response('Delete exception: ' + (e instanceof Error ? e.message : String(e)), { status: 500 })
    }
  }

  return new Response('OK', { status: 200 })
}
