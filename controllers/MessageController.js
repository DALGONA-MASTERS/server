// controllers/MessageController.js
const Message = require('../models/Message');
const { encrypt, decrypt } = require('../utils/crypto');
const { bucket } = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');

exports.sendMessage = async (req, res) => {
    const { receiverId, content } = req.body;
    const senderId = req.user.id;
    const audio = req.file;

    try {
        
        if (!content && !audio) {
            return res.status(400).json({ message: 'Either content or audio is required' });
        }

        let iv, encryptedData;

        if (content) {
            const encryptionResult = encrypt(content);
            iv = encryptionResult.iv;
            encryptedData = encryptionResult.encryptedData;
        }

        if (audio) {
            const blob = bucket.file(`audio/${uuidv4()}-${audio.originalname}`);
            const blobStream = blob.createWriteStream({
                metadata: {
                    contentType: audio.mimetype
                }
            });

            blobStream.on('error', (err) => {
                console.error('Error uploading to Firebase Storage:', err);
                res.status(500).json({ message: 'Failed to upload audio', error: err.message });
            });

            blobStream.on('finish', async () => {
                const audioUrl = await blob.getSignedUrl({
                    action: 'read',
                    expires: '03-01-2500'
                });

                const newMessage = new Message({
                    sender: senderId,
                    receiver: receiverId,
                    content: encryptedData,
                    audio: audioUrl[0],
                    iv: iv
                });

                await newMessage.save();

                res.status(200).json({messageId: newMessage._id });
            });

            blobStream.end(audio.buffer);
        } else {
            const newMessage = new Message({
                sender: senderId,
                receiver: receiverId,
                content: encryptedData,
                iv: iv
            });

            await newMessage.save();

            res.status(200).json({messageId: newMessage._id });
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to send message', error: error.message });
    }
};

exports.getMessages = async (req, res) => {
    const userId = req.user.id;
    const { otherUserId } = req.params;

    try {
        const messages = await Message.find({
            $or: [
                { sender: userId, receiver: otherUserId },
                { sender: otherUserId, receiver: userId }
            ]
        }).sort('timestamp');

        const decryptedMessages = messages.map(message => {
            if (message.content) {
                try {
                    return {
                        ...message._doc,
                        content: decrypt(message.content, message.iv)
                    };
                } catch (error) {
                    console.error('Failed to decrypt message content:', error.message);
                    return {
                        ...message._doc,
                        content: 'Failed to decrypt message content'
                    };
                }
            } else {
                return {
                    ...message._doc
                };
            }
        });

        res.status(200).json(decryptedMessages);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve messages', error: error.message });
    }
};