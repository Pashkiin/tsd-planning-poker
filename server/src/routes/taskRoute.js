const express = require('express');
const taskImportController = require('../controllers/taskImportController');
const taskExportController = require('../controllers/taskExportController');

const router = express.Router();

/**
 * @route   POST /api/tasks/import-tasks
 * Request Body:
 * - Content-Type: multipart/form-data
 * - Fields:
 *   - file: The CSV file to import. It should contain the following columns:
 *     - Typ zgłoszenia (Story/Podzadanie)
 *     - Podsumowanie (Task summary)
 *     - Status (Status of the task, e.g., "Do zrobienia")
 *     - Klucz zgłoszenia (Optional key, e.g., T1-1)
 *     - Id. zgłoszenia (Task ID)
 *     - Pole niestandardowe (Story point estimate)
 *     - Element nadrzędny (Parent task ID for subtasks)
 *     - Parent summary (Parent task summary for subtasks)
 *
 * Response:
 * - 200: { message: "Tasks imported successfully", importedTasks: [Array of tasks] }
 * - 400: { error: "Invalid file format" }
 * - 500: { error: "Server error while importing tasks" }
 */
router.post('/import-tasks', taskImportController);

/**
 * @route   POST /api/tasks/export-tasks
 * Request Body:
 * - Content-Type: application/json
 * - Array of tasks with the following structure:
 *   [
 *     {
 *       id: string,
 *       name: string,
 *       status: string,
 *       averageEstimation: number,
 *       subTasks: [
 *         {
 *           id: string,
 *           name: string,
 *           status: string,
 *           averageEstimation: number
 *         }
 *       ]
 *     }
 *   ]
 *
 * Response:
 * - 200: CSV file as a downloadable attachment.
 * - 400: { error: "Invalid data format. Expected an array of tasks." }
 * - 500: { error: "Failed to generate CSV" }
 */
router.post('/export-tasks', taskExportController);

module.exports = router;
