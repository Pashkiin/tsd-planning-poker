
const express = require('express');
const taskImportController = require('../controllers/taskImportController');
const taskExportController = require('../controllers/taskExportController');

const router = express.Router();

// Route for importing tasks from CSV
router.post('/import-tasks', taskImportController);
router.post('/export-tasks', taskExportController);


module.exports = router;
