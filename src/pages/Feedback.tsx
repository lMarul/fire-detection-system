import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { mockFeedback } from '@/data/mockData';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Mail, User, Calendar } from 'lucide-react';

const Feedback = () => {
  const [feedbackList] = useState(mockFeedback);

  const getRatingColor = (rating: number) => {
    if (rating >= 5) return 'text-success';
    if (rating >= 4) return 'text-primary';
    if (rating >= 3) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Citizen Feedback</h1>
          <p className="text-muted-foreground">
            Review feedback and suggestions from citizens about the FireBot system
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Feedback</p>
            <p className="text-2xl font-bold">{feedbackList.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Average Rating</p>
            <p className="text-2xl font-bold">
              {(feedbackList.reduce((acc, fb) => acc + fb.rating, 0) / feedbackList.length).toFixed(1)}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">5-Star Reviews</p>
            <p className="text-2xl font-bold text-success">
              {feedbackList.filter(fb => fb.rating === 5).length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">This Month</p>
            <p className="text-2xl font-bold">{feedbackList.length}</p>
          </Card>
        </div>

        {/* Feedback List */}
        <div className="space-y-4">
          {feedbackList.map((feedback) => (
            <Card key={feedback.id} className="p-6 hover:bg-secondary/50 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{feedback.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {feedback.email}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < feedback.rating
                            ? `${getRatingColor(feedback.rating)} fill-current`
                            : 'text-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <Badge variant="secondary">{feedback.rating}/5</Badge>
                </div>
              </div>

              <p className="text-foreground mb-3 leading-relaxed">
                {feedback.message}
              </p>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{feedback.timestamp}</span>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Feedback;
