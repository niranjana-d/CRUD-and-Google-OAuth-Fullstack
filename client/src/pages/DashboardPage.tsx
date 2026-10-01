import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { postService } from '../services/postService';
import { Post } from '../types';
import { Badge } from '../components/Badge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { 
  FiFileText, 
  FiUserCheck, 
  FiPlusCircle, 
  FiArrowRight, 
  FiShield, 
  FiClock, 
  FiEye, 
  FiEdit2 
} from 'react-icons/fi';

export const DashboardPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const data = await postService.getPosts();
        setPosts(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const totalPostsCount = posts.length;
  const myPosts = posts.filter((p) => p.isOwner);
  const myPostsCount = myPosts.length;
  const recentPosts = posts.slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1 w-full">
      {/* Welcome Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Welcome back, {user?.name}!
            </h1>
            <Badge variant={user?.role === 'ADMIN' ? 'admin' : 'primary'} size="md">
              {user?.role}
            </Badge>
          </div>
          <p className="text-sm text-slate-300 max-w-xl">
            Here is your live dashboard overview. You can browse, create, and manage your posts, or review external REST API data in real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10">
          <Link
            to="/posts/create"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/30 text-sm"
          >
            <FiPlusCircle className="w-4 h-4" />
            Create Post
          </Link>
          {isAdmin && (
            <Link
              to="/admin/users"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-purple-300 glass-panel border border-purple-500/40 hover:bg-purple-950/40 transition text-sm"
            >
              <FiShield className="w-4 h-4" />
              Manage Users
            </Link>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Posts */}
        <div className="glass-panel glass-panel-hover p-6 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Posts (JSONPlaceholder)
            </span>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
              <FiFileText className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">
            {loading ? <span className="text-slate-500 text-lg">Loading...</span> : totalPostsCount}
          </div>
          <p className="text-xs text-slate-400">Posts available via external REST endpoint</p>
        </div>

        {/* My Posts */}
        <div className="glass-panel glass-panel-hover p-6 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              My Created Posts
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <FiUserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">
            {loading ? <span className="text-slate-500 text-lg">Loading...</span> : myPostsCount}
          </div>
          <p className="text-xs text-slate-400">Tracked in application PostgreSQL database</p>
        </div>

        {/* User Role & Access Status */}
        <div className="glass-panel glass-panel-hover p-6 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Your Permission Level
            </span>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
              <FiShield className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <span>{user?.role}</span>
            <span className="text-xs font-normal text-slate-400">
              ({isAdmin ? 'Full admin rights' : 'Standard author access'})
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {isAdmin
              ? 'Can edit/delete any post and configure system users'
              : 'Can edit and delete your own created posts'}
          </p>
        </div>
      </div>

      {/* Recent Posts Section */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiClock className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Recent Posts</h2>
          </div>
          <Link
            to="/posts"
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
          >
            View all posts
            <FiArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Fetching posts..." />
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-500/10 text-rose-300 text-sm border border-rose-500/30">
            {error}
          </div>
        ) : recentPosts.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">No posts found.</p>
        ) : (
          <div className="divide-y divide-slate-800">
            {recentPosts.map((post) => (
              <div
                key={post.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-500">#{post.id}</span>
                    <Link
                      to={`/posts/${post.id}`}
                      className="text-sm font-semibold text-slate-200 group-hover:text-indigo-300 transition line-clamp-1"
                    >
                      {post.title}
                    </Link>
                    {post.isOwner && (
                      <Badge variant="success" size="sm">
                        My Post
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1">{post.body}</p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    to={`/posts/${post.id}`}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                    title="View post"
                  >
                    <FiEye className="w-4 h-4" />
                  </Link>
                  {(post.isOwner || isAdmin) && (
                    <Link
                      to={`/posts/${post.id}/edit`}
                      className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition"
                      title="Edit post"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
