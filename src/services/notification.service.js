const prisma = require('./prisma');

const notificationService = {
  /**
   * Send a notification to a user
   * @param {string} userId - The ID of the user to notify
   * @param {string} title - Notification title
   * @param {string} message - Notification message
   * @param {NotificationType} type - Type of notification
   * @param {object} options - Additional options
   * @param {string} options.relatedEntityType - Related entity type (e.g., 'Lease')
   * @param {string} options.relatedEntityId - Related entity ID
   * @returns {Promise<Notification>}
   */
  sendNotification: async (userId, title, message, type, options = {}) => {
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        relatedEntityType: options.relatedEntityType,
        relatedEntityId: options.relatedEntityId,
      },
    });

    // Here you could add real-time notification delivery via:
    // - WebSocket
    // - Email
    // - SMS
    // - Mobile push notification

    return notification;
  },

  /**
   * Get unread notifications for a user
   * @param {string} userId
   * @returns {Promise<Notification[]>}
   */
  getUnreadNotifications: async (userId) => {
    return prisma.notification.findMany({
      where: {
        userId,
        read: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  /**
   * Mark a notification as read
   * @param {string} notificationId
   * @returns {Promise<Notification>}
   */
  markAsRead: async (notificationId) => {
    return prisma.notification.update({
      where: { id: notificationId },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
  },

  /**
   * Create notifications for lease-related events
   * @param {string} leaseId
   * @param {string} message
   * @param {string} type
   */
  sendLeaseNotification: async (leaseId, message, type = 'Lease') => {
    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      include: { tenant: true },
    });

    if (!lease) throw new Error('Lease not found');

    return notificationService.sendNotification(
      lease.tenantId,
      'Lease Update',
      message,
      type,
      {
        relatedEntityType: 'Lease',
        relatedEntityId: leaseId,
      },
    );
  },

  /**
   * Create notifications for maintenance request events
   * @param {string} requestId
   * @param {string} message
   * @param {string} userId - Optional user to notify (defaults to assigned user)
   */
  sendMaintenanceNotification: async (requestId, message, userId = null) => {
    const request = await prisma.maintenanceRequest.findUnique({
      where: { id: requestId },
      include: { assignedTo: true, reportedBy: true },
    });

    if (!request) throw new Error('Maintenance request not found');

    const targetUserId = userId || request.assignedToId || request.reportedById;
    if (!targetUserId) throw new Error('No user to notify');

    return notificationService.sendNotification(
      targetUserId,
      'Maintenance Update',
      message,
      'Maintenance',
      {
        relatedEntityType: 'MaintenanceRequest',
        relatedEntityId: requestId,
      },
    );
  },
};

module.exports = notificationService;
