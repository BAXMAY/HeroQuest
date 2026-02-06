'use client';

import { useAdmin, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, collectionGroup, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import type { UserProfile, Deed } from '@/app/lib/types';
import { Loader2, Users, CheckCircle, Award, BarChart3, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import CustomAvatar from '@/app/profile/custom-avatar';
import { useLanguage } from '@/app/context/language-context';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { format, subDays, startOfDay } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

export default function ExecutiveSummaryPage() {
    const firestore = useFirestore();
    const { t } = useLanguage();
    const { isAdmin, isLoading: isAdminLoading } = useAdmin();
    const router = useRouter();

    // Data fetching
    const usersQuery = useMemoFirebase(() => {
        if (!firestore || !isAdmin) return null;
        return collection(firestore, 'users');
    }, [firestore, isAdmin]);

    const allDeedsQuery = useMemoFirebase(() => {
        if (!firestore || !isAdmin) return null;
        return collectionGroup(firestore, 'volunteer_work');
    }, [firestore, isAdmin]);

    const recentApprovedDeedsQuery = useMemoFirebase(() => {
        if (!firestore || !isAdmin) return null;
        return query(
            collectionGroup(firestore, 'volunteer_work'),
            where('status', '==', 'approved'),
            orderBy('submittedAt', 'desc'),
            limit(5)
        );
    }, [firestore, isAdmin]);

    const { data: users, isLoading: isLoadingUsers } = useCollection<UserProfile>(usersQuery);
    const { data: allDeeds, isLoading: isLoadingDeeds } = useCollection<Deed>(allDeedsQuery);
    const { data: recentDeeds, isLoading: isLoadingRecentDeeds } = useCollection<Deed>(recentApprovedDeedsQuery);

    const isLoading = isAdminLoading || isLoadingUsers || isLoadingDeeds || isLoadingRecentDeeds;

    // Route protection
    useEffect(() => {
        if (!isAdminLoading && !isAdmin) {
            router.push('/dashboard');
        }
    }, [isAdmin, isAdminLoading, router]);

    // Data processing for charts and stats
    const { stats, chartData, topUsers } = useMemo(() => {
        if (!users || !allDeeds) {
            return { stats: {}, chartData: [], topUsers: [] };
        }

        const approvedDeeds = allDeeds.filter(d => d.status === 'approved');
        
        const stats = {
            totalUsers: users.filter(u => u.firstName !== 'Anonymous').length,
            totalQuests: allDeeds.length,
            approvedQuests: approvedDeeds.length,
            totalXp: approvedDeeds.reduce((sum, deed) => sum + (deed.points || 0), 0)
        };

        // Chart data for last 7 days
        const chartData = Array.from({ length: 7 }).map((_, i) => {
            const date = startOfDay(subDays(new Date(), i));
            return {
                date: format(date, 'MMM d'),
                fullDate: date,
                quests: 0,
            };
        }).reverse();

        approvedDeeds.forEach(deed => {
            if (!deed.submittedAt) return;
            const submittedAt = deed.submittedAt.toDate();
            if(submittedAt) {
                const day = chartData.find(d => d.fullDate.getTime() === startOfDay(submittedAt).getTime());
                if (day) {
                    day.quests++;
                }
            }
        });
        
        // Top 5 users by total points
        const topUsers = [...users]
            .filter(u => u.firstName !== 'Anonymous')
            .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))
            .slice(0, 5);


        return { stats, chartData, topUsers };

    }, [users, allDeeds]);
    

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                    <BarChart3 className="w-8 h-8 text-primary"/>
                    Executive Summary
                </h1>
                <p className="text-muted-foreground">A high-level overview of recent user activity.</p>
            </div>
            
            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalUsers || 0}</div>
                        <p className="text-xs text-muted-foreground">Total registered adventurers</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Approved Quests</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.approvedQuests || 0}</div>
                        <p className="text-xs text-muted-foreground">Out of {stats.totalQuests || 0} total submissions</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total XP Awarded</CardTitle>
                        <Award className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{(stats.totalXp || 0).toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">From all approved quests</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Top Adventurer</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{topUsers[0]?.firstName || 'N/A'}</div>
                        <p className="text-xs text-muted-foreground">with {(topUsers[0]?.totalPoints || 0).toLocaleString()} XP</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Quests per day chart */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Approved Quests (Last 7 Days)</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <ChartContainer config={{quests: {label: "Quests", color: "hsl(var(--chart-1))"}}} className="h-[250px] w-full">
                            <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                                <YAxis />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="quests" fill="var(--color-quests)" radius={4} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Top Users */}
                <Card>
                    <CardHeader>
                        <CardTitle>Top 5 Adventurers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topUsers.map((user, index) => (
                                <div key={user.id} className="flex items-center gap-4">
                                    <span className="font-bold text-muted-foreground">{index + 1}</span>
                                    <Avatar className="h-9 w-9">
                                         {user.avatarConfig ? (
                                            <CustomAvatar config={user.avatarConfig} />
                                         ) : (
                                            <>
                                                <AvatarImage src={user.profilePicture} />
                                                <AvatarFallback>{user.firstName?.charAt(0)}</AvatarFallback>
                                            </>
                                         )}
                                    </Avatar>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium leading-none">{user.firstName}</p>
                                        <p className="text-sm text-muted-foreground">{(user.totalPoints || 0).toLocaleString()} XP</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Quest Approvals</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Adventurer</TableHead>
                                <TableHead>Quest</TableHead>
                                <TableHead className="text-right">XP Awarded</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentDeeds?.map(deed => {
                                const user = users?.find(u => u.id === deed.userProfileId);
                                return (
                                <TableRow key={deed.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-8 w-8">
                                                {user?.avatarConfig ? <CustomAvatar config={user.avatarConfig}/> : <AvatarImage src={user?.profilePicture} />}
                                                <AvatarFallback>{user?.firstName?.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span>{user?.firstName || '...'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-xs truncate">{deed.description}</TableCell>
                                    <TableCell className="text-right font-medium text-primary">+{deed.points}</TableCell>
                                </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
