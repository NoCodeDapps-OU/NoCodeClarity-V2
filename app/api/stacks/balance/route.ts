import { NextResponse } from 'next/server';
import { 
  fetchCallReadOnlyFunction, 
  standardPrincipalCV,
  cvToString 
} from '@stacks/transactions';
import { STACKS_MAINNET } from '@stacks/network';
import { NOCC_CONTRACT } from '@/lib/constants';

// Add CORS headers helper
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const { address } = await req.json();

    // Fetch STX balance
    const stxResponse = await fetch(
      `https://api.mainnet.hiro.so/extended/v1/address/${address}/stx`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!stxResponse.ok) {
      throw new Error('Failed to fetch STX balance');
    }
    
    const stxData = await stxResponse.json();

    // Fetch NOCC balance with proper parsing
    try {
      const noccResult = await fetchCallReadOnlyFunction({
        contractAddress: NOCC_CONTRACT.address,
        contractName: NOCC_CONTRACT.name,
        functionName: 'get-balance',
        functionArgs: [standardPrincipalCV(address)],
        network: STACKS_MAINNET,
        senderAddress: address
      });

      // Parse the Clarity value response
      const noccBalance = cvToString(noccResult);
      // Extract the actual number from (ok u123) format
      const match = noccBalance.match(/\(ok u(\d+)\)/);
      const parsedNoccBalance = match ? match[1] : '0';

      return NextResponse.json({
        stx: stxData.balance || '0',
        nocc: parsedNoccBalance
      }, { 
        headers: corsHeaders 
      });

    } catch (noccError) {
      console.error('NOCC balance fetch error:', noccError);
      return NextResponse.json({
        stx: stxData.balance || '0',
        nocc: '0'
      }, { 
        headers: corsHeaders 
      });
    }

  } catch (error) {
    console.error('Balance fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch balances' }, 
      { 
        status: 500,
        headers: corsHeaders 
      }
    );
  }
} 