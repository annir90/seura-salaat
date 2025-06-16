
export interface NotificationOptions {
  body: string;
  icon: string;
  tag: string;
  requireInteraction: boolean;
  badge: string;
  silent: boolean;
  actions: { action: string; title: string; }[];
  data: any;
  title: string;
}
