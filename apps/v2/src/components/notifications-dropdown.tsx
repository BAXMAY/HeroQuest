import { useState } from "react";
import { Bell } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { listMyNotifications, markRead } from "@/server/fns/notifications";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@heroquest/ui";

/**
 * Bell icon + dropdown listing the last N notifications. Marks visible
 * unread items as read when the dropdown closes.
 */
export function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const notifs = useQuery({
    queryKey: ["notifications"],
    queryFn: () => listMyNotifications(),
    refetchInterval: 60_000,
  });
  const mark = useMutation({
    mutationFn: markRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const unread = notifs.data?.filter((n) => !n.isRead).length ?? 0;

  function onToggle() {
    const opening = !open;
    setOpen(opening);
    if (!opening && notifs.data) {
      const unreadIds = notifs.data.filter((n) => !n.isRead).map((n) => n.id);
      if (unreadIds.length > 0) mark.mutate({ data: { ids: unreadIds } });
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="relative rounded-full p-2 text-muted-foreground hover:bg-muted"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-flame px-1 text-xs font-bold text-flame-foreground">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>
      {open ? (
        <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
          <div className="border-b border-border p-3 text-sm font-bold">Notifications</div>
          <ul className="max-h-96 overflow-y-auto">
            {notifs.data && notifs.data.length > 0 ? (
              notifs.data.map((n) => (
                <li key={n.id} className={cn(n.isRead ? "opacity-60" : "bg-primary/5")}>
                  {n.link ? (
                    <Link
                      to={n.link}
                      onClick={() => setOpen(false)}
                      className="block px-3 py-2 hover:bg-muted"
                    >
                      <NotifContent n={n} />
                    </Link>
                  ) : (
                    <div className="px-3 py-2">
                      <NotifContent n={n} />
                    </div>
                  )}
                </li>
              ))
            ) : (
              <li className="p-4 text-center text-sm text-muted-foreground">
                No notifications yet
              </li>
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function NotifContent({ n }: { n: { title: string; body: string; createdAt: Date } }) {
  return (
    <div>
      <p className="text-sm font-semibold">{n.title}</p>
      <p className="text-xs text-muted-foreground">{n.body}</p>
      <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
      </p>
    </div>
  );
}
