import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { useSubscription } from '@/lib/subscriptionContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Users, Trash2, UserPlus, Mail, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function Team() {
  const { user } = useAuth();
  const sub = useSubscription();

  const team = sub.team;
  const isOwner = sub.isTeamOwner;

  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  const maxUsers = team?.max_users || 5;

  const activeMembers = members.filter((member) => member.status === 'active');
  const pendingInvites = invites.filter((invite) => invite.status === 'pending');

  const seatsUsed = activeMembers.length + pendingInvites.length;
  const seatsRemaining = Math.max(0, maxUsers - seatsUsed);

  const loadTeamData = async () => {
    if (!team?.id) {
      setMembers([]);
      setInvites([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const [membersResponse, invitesResponse] = await Promise.all([
        supabase
          .from('team_members')
          .select('id, team_id, user_id, role, status, invited_email, created_at')
          .eq('team_id', team.id)
          .neq('status', 'removed')
          .order('created_at', { ascending: true }),

        supabase
          .from('team_invites')
          .select('id, team_id, invited_email, role, status, created_at')
          .eq('team_id', team.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false }),
      ]);

      if (membersResponse.error) {
        console.error('Failed to load team members:', membersResponse.error);
        setMembers([]);
      } else {
        setMembers(membersResponse.data || []);
      }

      if (invitesResponse.error) {
        console.error('Failed to load team invites:', invitesResponse.error);
        setInvites([]);
      } else {
        setInvites(invitesResponse.data || []);
      }
    } catch (error) {
      console.error('Unexpected team load error:', error);
      setMembers([]);
      setInvites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeamData();
  }, [team?.id]);

  const handleInviteMember = async () => {
    if (!team?.id || !user?.id || !inviteEmail.trim()) return;

    const cleanEmail = inviteEmail.trim().toLowerCase();

    if (cleanEmail === user.email?.toLowerCase()) {
      toast.error('You cannot invite yourself.');
      return;
    }

    if (seatsRemaining <= 0) {
      toast.error('No seats remaining on this company plan.');
      return;
    }

    const alreadyMember = members.some(
      (member) =>
        member.status === 'active' &&
        member.invited_email?.toLowerCase() === cleanEmail
    );

    const alreadyInvited = invites.some(
      (invite) =>
        invite.status === 'pending' &&
        invite.invited_email?.toLowerCase() === cleanEmail
    );

    if (alreadyMember) {
      toast.error('This user is already a team member.');
      return;
    }

    if (alreadyInvited) {
      toast.error('This email already has a pending invite.');
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
        toast.error('Could not create invite.');
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
    if (!team?.id || !inviteId) return;

    setRemovingId(inviteId);

    try {
      const { error } = await supabase
        .from('team_invites')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
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

  const handleRemoveMember = async (member) => {
    if (!team?.id || !member?.id) return;

    if (member.role === 'owner') {
      toast.error('The owner cannot be removed.');
      return;
    }

    setRemovingId(member.id);

    try {
      const { error } = await supabase
        .from('team_members')
        .update({
          status: 'removed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', member.id)
        .eq('team_id', team.id);

      if (error) {
        console.error('Failed to remove member:', error);
        toast.error('Could not remove member.');
        return;
      }

      setMembers((prev) => prev.filter((item) => item.id !== member.id));
      toast.success('Member removed.');
    } catch (error) {
      console.error('Unexpected remove member error:', error);
      toast.error('Could not remove member.');
    } finally {
      setRemovingId(null);
    }
  };

  if (!team) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold">Team</h1>
          <p className="text-muted-foreground mt-1">
            Manage your company team.
          </p>
        </div>

        <Card>
          <CardContent className="py-16 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="font-heading font-semibold text-lg mb-1">
              No company team found
            </p>
            <p className="text-sm text-muted-foreground">
              Upgrade to the Company plan to create and manage a team.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold">Team</h1>
        <p className="text-muted-foreground mt-1">
          Manage your company members and seats.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground mb-1">Company</p>
            <p className="font-heading font-semibold">{team.name}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground mb-1">Your Role</p>
            <Badge variant="secondary" className="capitalize">
              {sub.teamRole || 'member'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground mb-1">Seats</p>
            <p className="font-heading font-semibold">
              {seatsUsed} / {maxUsers} used
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {seatsRemaining} remaining
            </p>
          </CardContent>
        </Card>
      </div>

      {isOwner ? (
        <Card className="border-accent/20">
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-accent" />
              Invite Team Member
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                type="email"
                placeholder="team.member@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                disabled={seatsRemaining <= 0}
              />

              <Button
                onClick={handleInviteMember}
                disabled={inviting || !inviteEmail.trim() || seatsRemaining <= 0}
                className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                {inviting ? 'Inviting...' : 'Invite'}
              </Button>
            </div>

            {seatsRemaining <= 0 ? (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
                <p className="text-sm text-destructive">
                  You have used all {maxUsers} included seats on this company plan.
                </p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Invites reserve a seat until they are accepted or cancelled.
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">
              Only the company owner can invite or remove team members.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="font-heading flex items-center gap-2">
            <Users className="w-5 h-5 text-accent" />
            Active Members
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading team...</p>
          ) : activeMembers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active members yet.</p>
          ) : (
            activeMembers.map((member) => (
              <div
                key={member.id}
                className="rounded-lg border p-3 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="font-medium truncate">
                    {member.invited_email || member.user_id}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {member.role} · {member.status}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className="capitalize">
                    {member.role}
                  </Badge>

                  {isOwner && member.role !== 'owner' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveMember(member)}
                      disabled={removingId === member.id}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading flex items-center gap-2">
            <Mail className="w-5 h-5 text-accent" />
            Pending Invites
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading invites...</p>
          ) : pendingInvites.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending invites.</p>
          ) : (
            pendingInvites.map((invite) => (
              <div
                key={invite.id}
                className="rounded-lg border p-3 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="font-medium truncate">{invite.invited_email}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {invite.role} · {invite.status}
                  </p>
                </div>

                {isOwner && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCancelInvite(invite.id)}
                    disabled={removingId === invite.id}
                    className="text-muted-foreground hover:text-destructive shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}