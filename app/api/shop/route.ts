import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// GET /api/shop — return all shop items + user's owned/equipped items
export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [itemsResult, userItemsResult, profileResult] = await Promise.all([
    supabase.from('shop_items').select('*').eq('is_active', true).order('cost_points'),
    user
      ? supabase.from('user_shop_items').select('item_id, is_equipped').eq('user_id', user.id)
      : Promise.resolve({ data: [] }),
    user
      ? supabase.from('profiles').select('points').eq('id', user.id).single()
      : Promise.resolve({ data: null }),
  ])

  const ownedMap = new Map(
    (userItemsResult.data || []).map((i: { item_id: string; is_equipped: boolean }) => [
      i.item_id,
      i.is_equipped,
    ])
  )

  const items = (itemsResult.data || []).map((item: Record<string, unknown>) => ({
    ...item,
    owned: ownedMap.has(item.id as string),
    equipped: ownedMap.get(item.id as string) === true,
  }))

  return NextResponse.json({
    items,
    user_points: profileResult.data?.points ?? 0,
    is_logged_in: !!user,
  })
}

// POST /api/shop — purchase or equip item
// Body: { action: 'buy' | 'equip', item_id: string }
export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const { action, item_id } = body

  if (!item_id || !['buy', 'equip'].includes(action)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  // Get item details
  const { data: item } = await supabase
    .from('shop_items')
    .select('*')
    .eq('id', item_id)
    .eq('is_active', true)
    .single()

  if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 })

  // Check ownership
  const { data: owned } = await supabase
    .from('user_shop_items')
    .select('item_id, is_equipped')
    .eq('user_id', user.id)
    .eq('item_id', item_id)
    .single()

  if (action === 'buy') {
    if (owned) return NextResponse.json({ error: 'Already owned' }, { status: 400 })

    // Check user points
    const { data: profile } = await supabase
      .from('profiles')
      .select('points')
      .eq('id', user.id)
      .single()

    if (!profile || profile.points < item.cost_points) {
      return NextResponse.json(
        { error: `Not enough points. Need ${item.cost_points}, have ${profile?.points ?? 0}` },
        { status: 402 }
      )
    }

    // Deduct points + insert ownership in parallel
    await Promise.all([
      supabase
        .from('profiles')
        .update({ points: profile.points - item.cost_points })
        .eq('id', user.id),
      supabase.from('user_shop_items').insert({ user_id: user.id, item_id }),
      supabase.from('point_transactions').insert({
        user_id: user.id,
        amount: -item.cost_points,
        reason: `shop_purchase:${item_id}`,
      }),
    ])

    return NextResponse.json({
      success: true,
      new_points: profile.points - item.cost_points,
      item_id,
    })
  }

  if (action === 'equip') {
    if (!owned) return NextResponse.json({ error: 'Item not owned' }, { status: 400 })

    // Unequip all items in same category, then equip this one
    const category = item.category as string

    // Get all owned items in same category
    const { data: sameCategory } = await supabase
      .from('user_shop_items')
      .select('item_id')
      .eq('user_id', user.id)
      .in(
        'item_id',
        (await supabase.from('shop_items').select('id').eq('category', category)).data?.map(
          (i: { id: string }) => i.id
        ) || []
      )

    const toUnequip = (sameCategory || []).map((i: { item_id: string }) => i.item_id)

    if (toUnequip.length > 0) {
      await supabase
        .from('user_shop_items')
        .update({ is_equipped: false })
        .eq('user_id', user.id)
        .in('item_id', toUnequip)
    }

    // Equip the selected item
    await supabase
      .from('user_shop_items')
      .update({ is_equipped: true })
      .eq('user_id', user.id)
      .eq('item_id', item_id)

    // Save to profile columns for quick lookup
    const profileUpdateMap: Record<string, string | null> = {}
    if (category === 'profile_frame') profileUpdateMap.equipped_frame = item.css_value
    if (category === 'name_color') profileUpdateMap.equipped_name_color = item.css_value
    if (category === 'badge') profileUpdateMap.equipped_badge = item.css_value

    if (Object.keys(profileUpdateMap).length > 0) {
      await supabase.from('profiles').update(profileUpdateMap).eq('id', user.id)
    }

    return NextResponse.json({ success: true, equipped: item_id })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
