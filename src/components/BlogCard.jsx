import Link from 'next/link';
import { Calendar, Clock, ArrowRight, Tag } from 'lucide-react';

export default function BlogCard({ blog, priority = false }) {
  if (!blog) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (_) {
      return dateStr;
    }
  };

  const formattedDate = formatDate(blog.published_at || blog.created_at);

  return (
    <article className="group bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm hover:shadow-xl hover:border-[#F51F2D]/30 transition-all duration-300 flex flex-col justify-between h-full font-sans">
      <div>
        {/* Featured Image Container */}
        <Link
          href={`/blogs/${blog.slug}`}
          className="block relative aspect-[16/10] overflow-hidden bg-gray-100"
          tabIndex={-1}
        >
          {blog.featured_image ? (
            <img
              src={blog.featured_image}
              alt={blog.title || 'Blog article'}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              loading={priority ? 'eager' : 'lazy'}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 text-gray-400">
              <Tag size={32} className="text-[#F51F2D]/40" />
            </div>
          )}

          {/* Category Chip Badge over Image */}
          {blog.category_name && (
            <div className="absolute top-3.5 left-3.5">
              <span className="inline-block px-3 py-1 bg-white/95 backdrop-blur-sm text-[#F51F2D] text-xs font-black uppercase tracking-wider rounded-full shadow-sm">
                {blog.category_name}
              </span>
            </div>
          )}
        </Link>

        {/* Content Body */}
        <div className="p-6 space-y-3">
          {/* Metadata bar */}
          <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
            {formattedDate && (
              <span className="flex items-center gap-1">
                <Calendar size={13} className="text-gray-400" />
                <span>{formattedDate}</span>
              </span>
            )}
            {blog.reading_time && (
              <>
                <span className="text-gray-300">•</span>
                <span className="flex items-center gap-1">
                  <Clock size={13} className="text-gray-400" />
                  <span>{blog.reading_time}</span>
                </span>
              </>
            )}
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#F51F2D] transition-colors line-clamp-2 leading-snug">
            <Link href={`/blogs/${blog.slug}`}>
              {blog.title}
            </Link>
          </h3>

          {/* Excerpt */}
          {blog.excerpt && (
            <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
              {blog.excerpt}
            </p>
          )}
        </div>
      </div>

      {/* Footer / Read More Button */}
      <div className="px-6 pb-6 pt-2 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500">
          By {blog.author_name || 'ToyWorld Team'}
        </span>

        <Link
          href={`/blogs/${blog.slug}`}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-[#F51F2D] hover:text-[#c41522] group/btn transition-colors"
        >
          <span>Read More</span>
          <ArrowRight
            size={15}
            className="group-hover/btn:translate-x-1 transition-transform"
          />
        </Link>
      </div>
    </article>
  );
}
