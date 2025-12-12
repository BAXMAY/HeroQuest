'use client';

import { useEffect } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import type { Notification } from '@/app/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function NotificationListener() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const notificationsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, 'users', user.uid, 'notifications'),
      where('read', '==', false)
    );
  }, [user, firestore]);

  const { data: notifications } = useCollection<Notification>(notificationsQuery);

  useEffect(() => {
    if (notifications && notifications.length > 0) {
      notifications.forEach((notif) => {
        // Show a toast for each unread notification
        toast({
          title: notif.title,
          description: notif.description,
        });

        // Mark the notification as read
        const notifRef = doc(firestore, 'users', user!.uid, 'notifications', notif.id);
        updateDocumentNonBlocking(notifRef, { read: true });
      });
    }
  }, [notifications, firestore, user, toast]);

  return null; // This component doesn't render anything
}
