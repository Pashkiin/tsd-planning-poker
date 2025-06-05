const express = require('express');
const router = express.Router();

// POST /export-csv - Export tasks to CSV
router.post('/export-tasks', (req, res) => {
    const tasks = req.body;
    if (!Array.isArray(tasks)) {
        return res.status(400).json({ error: 'Invalid data format. Expected an array of tasks.' });
    }

    const csvData = [];
    const header = [
        'Typ zgłoszenia',
        'Podsumowanie',
        'Status',
        'Klucz zgłoszenia',
        'Id. zgłoszenia',
        'Pole niestandardowe (Story point estimate)',
        'Element nadrzędny',
        'Parent summary'
    ];

    // Add header to CSV data
    csvData.push(header.join(','));

    tasks.forEach((task) => {
        // Main task (Story)
        csvData.push([
            'Story',
            task.name,
            task.status || 'Do zrobienia',
            '', // Klucz zgłoszenia
            task.id,
            task.averageEstimation || '',
            '', // Element nadrzędny
            ''  // Parent summary
        ].join(','));

        // Subtasks (Podzadanie)
        task.subTasks.forEach((subTask) => {
            csvData.push([
                'Podzadanie',
                subTask.name,
                subTask.status || 'Do zrobienia',
                '', // Klucz zgłoszenia
                subTask.id,
                subTask.averageEstimation || '',
                task.id,
                task.name
            ].join(','));
        });
    });

    try {
        const csv = csvData.join('\n'); // Join all rows with newline
        res.header('Content-Type', 'text/csv');
        res.attachment('tasks.csv');
        res.send(csv);
    } catch (error) {
        console.error('Error generating CSV:', error);
        res.status(500).json({ error: 'Failed to generate CSV' });
    }
});

module.exports = router;
