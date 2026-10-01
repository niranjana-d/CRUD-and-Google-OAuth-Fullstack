import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { postService } from '../services/postService';
import { Post } from '../types';
import { Badge } from '../components/Badge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { 
  FiArrowLeft, 
  FiEdit, 
  FiTrash2, 
  FiUser, 
  FiInfo, 
  FiAlertCircle 
} from 'react-icons/fi';

export const PostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Deletion modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const data = await postService.getPostById(id);
        setPost(data);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Post not found');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleDelete = async () => {
    if (!post) return;
    setIsDeleting(true);
    try {
      await postService.deletePost(post.id);
      navigate('/posts');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete post');
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const canEdit = post?.isOwner || isAdmin;
  const canDelete = post?.isOwner || isAdmin;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 flex-1 w-full">
      {/* Back button */}
      <div>
        <Link
          to="/posts"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back to all posts
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" text="Loading post details..." />
      ) : error || !post ? (
        <div className="glass-panel p-8 rounded-3xl border border-rose-500/30 text-center space-y-4">
          <FiAlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Post Not Found</h2>
          <p className="text-sm text-slate-300 max-w-sm mx-auto">
            {error || 'The requested post could not be retrieved from the server.'}
          </p>
          <Link
            to="/posts"
            className="inline-block px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition"
          >
            Return to Posts
          </Link>
        </div>
      ) : (
        <article className="glass-panel p-8 sm:p-10 rounded-3xl border border-slate-800 space-y-6 relative">
          {/* Post Header */}
          <div className="space-y-4 border-b border-slate-800 pb-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                  Post #{post.id}
                </span>
                {post.isOwner && (
                  <Badge variant="success" size="md">
                    My Post
                  </Badge>
                )}
                {isAdmin && (
                  <Badge variant="admin" size="md">
                    Admin Managed
                  </Badge>
                )}
              </div>

              {/* Action buttons */}
              {(canEdit || canDelete) && (
                <div className="flex items-center gap-2">
                  {canEdit && (
                    <Link
                      to={`/posts/${post.id}/edit`}
                      className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-300 hover:text-white bg-indigo-600/20 hover:bg-indigo-600/40 rounded-xl transition border border-indigo-500/40"
                    >
                      <FiEdit className="w-3.5 h-3.5" />
                      Edit Post
                    </Link>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-300 hover:text-white bg-rose-600/20 hover:bg-rose-600/40 rounded-xl transition border border-rose-500/40"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                      Delete Post
                    </button>
                  )}
                </div>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white capitalize tracking-tight leading-snug">
              {post.title}
            </h1>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <FiUser className="w-3.5 h-3.5 text-slate-500" />
              <span>
                Author:{' '}
                <span className="font-medium text-slate-300">
                  {post.ownerName ? post.ownerName : `JSONPlaceholder User ID: ${post.userId}`}
                </span>
              </span>
            </div>
          </div>

          {/* Post Content */}
          <div className="prose prose-invert max-w-none text-slate-200 leading-relaxed text-base sm:text-lg">
            <p className="whitespace-pre-line">{post.body}</p>
          </div>

          {/* Architecture note */}
          <div className="mt-8 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 flex items-start gap-3 text-xs text-indigo-300">
            <FiInfo className="w-4 h-4 mt-0.5 flex-shrink-0 text-indigo-400" />
            <p>
              Data sourced via application backend communicating with JSONPlaceholder. Edits and deletions
              are authorized via role/ownership rules stored in PostgreSQL, with fake REST mutations safely simulated.
            </p>
          </div>
        </article>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Delete Post"
        message={`Are you sure you want to delete post #${post?.id}?`}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
};
