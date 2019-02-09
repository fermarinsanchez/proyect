const express = require('express');
const router = express.Router();
const experienceController = require('../controllers/experiences.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const uploadCloud = require('../configs/cloudinary.config.js');


router.get('/create',  authMiddleware.isAuthenticated, authMiddleware.userIsCreator, experienceController.create);
router.post('/create', authMiddleware.isAuthenticated, authMiddleware.userIsCreator, uploadCloud.array('photo'), experienceController.doCreate);

router.get('/:id', authMiddleware.userIsCreator, experienceController.get);
router.get('/:id/delete',  authMiddleware.isAuthenticated, authMiddleware.userIsCreator, experienceController.delete);

router.post('/:id/follow', authMiddleware.isAuthenticated, experienceController.follow);
router.post('/:id/unfollow', authMiddleware.isAuthenticated, experienceController.unFollow);

router.post('/:id/purchased', authMiddleware.isAuthenticated, experienceController.purchased);

router.get('/:id/comment', authMiddleware.isAuthenticated, experienceController.comment);
router.post('/:id/docomment', authMiddleware.isAuthenticated, experienceController.doComment);

module.exports = router;