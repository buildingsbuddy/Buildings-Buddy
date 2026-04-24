import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Zap, ArrowRight, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useSubscription } from '@/lib/subscriptionContext';

export default function PaywallModal({ open, onClose }) {
  const navigate = useNavigate();
  const sub = useSubscription();
  const canStartTrial = sub.status === 'no_subscription';

  const handleStartTrial = async () => {
    await sub.startTrial('diy');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mb-2">
            <Lock className="w-7 h-7 text-accent" />
          </div>

          <DialogTitle className="text-center font-heading text-xl">
            Unlock Your Calculation
          </DialogTitle>

          <DialogDescription className="text-center">
            A subscription is required to generate material calculations, export PDFs,
            and save full estimating workflows.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-4">
          <div className="rounded-lg border bg-muted/30 p-3 text-sm">
            <p className="font-medium">DIY — £19.99/month</p>
            <p className="text-muted-foreground mt-1">
              Full calculator access, project saves, and PDF exports for one user.
            </p>
          </div>

          <div className="rounded-lg border bg-muted/30 p-3 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-accent" />
              <p className="font-medium">Company — £49/month</p>
            </div>
            <p className="text-muted-foreground mt-1">
              Built for teams, with up to 5 users included and shared workflow coming next.
            </p>
          </div>

          {canStartTrial && (
            <Button
              onClick={handleStartTrial}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
            >
              <Zap className="w-4 h-4 mr-2" />
              Start 7-Day Free Trial
            </Button>
          )}

          <Button
            onClick={() => {
              onClose();
              navigate('/billing');
            }}
            variant={canStartTrial ? 'outline' : 'default'}
            className={
              !canStartTrial
                ? 'w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold'
                : 'w-full'
            }
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            Upgrade Now
          </Button>

          <Button
            onClick={() => {
              onClose();
              navigate('/billing');
            }}
            variant="ghost"
            className="w-full text-muted-foreground"
          >
            View Plans
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}