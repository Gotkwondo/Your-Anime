interface RatingDisplayProps {
  score: number;
}

export function RatingDisplay({ score }: RatingDisplayProps) {
  // Convert 10-point scale to 5 stars
  const stars = Math.round(score / 2);
  const fullStars = Math.floor(stars);
  const hasHalfStar = stars % 1 !== 0;

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => {
          if (i < fullStars) {
            return (
              <span key={i} className="text-yellow-500">
                ★
              </span>
            );
          } else if (i === fullStars && hasHalfStar) {
            return (
              <span key={i} className="text-yellow-500">
                ⯪
              </span>
            );
          } else {
            return (
              <span key={i} className="text-gray-300">
                ☆
              </span>
            );
          }
        })}
      </div>
      <span className="text-sm text-muted-foreground ml-1">{score}/10</span>
    </div>
  );
}
