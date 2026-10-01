import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { postService } from '../services/postService';
import { FiArrowLeft, FiPlusCircle, FiAlertCircle } from 'react-icons/fi';

export const CreatePostPage: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Please provide a post title.');
      return;
    }
    if (!body.trim()) {
      setError('Please provide post content.');
      return;
    }

    setLoading(true);
    try {
      const created = await postService.createPost(title.trim(), body.trim());
      navigate(`/posts/${created.id}`);
    } catch (err: any) {
      const msg =
        err.response?.data?.errors?.[0]?.message ||
        err.response?.data?.message ||
        err.message ||
        'Failed to create post. Please try again.';
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 flex-1 w-full">
      <div>
        <Link
          to="/posts"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition"
        >
          <FiArrowLeft className="w-4 h-4" />
          Cancel and return to posts
        </Link>
      </div>

      <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-slate-800 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Create New Post
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Publish a new post. The application backend will forward this to JSONPlaceholder and record your ownership in the database.
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Post Title */}
          <div className="space-y-2">
            <label htmlFor="post-title" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Post Title <span className="text-rose-400">*</span>
            </label>
            <input
              id="post-title"
              type="text"
              required
              maxLength={255}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Modern Full-Stack Architecture with Node.js & React"
              className="w-full px-4 py-3 bg-slate-950/60 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition"
            />
            <span className="text-[11px] text-slate-500">Max 255 characters</span>
          </div>

          {/* Post Body */}
          <div className="space-y-2">
            <label htmlFor="post-body" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Post Content <span className="text-rose-400">*</span>
            </label>
            <textarea
              id="post-body"
              required
              rows={8}
              maxLength={5000}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write the full content of your post here..."
              className="w-full px-4 py-3 bg-slate-950/60 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition resize-y"
            />
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>Markdown or plain text</span>
              <span>{body.length} / 5000</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Link
              to="/posts"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/30 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating post...
                </>
              ) : (
                <>
                  <FiPlusCircle className="w-4 h-4" />
                  Publish Post
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
