const express = require('express') 
const { protect } = require('../middleware/authMiddleware.js') ;
const { accessChat,fetchChats,createGroupChat,renameGroup,addToGroup,removeFromGroup } = require('../controllers/chatControllers.js') ;
const router = express.Router()

router.post('/', protect, accessChat)
router.get('/',protect,fetchChats)


router.post('/group',protect,createGroupChat)
router.put('/rename',protect,renameGroup)
router.put('/groupremove',protect,removeFromGroup)
router.put('/groupadd',protect,addToGroup)


module.exports = router;
