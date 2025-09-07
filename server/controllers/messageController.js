const route = require('express').Router();
const authMiddleware = require('./../middlewares/authMiddleware');
const Chat = require('./../models/chat');
const Message = require('./../models/message');

// Send a new message
route.post('/new-message', authMiddleware, async (req, res) => {
  try {
    const { chatId, text } = req.body;

    if (!chatId || !text) {
      return res.status(400).send({
        success: false,
        message: 'Chat ID and message text are required',
      });
    }

    // Attach senderId from token
    const newMessage = new Message({
      chatId,
      text,
      sender: req.user.userId, // ✅ comes from authMiddleware
    });

    const savedMessage = await newMessage.save();

    // Update lastMessage in chat collection
    const currentChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        lastMessage: savedMessage._id,
        $inc: { unreadMessageCount: 1 },
      },
      { new: true }
    );

    if (!currentChat) {
      return res.status(404).send({
        success: false,
        message: 'Chat not found',
      });
    }

    res.status(201).send({
      message: 'Message sent successfully',
      success: true,
      data: savedMessage,
    });
  } catch (error) {
    res.status(400).send({
      message: error.message,
      success: false,
    });
  }
});

// Get all messages for a chat
route.get('/get-all-messages/:chatId', authMiddleware, async (req, res) => {
  try {
    const { chatId } = req.params;

    if (!chatId) {
      return res.status(400).send({
        success: false,
        message: 'Chat ID is required',
      });
    }

    const allMessages = await Message.find({ chatId }).sort({ createdAt: 1 });

    res.send({
      message: 'Messages fetched successfully',
      success: true,
      data: allMessages,
    });
  } catch (error) {
    res.status(400).send({
      message: error.message,
      success: false,
    });
  }
});

module.exports = route;
