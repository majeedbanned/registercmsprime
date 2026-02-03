import { NextRequest, NextResponse } from 'next/server';

const API_URL = 'https://mycms.cmsprime.com/rest/users/new?version=1.0.0';
const API_TOKEN = process.env.API_TOKEN || '805e6648071ff54087a78d1f5e0a5508a3ed4fd92f692c704b4e3120991fcf3df3d2eab8d57ffb782d6e4d4fba12648fb04cc76c807ff684c96e5d24';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Debug: Log the payload being sent
    console.log('=== REGISTRATION API DEBUG ===');
    console.log('Payload sent to API:', JSON.stringify(body, null, 2));

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // Debug: Log response status
    console.log('Response Status:', response.status);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));

    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
      // Debug: Log the response data
      console.log('Response Data:', JSON.stringify(data, null, 2));
      console.log('Response Data Type:', Array.isArray(data) ? 'Array' : typeof data);
      if (Array.isArray(data) && data.length > 0) {
        console.log('First Item ID:', data[0]?.id);
        console.log('First Item Email:', data[0]?.email);
      }
    } else {
      const text = await response.text();
      console.log('Non-JSON Response:', text);
      return NextResponse.json(
        {
          success: false,
          code: response.status,
          message: `Server error: ${response.statusText}`,
          errors: {},
          rawResponse: text,
        },
        { status: response.status }
      );
    }

    if (!response.ok) {
      // Return all error details from the server
      console.log('API Error Response:', data);
      return NextResponse.json(
        {
          success: false,
          code: data.code || response.status,
          message: data.message || 'Registration failed',
          errors: data.errors || {},
          // Include any additional error information
          ...(data.error && { serverError: data.error }),
        },
        { status: response.status }
      );
    }

    console.log('=== END DEBUG ===');
    return NextResponse.json(
      {
        success: true,
        data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Registration API Error:', error);
    return NextResponse.json(
      {
        success: false,
        code: 500,
        message: 'An unexpected error occurred',
        errors: {},
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

