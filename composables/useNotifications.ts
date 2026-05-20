import { useState } from '#app'

export interface NotificationData {
  id?: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  time: string;
}

export const useNotifications = () => {
  const notifications = useState<NotificationData[]>('global-notifications', () => [])

  const addNotification = (notif: Omit<NotificationData, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString()
    
    notifications.value = [...notifications.value, { ...notif, id }]

    setTimeout(() => {
      notifications.value = notifications.value.filter(n => n.id !== id)
    }, 4000)
  }

  return { notifications, addNotification }
}