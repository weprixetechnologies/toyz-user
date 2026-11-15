import { notFound } from 'next/navigation';
import PolicyInteractiveView from './PolicyInteractiveView';

// Incremental Static Regeneration: 24 hours fallback (86400 seconds)
// Can also be revalidated on-demand instantly via /api/revalidate when content changes
export const revalidate = 86400;
export const dynamicParams = true;

const API_BASE = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:46711/api/v1';

async function getPolicy(slug) {
  try {
    const res = await fetch(`${API_BASE}/policies/${slug}`, {
      next: {
        revalidate: 86400,
        tags: ['policies', `policy-${slug}`]
      }
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Failed to fetch policy: ${res.statusText}`);
    }

    const json = await res.json();
    return json?.data || null;
  } catch (err) {
    console.error(`[Policy Static Fetch Error for ${slug}]:`, err.message);
    return null;
  }
}

async function getAllPolicies() {
  try {
    const res = await fetch(`${API_BASE}/policies`, {
      next: {
        revalidate: 86400,
        tags: ['policies']
      }
    });

    if (!res.ok) return [];
    const json = await res.json();
    return json?.data || [];
  } catch (_) {
    return [];
  }
}

// Generate static HTML for all existing published policies at build time
export async function generateStaticParams() {
  try {
    const policies = await getAllPolicies();
    if (!policies || policies.length === 0) {
      return [
        { slug: 'privacy-policy' },
        { slug: 'refund-policy' },
        { slug: 'terms-and-conditions' },
        { slug: 'shipping-policy' }
      ];
    }

    return policies.map((p) => ({
      slug: p.slug
    }));
  } catch (err) {
    console.warn('[Policies generateStaticParams]:', err.message);
    return [
      { slug: 'privacy-policy' },
      { slug: 'refund-policy' },
      { slug: 'terms-and-conditions' },
      { slug: 'shipping-policy' }
    ];
  }
}

// Generate Static SEO metadata
export async function generateMetadata({ params }) {
  const policy = await getPolicy(params.slug);
  if (!policy) {
    return {
      title: 'Policy Not Found | Provoke Playtech',
      description: 'The requested policy document could not be found.'
    };
  }

  const title = policy.meta_title || `${policy.title} | Provoke Playtech`;
  const description = policy.meta_description || policy.summary || `Read the official ${policy.title} at Provoke Playtech.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article'
    }
  };
}

export default async function PolicyDetailPage({ params }) {
  const { slug } = params;
  const [policy, allPolicies] = await Promise.all([
    getPolicy(slug),
    getAllPolicies()
  ]);

  if (!policy) {
    notFound();
  }

  return (
    <PolicyInteractiveView
      policy={policy}
      allPolicies={allPolicies}
    />
  );
}
