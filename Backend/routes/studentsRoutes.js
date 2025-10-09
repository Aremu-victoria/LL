const express = require('express');

const router = express.Router();
const studentsController = require('../controller/studentsController');
const suggestionController = require('../controller/suggestionController');
const discussionController = require('../controller/discussionController');

// Download material file by publicId
router.get('/materials/download/:publicId', studentsController.downloadMaterialFile);
// Suggestions
router.post('/suggestions', suggestionController.createSuggestion);
router.get('/suggestions', suggestionController.listSuggestions);

// Discussions
router.post('/discussions', discussionController.createDiscussion);
router.get('/discussions', discussionController.listDiscussions);
router.post('/discussions/:id/replies', discussionController.addReply);

// File upload dependencies
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Cloudinary upload endpoint
router.post('/materials/upload', upload.single('file'), studentsController.uploadMaterialFile);


router.post('/signup', studentsController.signup);
router.post('/signin', studentsController.signin);
router.post('/forgot-password', studentsController.requestPasswordReset);
router.post('/reset-password/:token', studentsController.resetPassword);
router.post('/superadmin/invite-staff', studentsController.inviteStaff);
// Dev-only superadmin fix
router.post('/dev/ensure-superadmin', studentsController.devEnsureSuperAdmin);

// Admin/student management
router.get('/students', studentsController.listStudents);
router.put('/students/:id', studentsController.updateStudent);
router.delete('/students/:id', studentsController.deleteStudent);
router.patch('/students/:id/archive', studentsController.archiveStudent);

// Staff (superadmin only) - NOTE: add auth/role middleware later
router.delete('/staff/:id', studentsController.deleteStaff);

// Courses
router.get('/courses', studentsController.listCourses);
router.delete('/courses/:id', studentsController.deleteCourse);

// Materials
router.post('/materials', studentsController.createMaterial);
router.get('/materials', studentsController.listMaterials);
router.delete('/materials/:id', studentsController.deleteMaterial);
router.post('/materials/:id/reviews', studentsController.addMaterialReview);

module.exports = router;
