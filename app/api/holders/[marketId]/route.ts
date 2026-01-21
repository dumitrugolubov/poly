import { NextResponse } from 'next/server';

const DATA_API = 'https://data-api.polymarket.com';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ marketId: string }> }
) {
  const { marketId } = await params;

  try {
    const response = await fetch(
      `${DATA_API}/holders?market=${marketId}&limit=10`,
      {
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform the data - holders are grouped by token (Yes/No)
    const holders: {
      address: string;
      name: string;
      profileImage: string;
      amount: number;
      outcome: string;
    }[] = [];

    for (const tokenGroup of data) {
      const outcomeIndex = tokenGroup.holders?.[0]?.outcomeIndex ?? 0;
      const outcome = outcomeIndex === 0 ? 'Yes' : 'No';

      for (const holder of tokenGroup.holders || []) {
        holders.push({
          address: holder.proxyWallet,
          name: holder.name || holder.pseudonym || '',
          profileImage: holder.profileImageOptimized || holder.profileImage || '',
          amount: holder.amount,
          outcome,
        });
      }
    }

    // Sort by amount descending
    holders.sort((a, b) => b.amount - a.amount);

    return NextResponse.json(holders.slice(0, 20));
  } catch (error) {
    console.error('Failed to fetch holders:', error);
    return NextResponse.json({ error: 'Failed to fetch holders' }, { status: 500 });
  }
}
