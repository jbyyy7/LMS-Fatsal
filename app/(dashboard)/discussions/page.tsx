'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Plus, User, MessageCircle, ThumbsUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

interface Discussion {
  id: string;
  title: string;
  content: string;
  created_at: string;
  author: {
    full_name: string;
    role: string;
  };
  course: {
    title: string;
  };
  _repliesCount?: number;
  _likesCount?: number;
}

export default function DiscussionsPage() {
  const { profile } = useAuth();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDiscussions();
  }, []);

  const fetchDiscussions = async () => {
    try {
      const { data, error } = await supabase
        .from('discussions')
        .select(`
          *,
          author:profiles!discussions_author_id_fkey(full_name, role),
          course:courses(title)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get replies count for each discussion
      if (data) {
        const discussionsWithCounts = await Promise.all(
          data.map(async (discussion) => {
            const { count: repliesCount } = await supabase
              .from('discussion_replies')
              .select('*', { count: 'exact', head: true })
              .eq('discussion_id', discussion.id);

            return {
              ...discussion,
              _repliesCount: repliesCount || 0,
              _likesCount: Math.floor(Math.random() * 20), // Placeholder
            };
          })
        );
        setDiscussions(discussionsWithCounts);
      }
    } catch (error) {
      console.error('Error fetching discussions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Teacher': return 'bg-purple-100 text-purple-700';
      case 'Admin': return 'bg-red-100 text-red-700';
      case 'Staff': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat diskusi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Forum Diskusi</h1>
          <p className="text-gray-600 mt-1">Diskusi dan tanya jawab seputar pembelajaran</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus className="w-5 h-5" />
          Mulai Diskusi
        </button>
      </div>

      <div className="grid gap-4">
        {discussions.map((discussion) => {
          const createdDate = new Date(discussion.created_at);
          
          return (
            <div
              key={discussion.id}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg mb-1">{discussion.title}</h3>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-gray-700">{discussion.author.full_name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(discussion.author.role)}`}>
                          {discussion.author.role}
                        </span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-500">
                          {createdDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{discussion.content}</p>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="font-medium text-blue-600">{discussion.course.title}</span>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{discussion._repliesCount} balasan</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4" />
                      <span>{discussion._likesCount} suka</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {discussions.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum ada diskusi</h3>
          <p className="text-gray-600 mb-4">Mulai diskusi pertama sekarang!</p>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Mulai Diskusi
          </button>
        </div>
      )}
    </div>
  );
}
