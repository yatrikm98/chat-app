const express = require('express')
const { protect } = require('../middleware/authMiddleware.js') ;
const {sendMessage,allMessagesForAParticularChat} = require('../controllers/messageControllers.js')
const router = express.Router()

router.post('/',protect,sendMessage)
router.get('/:chatId',protect,allMessagesForAParticularChat)


module.exports=router