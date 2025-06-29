const express = require('express')
const { protect } = require('../middleware/authMiddleware.js') ;
const {sendNotification,fetchAllNotifications,removeNotification} = require('../controllers/notificationControllers.js')
const router = express.Router()

router.post('/',protect,sendNotification)
router.get('/:userId',protect,fetchAllNotifications)
router.put('/removeNotification',protect,removeNotification)

module.exports=router