import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Zap, ArrowRight, Users, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useSubscription } from '@/lib/subscriptionContext';
import { toast } from 'sonner';

export default function PaywallModal({ open, onClose }) {
  const navigate = useNavigate();
  const sub = useSubscription();

  const [startingTrial, setStartingTrial] = useState(false);

  const canStartTrial = sub.canStartTrial || sub.status === 'no_subscription';
  const trialExpired = sub.status === 'expired_trial';
  const inactive = sub.status === 'inactive';

  const handleStartTrial = async () => {
    setStartingTrial(true);

    try {
      const result = await sub.startTrial('diy');

      if (!result?.success) {
        toast.error(result?.error || 'Could not start your trial.');
        return;
      }

      await sub.reload();

      toast.success(result.message || 'Your 7-day free trial has started.');

      setTimeout(() => {
        onClose();
      }, 300);
    } catch (error) {
      console.error('Start trial error:', error);
      toast.error('Could not start your trial.');
    } finally {
      setStartingTrial(false);
    }
  };

  const goToBilling = () => {
    onClose();
    navigate('/billing');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mb-2">
            <Lock className="w-7 h-7 text-accent" />
          </div>

          <DialogTitle className="text-center font-heading text-xl">
            {trialExpired
              ? 'Your Trial Has Ended'
              : inactive
              ? 'Subscription Required'
              : 'Unlock Your Calculation'}
          </DialogTitle>

          <DialogDescription className="text-center">
            {trialExpired
              ? 'Your free trial has expired. Choose a paid plan to continue using calculators, price estimates, PDF exports and project saves.'
              : 'Start your trial or choose a plan to generate material calculations, guide pricing, PDFs and project saves.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-4">
          {(trialExpired || inactive) && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive flex gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <p>Please upgrade to DIY or Company to continue using calculators.</p>
            </div>
          )}

          <div className="rounded-lg border bg-muted/30 p-3 text-sm">
            <p className="font-medium">DIY — £19.99/month</p>
            <p className="text-muted-foreground mt-1">
              Calculator access, project saves, guide material pricing and PDF exports for one user.
            </p>
          </div>

          <div className="rounded-lg border bg-muted/30 p-3 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-accent" />
              <p className="font-medium">Company — £49/month</p>
            </div>
            <p className="text-muted-foreground mt-1">
              Built for builders and teams, with up to 5 users, unlimited projects and company workflow.
            </p>
          </div>

          {canStartTrial && !trialExpired && !inactive && (
            <Button
              onClick={handleStartTrial}
              disabled={startingTrial}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
            >
              <Zap className="w-4 h-4 mr-2" />
              {startingTrial ? 'Starting Trial...' : 'Start 7-Day Free Trial'}
            </Button>
          )}

          <Button
            onClick={goToBilling}
            variant={canStartTrial && !trialExpired && !inactive ? 'outline' : 'default'}
            className={
              trialExpired || inactive
                ? 'w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold'
                : 'w-full'
            }
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            {trialExpired || inactive ? 'Upgrade Now' : 'View Plans'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}