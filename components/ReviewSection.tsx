import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { reviewService, Review } from '../services/reviewService';
import { Star, MessageSquare, Loader2, User as UserIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface ReviewSectionProps {
  toolId: string;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({ toolId }) => {
  const { user, openAuthModal } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadReviews = async () => {
      setIsLoading(true);
      const fetchedReviews = await reviewService.getToolReviews(toolId);
      setReviews(fetchedReviews);
      setIsLoading(false);
    };

    loadReviews();
  }, [toolId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }
    
    if (!text.trim()) return;

    setIsSubmitting(true);
    const newReview = await reviewService.addReview(
      toolId,
      user.id,
      user.name,
      user.avatar,
      rating,
      text
    );
    
    if (newReview) {
      setReviews([newReview, ...reviews]);
      setText('');
      setRating(5);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="mt-16 pt-16 border-t-4 border-dark-700">
      <div className="flex items-center gap-4 mb-8">
        <MessageSquare className="w-8 h-8 text-jenga-400" />
        <h2 className="text-4xl font-black text-surface-text tracking-widest uppercase">Community Reviews</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Write a Review */}
        <div className="lg:col-span-1">
          <div className="bg-dark-800 border-2 border-dark-600 p-6 shadow-[4px_4px_0px_0px_rgba(255,140,0,1)] rounded-none">
            <h3 className="text-xl font-black text-surface-text uppercase tracking-widest mb-6">Leave a Review</h3>
            
            {!user ? (
              <div className="text-center py-6">
                <p className="text-surface-muted font-mono mb-4">You must be logged in to leave a review.</p>
                <button 
                  onClick={openAuthModal}
                  className="bg-jenga-500 hover:bg-jenga-400 text-dark-950 font-black uppercase tracking-widest px-6 py-3 border-2 border-dark-950 transition-colors w-full rounded-none"
                >
                  Log In
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-surface-muted uppercase tracking-widest mb-2">Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`p-1 transition-colors ${rating >= star ? 'text-amber-500' : 'text-dark-600 hover:text-dark-500'}`}
                      >
                        <Star className={`w-8 h-8 ${rating >= star ? 'fill-current' : ''}`} />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-surface-muted uppercase tracking-widest mb-2">Your Thoughts</label>
                  <textarea 
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="How did this tool fit into your workflow?"
                    className="w-full bg-dark-900 border-2 border-dark-600 p-4 text-surface-text focus:outline-none focus:border-jenga-500 transition-colors font-mono min-h-[120px] rounded-none resize-y"
                    maxLength={2000}
                    required
                  />
                  <div className="text-right mt-1">
                    <span className="text-[10px] text-surface-muted font-mono">{text.length}/2000</span>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting || !text.trim()}
                  className="w-full bg-jenga-500 hover:bg-jenga-400 disabled:opacity-50 text-dark-950 font-black uppercase tracking-widest px-6 py-3 border-2 border-dark-950 transition-colors flex justify-center items-center rounded-none"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Review'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Review List */}
        <div className="lg:col-span-2 space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-jenga-500" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="bg-dark-800 border-2 border-dark-700 border-dashed p-12 text-center flex flex-col items-center justify-center rounded-none">
              <MessageSquare className="w-12 h-12 text-dark-600 mb-4" />
              <h3 className="text-xl font-black text-surface-text uppercase tracking-widest mb-2">No Reviews Yet</h3>
              <p className="text-surface-muted font-mono">Be the first to review this tool and help the community.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={review.id} 
                  className="bg-dark-800 border-2 border-dark-600 p-6 rounded-none"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-dark-700 border border-dark-500 overflow-hidden flex items-center justify-center flex-shrink-0">
                        {review.userAvatar ? (
                          <img src={review.userAvatar} alt={review.userName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <UserIcon className="w-5 h-5 text-surface-muted" />
                        )}
                      </div>
                      <div>
                        <p className="font-black text-surface-text tracking-widest uppercase text-sm">{review.userName}</p>
                        <p className="text-[10px] text-surface-muted font-mono uppercase">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(5)].map((_, index) => (
                        <Star key={index} className={`w-4 h-4 ${index < review.rating ? 'fill-current' : 'text-dark-600'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-surface-muted font-mono leading-relaxed whitespace-pre-wrap">{review.text}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
