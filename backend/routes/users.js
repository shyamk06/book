const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  userPhotoUpload
} = require('../controllers/users');

router.use(protect);

// User profile
router.route('/me')
  .get(getUser) // Gets logged-in user's profile
  .put(updateUser); // Self-update

// Admin-only routes  
router.use(authorize('admin'));

router.route('/')
  .get(getUsers)
  .post(createUser)
  
router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser)

router.route('/:id/photo')
  .put(userPhotoUpload);

module.exports = router;