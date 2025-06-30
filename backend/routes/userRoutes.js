const express =  require( 'express')
const { registerUser,authUser,getAllUsers } =  require( '../controllers/userControllers.js');
const { protect } =  require( '../middleware/authMiddleware.js');


const router = express.Router()

router.post('/',registerUser)
router.post('/login',authUser)
router.get('/',protect,getAllUsers)


module.exports =  router;