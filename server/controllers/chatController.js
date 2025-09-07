const router = require('express').Router();
const authMiddleware = require('../middlewares/authMiddleware');
const Chat = require('./../models/chat');
const Message = require('./../models/message');

// Create a new chat
router.post('/create-new-chat', authMiddleware, async (req, res) => {
  try {
    if (!req.body || !req.body.members) {
      return res.status(400).send({
        success: false,
        message: 'Members are required to create a chat',
      });
    }

    const chat = new Chat(req.body);
    const savedChat = await chat.save();
    await savedChat.populate('members');

    res.status(201).send({
      message: 'Chat created successfully',
      success: true,
      data: savedChat,
    });
  } catch (error) {
    res.status(400).send({
      message: error.message,
      success: false,
    });
  }
});

// Get all chats for logged-in user
router.get('/get-all-chats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId; // ✅ comes from authMiddleware

    const allChats = await Chat.find({ members: { $in: [userId] } })
      .populate('members')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    res.status(200).send({
      message: 'Chats fetched successfully',
      success: true,
      data: allChats,
    });
  } catch (error) {
    res.status(400).send({
      message: error.message,
      success: false,
    });
  }
});

// Clear unread messages in a chat
router.post('/clear-unread-message', authMiddleware, async (req, res) => {
  try {
    const { chatId } = req.body;

    if (!chatId) {
      return res.status(400).send({
        success: false,
        message: 'Chat ID is required',
      });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.send({
        message: 'No Chat found with given chat ID.',
        success: false,
      });
    }

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { unreadMessageCount: 0 },
      { new: true }
    )
      .populate('members')
      .populate('lastMessage');

    await Message.updateMany(
      { chatId: chatId, read: false },
      { read: true }
    );

    res.send({
      message: 'Unread messages cleared successfully',
      success: true,
      data: updatedChat,
    });
  } catch (error) {
    res.send({
      message: error.message,
      success: false,
    });
  }
});

module.exports = router;
