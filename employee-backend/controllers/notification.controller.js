import Notification from "../models/Notification.model.js";

export const getNotifications = async (req, res) => {
  try {
    // In a real app, filter by req.user.id
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(20);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

export const createNotification = async (req, res) => {
  try {
    const { employeeName, message, hrId } = req.body;
    const notification = await Notification.create({
      hrId,
      employeeName,
      message,
      type: 'response'
    });
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: "Failed to create notification" });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { read: true });
    res.json({ message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update notification" });
  }
};
