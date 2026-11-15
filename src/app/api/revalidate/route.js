import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

const REVALIDATION_SECRET = process.env.REVALIDATION_SECRET || 'ecom_policy_secret_2026';

export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    let secret = searchParams.get('secret');
    let body = {};

    try {
      body = await request.json();
    } catch (_) {}

    secret = secret || body?.secret;

    if (secret !== REVALIDATION_SECRET) {
      return NextResponse.json(
        { success: false, message: 'Invalid or missing revalidation secret token' },
        { status: 401 }
      );
    }

    const slug = searchParams.get('slug') || body?.slug;
    const path = searchParams.get('path') || body?.path;
    const tag = searchParams.get('tag') || body?.tag;

    // Purge the global policies tag and directory page
    revalidateTag('policies');
    revalidatePath('/policies', 'page');
    revalidatePath('/privacy', 'page');
    revalidatePath('/terms', 'page');
    revalidatePath('/refund', 'page');
    revalidatePath('/refund-policy', 'page');
    revalidatePath('/shipping-policy', 'page');

    if (tag) {
      revalidateTag(tag);
    }

    if (slug) {
      revalidateTag(`policy-${slug}`);
      revalidatePath(`/policies/${slug}`, 'page');
    }

    if (path) {
      revalidatePath(path, 'page');
    }

    return NextResponse.json({
      success: true,
      revalidated: true,
      timestamp: Date.now(),
      target: slug ? `/policies/${slug}` : (path || 'all policies'),
      message: `Static cache purged. Next visit will serve regenerated static HTML.`
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || 'Revalidation failed' },
      { status: 500 }
    );
  }
}

// Also support GET for easy manual testing or webhook ping
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  if (secret !== REVALIDATION_SECRET) {
    return NextResponse.json(
      { success: false, message: 'Invalid or missing revalidation secret token' },
      { status: 401 }
    );
  }

  const slug = searchParams.get('slug');
  const path = searchParams.get('path');

  revalidateTag('policies');
  revalidatePath('/policies', 'page');

  if (slug) {
    revalidateTag(`policy-${slug}`);
    revalidatePath(`/policies/${slug}`, 'page');
  }

  if (path) {
    revalidatePath(path, 'page');
  }

  return NextResponse.json({
    success: true,
    revalidated: true,
    timestamp: Date.now(),
    target: slug ? `/policies/${slug}` : (path || 'all policies')
  });
}
