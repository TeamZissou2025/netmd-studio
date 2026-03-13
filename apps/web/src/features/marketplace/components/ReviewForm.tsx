import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@netmd-studio/ui';
import toast from 'react-hot-toast';

interface ReviewFormProps {
  onSubmit: (rating: number, comment: string) => Promise<{ error: string | null }>;
}

export function ReviewForm({ onSubmit }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    setSubmitting(true);
    const { error } = await onSubmit(rating, comment);
    if (error) {
      toast.error(error);
    } else {
      toast.success('Review submitted');
    }
    setSubmitting(false);
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-studio-text">Leave a review</h3>

      {/* Stars */}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(star)}
            className="p-0.5"
          >
            <Star
              size={20}
              className={
                star <= displayRating
                  ? 'fill-studio-warning text-studio-warning'
                  : 'text-studio-text-dim'
              }
            />
          </button>
        ))}
        {rating > 0 && (
          <span className="text-xs text-studio-text-muted ml-2">
            {rating === 1 ? 'Poor' : rating === 2 ? 'Fair' : rating === 3 ? 'Good' : rating === 4 ? 'Great' : 'Excellent'}
          </span>
        )}
      </div>

      {/* Comment */}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Optional comment about your experience..."
        rows={3}
        className="bg-studio-black border border-studio-border rounded-studio px-3 py-2 text-sm text-studio-text placeholder:text-studio-text-dim focus:border-studio-cyan focus:ring-1 focus:ring-studio-cyan-border outline-none resize-none"
      />

      <Button onClick={handleSubmit} disabled={rating === 0 || submitting}>
        {submitting ? 'Submitting...' : 'Submit Review'}
      </Button>
    </div>
  );
}

interface ReviewDisplayProps {
  rating: number;
  comment: string | null;
  reviewerName: string | null;
  createdAt: string;
}

export function ReviewDisplay({ rating, comment, reviewerName, createdAt }: ReviewDisplayProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={12}
              className={
                star <= rating
                  ? 'fill-studio-warning text-studio-warning'
                  : 'text-studio-text-dim'
              }
            />
          ))}
        </div>
        <span className="text-xs text-studio-text-muted">{reviewerName || 'User'}</span>
        <span className="text-2xs text-studio-text-dim">{new Date(createdAt).toLocaleDateString()}</span>
      </div>
      {comment && <p className="text-sm text-studio-text-muted">{comment}</p>}
    </div>
  );
}
