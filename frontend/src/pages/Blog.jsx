import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, UserRound } from 'lucide-react';
import { getBlogs, getBlogBySlug } from '../lib/firestoreService';

const formatDate = value => value ? new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '';

const Blog = () => {
  const { slug } = useParams();
  const [blogs, setBlogs] = useState([]);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true);
      setError('');
      try {
        if (slug) {
          const data = await getBlogBySlug(slug);
          if (!data) throw new Error('Blog post not found.');
          setPost(data);
        } else {
          const data = await getBlogs();
          setBlogs(data);
        }
      } catch (err) {
        setError(err.message || 'Unable to load blog content.');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug]);

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', background: 'var(--cream)' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <section style={{ background: 'var(--cream)', padding: '80px 0' }}>
        <div className="container" style={{ maxWidth: '760px' }}>
          <div className="alert alert-error">{error}</div>
          <Link to="/blog" className="btn-outline" style={{ marginTop: '18px' }}>Back to Blog</Link>
        </div>
      </section>
    );
  }

  if (slug && post) {
    return (
      <article style={{ background: 'var(--cream)', paddingBottom: '80px' }}>
        <div style={{ height: '360px', background: 'var(--green-900)', position: 'relative', overflow: 'hidden' }}>
          <img src={post.cover_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.62 }} />
          <div className="container" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', paddingBottom: '42px' }}>
            <div style={{ maxWidth: '820px', color: 'white' }}>
              <Link to="/blog" style={{ color: 'rgba(255,255,255,0.82)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '7px', fontSize: '13px', fontWeight: 700, marginBottom: '16px' }}>
                <ArrowLeft size={15} /> Blog
              </Link>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '48px', lineHeight: 1.02, marginBottom: '14px', fontWeight: 600 }}>{post.title}</h1>
              <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', color: 'rgba(255,255,255,0.82)', fontSize: '13px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><UserRound size={14} /> {post.author_name}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><CalendarDays size={14} /> {formatDate(post.created_at)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="container" style={{ maxWidth: '820px', paddingTop: '42px' }}>
          <p style={{ fontSize: '19px', lineHeight: 1.75, color: 'var(--text-mid)', marginBottom: '28px' }}>{post.excerpt}</p>
          <div style={{ whiteSpace: 'pre-line', fontSize: '16px', lineHeight: 1.85, color: 'var(--text-dark)' }}>{post.content}</div>
        </div>
      </article>
    );
  }

  return (
    <section style={{ background: 'var(--cream)', padding: '72px 0 90px' }}>
      <div className="container">
        <div style={{ maxWidth: '760px', marginBottom: '34px' }}>
          <div className="label">The WellMan Co Journal</div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '46px', lineHeight: 1.05, color: 'var(--green-900)', marginBottom: '12px', fontWeight: 600 }}>Guides for discreet, informed care.</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px', lineHeight: 1.7 }}>Read practical notes from the The WellMan Co team on order flow, secure checkout, and wellness routines.</p>
        </div>

        {blogs.length === 0 ? (
          <div className="card-elevated" style={{ textAlign: 'center' }}>No posts published yet.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '22px' }}>
            {blogs.map(blog => (
              <Link key={blog.id} to={`/blog/${blog.slug}`} className="card" style={{ padding: 0, overflow: 'hidden', textDecoration: 'none', display: 'flex', flexDirection: 'column' }}>
                <div style={{ aspectRatio: '1.55', background: 'var(--beige-100)', overflow: 'hidden' }}>
                  <img src={blog.cover_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '22px' }}>
                  <div style={{ color: 'var(--text-light)', fontSize: '12px', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{formatDate(blog.created_at)}</div>
                  <h2 style={{ fontSize: '20px', lineHeight: 1.25, color: 'var(--green-900)', marginBottom: '10px' }}>{blog.title}</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.65 }}>{blog.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Blog;
