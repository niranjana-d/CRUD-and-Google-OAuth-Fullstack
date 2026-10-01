import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { postService } from '../services/postService';
import { Post } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { FiArrowLeft, FiSave, FiAlertCircle } from 'react-icons/fi';

export const EditPostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const post = await postService.getPostById(id);

        // RBAC check: must be owner or admin
        if (!post.isOwner && !isAdmin) {
          navigate('/403', { replace: true });
          return;
        }

        setTitle(post.title);
        setBody(post.body);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Failed to load post for editing');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    if (!title.trim()) {
      setError('Please provide a post title.');
      return;
    }
    if (!body.trim()) {
      setError('Please provide post content.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await postService.updatePost(id, title.trim(), body.trim());
      navigate(`/posts/${id}`);
    } catch (err: any) {
      const msg =
        err.response?.data?.errors?.[0]?.message ||
        err.response?.data?.message ||
        err.message ||
        'Failed to update post.';
      setError(msg);
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 flex-1 w-full">
      <div>
        <Link
          to={`/posts/${id}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition"
        >
          <FiArrowLeft className="w-4 h-4" />
          Cancel and return to post
        </Link>
      </div>

      <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-slate-800 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Edit Post #{id}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Update post title and content. Modifications are verified by RBAC and simulated on JSONPlaceholder.
          </p>
        </div>

        {error && (
          <div
            className="flex items-start gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm"
            role="alert"
          >
            <FiAlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <LoadingSpinner size="lg" text="Loading post content..." />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="edit-title" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Post Title <span className="text-rose-400">*</span>
              </label>
              <input
                id="edit-title"
                type="text"
                required
                maxLength={255}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950/60 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="edit-body" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Post Content <span className="text-rose-400">*</span>
              </label>
              <textarea
                id="edit-body"
                required
                rows={8}
                maxLength={5000}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950/60 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition resize-y"
              />
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Markdown or plain text</span>
                <span>{body.length} / 5000</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <Link
                to={`/posts/${id}`}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/30 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Updating post...
                  </>
                ) : (
                  <>
                    <FiSave className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
