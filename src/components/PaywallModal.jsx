import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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
            You can view and set up your project, but a subscription is required to generate material calculations.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-4">
          {canStartTrial && (
            <Button onClick={handleStartTrial} className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold">
              <Zap className="w-4 h-4 mr-2" />
              Start 5-Day Free Trial
            </Button>
          )}
          <Button
            onClick={() => { onClose(); navigate('/billing'); }}
            variant={canStartTrial ? "outline" : "default"}
            className={!canStartTrial ? "w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold" : "w-full"}
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            Upgrade Now
          </Button>
          <Button
            onClick={() => { onClose(); navigate('/billing'); }}
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