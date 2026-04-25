import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle2,
  XCircle,
  Zap,
  Clock,
  AlertCircle,
  Crown,
  Users,
  UserPlus,
  Trash2,
  PoundSterling,
  FileText,
  Building2,
} from 'lucide-react';
import { useSubscription } from '@/lib/subscriptionContext';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const plans = [
  {
    id: 'diy',
    name: 'DIY Plan',
    description: 'For individuals, handymen, self-builds, and small local jobs.',
    monthlyPrice: 19.99,
    yearlyPrice: 199,
    tagline: 'Simple material estimating for everyday jobs.',
    features: [
      { text: 'All construction calculators', active: true },
      { text: 'Material quantity estimates', active: true },
      { text: 'UK guide material price estimates', active: true },
      { text: 'Export results to PDF', active: true },
      { text: 'Save up to 20 projects', active: true },
      { text: 'Project save / reopen / update', active: true },
      { text: 'Single user access', active: true },
      { text: 'Team access and shared workflow', active: false },
      { text: 'Advanced ordering insights', active: false },
    ],
  },
  {
    id: 'company',
    name: 'Company Plan',
    description: 'For builders, contractors, surveyors, and growing teams.',
    monthlyPrice: 49,
    yearlyPrice: 490,
    popular: true,
    tagline: 'Professional estimating workflow for real jobs.',
    features: [
      { text: 'Everything in DIY', active: true },
      { text: 'UK guide material price estimates', active: true },
      { text: 'Unlimited projects', active: true },
      { text: 'Up to 5 users included', active: true },
      { text: 'Team access and shared project workflow', active: true },
      { text: 'Advanced ordering insights', active: true },
      { text: 'Professional PDF outputs', active: true },
      { text: 'Priority support', active: true },
      { text: 'Future early-user price lock', active: true },
    ],
  },
];

function formatPrice(price) {
  return Number.isInteger(price) ? String(price) : price.toFixed(2);
}

export default function Billing() {
  const { user } = useAuth();
  const sub = useSubscription();
  const [searchParams] = useSearchParams();

  const [cycle, setCycle] = useState('monthly');
  const [processing, setProcessing] = useState(false);

  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  const team = sub.team;
  const isCompanyPlan = sub.plan === 'company';
  const canManageTeam = isCompanyPlan && sub.isTeamOwner && team?.id;

  useEffect(() => {
    const checkoutStatus = searchParams.get('checkout');

    if (checkoutStatus === 'success') {
      toast.success('Checkout complete. Your subscription will update shortly.');
      sub.reload();
    }

    if (checkoutStatus === 'cancelled') {
      toast.info('Checkout cancelled.');
    }
  }, []);

  const loadTeamData = async () => {
    if (!team?.id) return;

    setTeamLoading(true);

    try {
      const [membersResponse, invitesResponse] = await Promise.all([
        supabase
          .from('team_members')
          .select('id, user_id, role, status, invited_email, created_at')
          .eq('team_id', team.id)
          .neq('status', 'removed')
          .order('created_at', { ascending: true }),

        supabase
          .from('team_invites')
          .select('id, invited_email, role, status, created_at')
          .eq('team_id', team.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false }),
      ]);

      setMembers(membersResponse.error ? [] : membersResponse.data || []);
      setInvites(invitesResponse.error ? [] : invitesResponse.data || []);
    } catch (error) {
      console.error('Unexpected team load error:', error);
      setMembers([]);
      setInvites([]);
    } finally {
      setTeamLoading(false);
    }
  };

  useEffect(() => {
    if (team?.id) loadTeamData();
  }, [team?.id]);

  const activeSeatCount = members.filter((m) => m.status === 'active').length;
  const pendingSeatCount = invites.length;
  const totalReservedSeats = activeSeatCount + pendingSeatCount;
  const maxUsers = team?.max_users || 5;
  const seatsRemaining = Math.max(0, maxUsers - totalReservedSeats);

  const handleInviteMember = async () => {
    if (!team?.id || !user?.id || !inviteEmail.trim()) return;

    const cleanEmail = inviteEmail.trim().toLowerCase();

    if (totalReservedSeats >= maxUsers) {
      toast.error('No seats remaining on this company plan.');
      return;
    }

    setInviting(true);

    try {
      const { error } = await supabase.from('team_invites').insert({
        team_id: team.id,
        invited_email: cleanEmail,
        invited_by: user.id,
        role: 'member',
        status: 'pending',
      });

      if (error) {
        console.error('Failed to invite team member:', error);
        toast.error('Could not create invite. They may already be invited.');
        return;
      }

      setInviteEmail('');
      toast.success('Team invite created.');
      await loadTeamData();
    } catch (error) {
      console.error('Unexpected invite error:', error);
      toast.error('Could not create invite.');
    } finally {
      setInviting(false);
    }
  };

  const handleCancelInvite = async (inviteId) => {
    setRemovingId(inviteId);

    try {
      const { error } = await supabase
        .from('team_invites')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', inviteId)
        .eq('team_id', team.id);

      if (error) {
        console.error('Failed to cancel invite:', error);
        toast.error('Could not cancel invite.');
        return;
      }

      setInvites((prev) => prev.filter((invite) => invite.id !== inviteId));
      toast.success('Invite cancelled.');
    } catch (error) {
      console.error('Unexpected cancel invite error:', error);
      toast.error('Could not cancel invite.');
    } finally {
      setRemovingId(null);
    }
  };

  const handleRemoveMember = async (memberId, memberRole) => {
    if (memberRole === 'owner') {
      toast.error('The owner cannot be removed.');
      return;
    }

    setRemovingId(memberId);

    try {
      const { error } = await supabase
        .from('team_members')
        .update({ status: 'removed', updated_at: new Date().toISOString() })
        .eq('id', memberId)
        .eq('team_id', team.id);

      if (error) {
        console.error('Failed to remove member:', error);
        toast.error('Could not remove member.');
        return;
      }

      setMembers((prev) => prev.filter((member) => member.id !== memberId));
      toast.success('Member removed.');
    } catch (error) {
      console.error('Unexpected remove member error:', error);
      toast.error('Could not remove member.');
    } finally {
      setRemovingId(null);
    }
  };

  const handleStartTrial = async (planId) => {
    setProcessing(true);

    try {
      await sub.startTrial(planId);
      await sub.reload();
      toast.success('Your 7-day free trial has started.');
    } catch (error) {
      console.error(error);
      toast.error('Could not start free trial.');
    } finally {
      setProcessing(false);
    }
  };

  const handleCheckout = async (planId, billingCycle) => {
    setProcessing(true);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        toast.error('Please log in again before subscribing.');
        return;
      }

      const response = await fetch('/.netlify/functions/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          plan: planId,
          billingCycle,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Stripe checkout error:', data);
        toast.error(data.error || 'Could not start checkout.');
        return;
      }

      if (!data.url) {
        toast.error('Stripe checkout URL was not returned.');
        return;
      }

      window.location.href = data.url;
    } catch (error) {
      console.error('Unexpected checkout error:', error);
      toast.error('Could not start checkout.');
    } finally {
      setProcessing(false);
    }
  };

  const handleManageSubscription = async () => {
    setProcessing(true);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        toast.error('Please log in again before managing your subscription.');
        return;
      }

      const response = await fetch('/.netlify/functions/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Stripe portal error:', data);
        toast.error(data.error || 'Could not open billing portal.');
        return;
      }

      if (!data.url) {
        toast.error('Billing portal URL was not returned.');
        return;
      }

      window.location.href = data.url;
    } catch (error) {
      console.error('Unexpected billing portal error:', error);
      toast.error('Could not open billing portal.');
    } finally {
      setProcessing(false);
    }
  };

  const statusConfig = {
    trial: {
      color: 'bg-accent/10 text-accent',
      icon: Clock,
      label: `Free Trial — ${sub.trialDaysLeft} days left`,
    },
    active: {
      color: 'bg-green-50 text-green-700',
      icon: Zap,
      label: `Active — ${sub.plan?.toUpperCase()} ${sub.billingCycle || ''}`.trim(),
    },
    no_subscription: {
      color: 'bg-muted text-muted-foreground',
      icon: AlertCircle,
      label: 'No Active Subscription',
    },
    expired_trial: {
      color: 'bg-destructive/10 text-destructive',
      icon: AlertCircle,
      label: 'Trial Expired',
    },
    inactive: {
      color: 'bg-destructive/10 text-destructive',
      icon: AlertCircle,
      label: 'Subscription Inactive',
    },
    loading: {
      color: 'bg-muted text-muted-foreground',
      icon: Clock,
      label: 'Loading...',
    },
  };

  const sc = statusConfig[sub.status] || statusConfig.loading;
  const StatusIcon = sc.icon;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold">
          Billing & Subscription
        </h1>
        <p className="text-muted-foreground mt-1">
          Choose the plan that fits how you estimate, save and manage jobs.
        </p>
      </div>

      <Card>
        <CardContent className="p-5 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${sc.color}`}>
              <StatusIcon className="w-5 h-5" />
            </div>

            <div>
              <p className="font-heading font-semibold">{sc.label}</p>

              {sub.status === 'trial' && sub.trialEndDate && (
                <p className="text-xs text-muted-foreground">
                  Expires {new Date(sub.trialEndDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {sub.status === 'active' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleManageSubscription}
              disabled={processing}
            >
              {processing ? 'Opening...' : 'Manage Subscription'}
            </Button>
          )}
        </CardContent>
      </Card>

      {isCompanyPlan && team && (
        <Card className="border-accent/20">
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2">
              <Users className="w-5 h-5 text-accent" />
              Company Team
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Team</p>
                <p className="font-semibold">{team.name}</p>
              </div>

              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Your Role</p>
                <p className="font-semibold capitalize">{sub.teamRole || 'Member'}</p>
              </div>

              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Seats</p>
                <p className="font-semibold">
                  {totalReservedSeats} / {maxUsers} used
                </p>
              </div>
            </div>

            {canManageTeam ? (
              <>
                <div className="space-y-2">
                  <p className="font-medium">Invite Team Member</p>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />

                    <Button
                      onClick={handleInviteMember}
                      disabled={inviting || !inviteEmail.trim() || seatsRemaining <= 0}
                      className="bg-accent text-accent-foreground hover:bg-accent/90"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      {inviting ? 'Inviting...' : 'Invite'}
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {seatsRemaining} seat{seatsRemaining === 1 ? '' : 's'} remaining.
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="font-medium">Active Members</p>

                  {teamLoading ? (
                    <p className="text-sm text-muted-foreground">Loading team...</p>
                  ) : members.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No team members yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {members.map((member) => (
                        <div
                          key={member.id}
                          className="rounded-lg border p-3 flex items-center justify-between gap-3"
                        >
                          <div>
                            <p className="font-medium">
                              {member.invited_email || member.user_id}
                            </p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {member.role} · {member.status}
                            </p>
                          </div>

                          {member.role !== 'owner' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveMember(member.id, member.role)}
                              disabled={removingId === member.id}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {invites.length > 0 && (
                  <div className="space-y-3">
                    <p className="font-medium">Pending Invites</p>

                    <div className="space-y-2">
                      {invites.map((invite) => (
                        <div
                          key={invite.id}
                          className="rounded-lg border p-3 flex items-center justify-between gap-3"
                        >
                          <div>
                            <p className="font-medium">{invite.invited_email}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {invite.role} · {invite.status}
                            </p>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCancelInvite(invite.id)}
                            disabled={removingId === invite.id}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Team management is only available to the company owner.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="border-accent/20 bg-accent/5">
        <CardContent className="p-5 grid md:grid-cols-3 gap-4">
          <div className="flex gap-3">
            <PoundSterling className="w-5 h-5 text-accent mt-0.5" />
            <div>
              <p className="font-semibold">UK guide material pricing</p>
              <p className="text-sm text-muted-foreground">
                Material cost estimates included on both plans.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <FileText className="w-5 h-5 text-accent mt-0.5" />
            <div>
              <p className="font-semibold">PDF exports</p>
              <p className="text-sm text-muted-foreground">
                Export estimates for records, suppliers, or clients.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Building2 className="w-5 h-5 text-accent mt-0.5" />
            <div>
              <p className="font-semibold">Company workflow</p>
              <p className="text-sm text-muted-foreground">
                Unlimited projects, teams, and professional workflow.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-xl font-semibold">Choose Your Plan</h2>

          <Tabs value={cycle} onValueChange={setCycle}>
            <TabsList>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">
                Yearly
                <Badge className="ml-2 bg-accent/10 text-accent text-xs border-0">
                  Save
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {plans.map((plan) => {
            const price = cycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
            const isCurrentPlan =
              sub.plan === plan.id && (sub.status === 'active' || sub.status === 'trial');

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card
                  className={`relative overflow-hidden h-full ${
                    plan.popular ? 'border-accent shadow-lg' : ''
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0 px-3 py-1 bg-accent text-accent-foreground text-xs font-semibold rounded-bl-lg flex items-center gap-1">
                      <Crown className="w-3 h-3" /> Best for Businesses
                    </div>
                  )}

                  <CardHeader>
                    <CardTitle className="font-heading">
                      <span className="text-xl">{plan.name}</span>
                      <p className="text-sm font-normal text-muted-foreground mt-1">
                        {plan.description}
                      </p>
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-heading font-bold">
                          £{formatPrice(price)}
                        </span>
                        <span className="text-muted-foreground">
                          /{cycle === 'monthly' ? 'mo' : 'yr'}
                        </span>
                      </div>

                      <p className="text-sm text-muted-foreground mt-2">
                        {plan.tagline}
                      </p>
                    </div>

                    <ul className="space-y-3">
                      {plan.features.map((f, i) => (
                        <li
                          key={i}
                          className={`flex items-center gap-2 text-sm ${
                            !f.active ? 'text-muted-foreground' : ''
                          }`}
                        >
                          {f.active ? (
                            <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-muted-foreground shrink-0" />
                          )}
                          {f.text}
                        </li>
                      ))}
                    </ul>

                    {isCurrentPlan ? (
                      <Button disabled className="w-full" variant="outline">
                        Current Plan
                      </Button>
                    ) : sub.status === 'no_subscription' ? (
                      <Button
                        className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
                        onClick={() => handleStartTrial(plan.id)}
                        disabled={processing}
                      >
                        <Zap className="w-4 h-4 mr-2" /> Start 7-Day Free Trial
                      </Button>
                    ) : (
                      <Button
                        className={`w-full font-semibold ${
                          plan.popular
                            ? 'bg-accent text-accent-foreground hover:bg-accent/90'
                            : ''
                        }`}
                        variant={plan.popular ? 'default' : 'outline'}
                        onClick={() => handleCheckout(plan.id, cycle)}
                        disabled={processing}
                      >
                        {processing
                          ? 'Loading...'
                          : sub.status === 'trial'
                          ? 'Upgrade with Stripe'
                          : 'Subscribe with Stripe'}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          Material price estimates are guide values only. Labour, plant, delivery,
          waste removal, profit, overheads and VAT are not included.
        </p>
      </div>
    </div>
  );
}