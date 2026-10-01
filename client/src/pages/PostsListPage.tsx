import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { postService } from '../services/postService';
import { Post } from '../types';
import { Badge } from '../components/Badge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { 
  FiSearch, 
  FiPlus, 
  FiEye, 
  FiEdit, 
  FiTrash2, 
  FiFilter, 
  FiChevronLeft, 
  FiChevronRight, 
  FiUserCheck,
  FiAlertCircle
} from 'react-icons/fi';

const POSTS_PER_PAGE = 10;

export const PostsListPage: React.FC = () => {
  const { user, isAdmin, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search and filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOwnerOnly, setFilterOwnerOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Delete modal state
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await postService.getPosts();
      setPosts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load posts from external API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Filter posts by search query and ownership
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.body.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesOwner = filterOwnerOnly ? post.isOwner : true;

      return matchesSearch && matchesOwner;
    });
  }, [posts, searchQuery, filterOwnerOnly]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE) || 1;
  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    return filteredPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);
  }, [filteredPosts, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDeleteClick = (post: Post) => {
    setPostToDelete(post);
  };

  const handleConfirmDelete = async () => {
    if (!postToDelete) return;
    setIsDeleting(true);
    setFeedbackMessage(null);

    try {
      await postService.deletePost(postToDelete.id);
      // Remove post from local state
      setPosts((prev) => prev.filter((p) => p.id !== postToDelete.id));
      setFeedbackMessage({
        type: 'success',
        text: `Post #${postToDelete.id} successfully deleted (simulated via JSONPlaceholder).`,
      });
      setPostToDelete(null);
    } catch (err: any) {
      setFeedbackMessage({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Failed to delete post.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 flex-1 w-full">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Posts</h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse and manage posts synced between the backend and JSONPlaceholder
          </p>
        </div>

        {isAuthenticated && (
          <Link
            to="/posts/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/30 text-sm self-start sm:self-auto"
          >
            <FiPlus className="w-4 h-4" />
            Create Post
          </Link>
        )}
      </div>

      {/* Feedback Banner */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-sm transition ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
          }`}
        >
          <span>{feedbackMessage.text}</span>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-xs font-semibold uppercase hover:underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <FiSearch className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search posts by title or content..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950/60 border border-slate-700/70 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition"
          />
        </div>

        {/* Filter Toggle */}
        {isAuthenticated && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setFilterOwnerOnly(!filterOwnerOnly);
                setCurrentPage(1);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition border ${
                filterOwnerOnly
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              <FiUserCheck className="w-3.5 h-3.5" />
              {filterOwnerOnly ? 'Showing My Posts Only' : 'Filter: All Posts'}
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {loading ? (
        <LoadingSpinner size="lg" text="Loading posts from external API..." />
      ) : error ? (
        <div className="glass-panel p-8 rounded-2xl border border-rose-500/30 text-center space-y-4">
          <FiAlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">Error Loading Posts</h3>
          <p className="text-sm text-slate-300 max-w-md mx-auto">{error}</p>
          <button
            onClick={fetchPosts}
            className="px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition"
          >
            Retry
          </button>
        </div>
      ) : paginatedPosts.length === 0 ? (
        <EmptyState
          title="No posts found"
          description={
            searchQuery
              ? `No posts matched your search for "${searchQuery}".`
              : 'There are currently no posts matching your selection.'
          }
          actionText={searchQuery ? 'Clear Search' : undefined}
          onAction={searchQuery ? () => setSearchQuery('') : undefined}
        />
      ) : (
        <div className="space-y-4">
          {paginatedPosts.map((post) => {
            const canEdit = post.isOwner || isAdmin;
            const canDelete = post.isOwner || isAdmin;

            return (
              <article
                key={post.id}
                className="glass-panel glass-panel-hover p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                      #{post.id}
                    </span>
                    <h2 className="text-lg font-bold text-white capitalize leading-snug">
                      <Link to={`/posts/${post.id}`} className="hover:text-indigo-400 transition">
                        {post.title}
                      </Link>
                    </h2>
                    {post.isOwner && (
                      <Badge variant="success" size="sm">
                        My Post
                      </Badge>
                    )}
                    {post.ownerName && !post.isOwner && (
                      <span className="text-xs text-slate-400">by {post.ownerName}</span>
                    )}
                  </div>

                  <p className="text-sm text-slate-300 line-clamp-3 leading-relaxed">
                    {post.body}
                  </p>
                </div>

                {/* Post Actions */}
                <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-start pt-2 sm:pt-0">
                  <Link
                    to={`/posts/${post.id}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 rounded-xl transition border border-slate-700"
                    title="View details"
                  >
                    <FiEye className="w-3.5 h-3.5" />
                    View
                  </Link>

                  {canEdit && (
                    <Link
                      to={`/posts/${post.id}/edit`}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-300 hover:text-indigo-200 bg-indigo-600/20 hover:bg-indigo-600/30 rounded-xl transition border border-indigo-500/30"
                      title="Edit post"
                    >
                      <FiEdit className="w-3.5 h-3.5" />
                      Edit
                    </Link>
                  )}

                  {canDelete && (
                    <button
                      onClick={() => handleDeleteClick(post)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:text-rose-200 bg-rose-600/20 hover:bg-rose-600/30 rounded-xl transition border border-rose-500/30"
                      title="Delete post"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  )}
                </div>
              </article>
            );
          })}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between mt-8">
              <span className="text-xs text-slate-400">
                Page <span className="font-semibold text-slate-200">{currentPage}</span> of{' '}
                <span className="font-semibold text-slate-200">{totalPages}</span> ({filteredPosts.length} posts)
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none transition"
                  aria-label="Previous Page"
                >
                  <FiChevronLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none transition"
                  aria-label="Next Page"
                >
                  <FiChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!postToDelete}
        title="Delete Post"
        message={`Are you sure you want to delete post #${postToDelete?.id} ("${postToDelete?.title}")? Note: JSONPlaceholder will simulate this deletion.`}
        confirmLabel="Confirm Delete"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPostToDelete(null)}
      />
    </div>
  );
};
