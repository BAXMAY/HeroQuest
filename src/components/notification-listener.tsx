'use client';

import { useEffect, useState } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, where, doc, limit, orderBy } from 'firebase/firestore';
import type { Notification } from '@/app/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function NotificationListener() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [lastNotifiedId, setLastNotifiedId] = useState<string | null>(null);

  // Query for the most recent unread notification
  const notificationsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, 'users', user.uid, 'notifications'),
      where('read', '==', false),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
  }, [user, firestore]);

  const { data: notifications } = useCollection<Notification>(notificationsQuery);

  useEffect(() => {
    if (notifications && notifications.length > 0) {
      const latestNotif = notifications[0];
      // Only show a toast if it's a new notification we haven't seen in this session
      if (latestNotif.id !== lastNotifiedId) {
        toast({
          title: latestNotif.title,
          description: latestNotif.description,
        });
        setLastNotifiedId(latestNotif.id);
      }
    }
  }, [notifications, toast, lastNotifiedId]);

  return null; // This component doesn't render anything
}
