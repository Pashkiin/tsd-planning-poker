const express = require('express');
const multer = require('multer');
const csvParser = require('csv-parser');
const fs = require('fs');
const { TaskModel } = require('../models/taskModel.js');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Nagłówki CSV, które są zawsze takie same
const headers = [
    'Typ zgłoszenia',
    'Podsumowanie',
    'Status',
    'Klucz zgłoszenia',
    'Id. zgłoszenia',
    'Pole niestandardowe (Story point estimate)',
    'Element nadrzędny',
    'Parent summary'
];

// POST /import-tasks - Import tasks from CSV
router.post('/import-tasks', upload.single('csvFile'), async (req, res) => {
    const { file } = req;
    if (!file) {
        return res.status(400).json({ error: 'CSV file is required' });
    }

    const tasks = {};  // Obiekt przechowujący główne zadania
    const subTasks = [];  // Tablica przechowująca subtaski

    fs.createReadStream(file.path)
        .pipe(csvParser({ headers, skipEmptyLines: true }))  // Używamy ręcznie ustawionych nagłówków
        .on('data', (row) => {
            console.log('Wczytany wiersz:', row);  // Logujemy każdy wiersz, żeby zobaczyć, jak wygląda
            const {
                'Typ zgłoszenia': issueType,
                'Podsumowanie': summary,
                'Status': status,
                'Klucz zgłoszenia': key,
                'Id. zgłoszenia': id,
                'Pole niestandardowe (Story point estimate)': storyPointEstimate,
                'Element nadrzędny': parentId,
                'Parent summary': parentSummary,
            } = row;

            const taskData = {
                id,
                name: summary,
                description: '',
                status: status ? status.toLowerCase() : "pending",
                estimations: {},
                averageEstimation: storyPointEstimate ? parseFloat(storyPointEstimate) : null,
                revealed: false,
                subTasks: []
            };

            if (issueType === 'Story') {
                // Tworzymy główne zadanie typu Story
                tasks[id] = new TaskModel(id, summary, '', []);
            } else if (issueType === 'Podzadanie') {
                // Tworzymy zadanie podrzędne
                subTasks.push({ ...taskData, parentId });
            }
        })
        .on('end', () => {
            console.log('Wczytane zadania:', tasks);  // Logujemy zadania po zakończeniu przetwarzania CSV
            subTasks.forEach((subTaskData) => {
                const parentTask = tasks[subTaskData.parentId];
                if (parentTask) {
                    // Tworzymy subtask i dodajemy go do odpowiedniego parentTask
                    const subTask = new TaskModel(
                        subTaskData.id,
                        subTaskData.name,
                        subTaskData.description
                    );
                    parentTask.addSubTask(subTask); // Dodajemy subtask do głównego zadania
                } else {
                    console.log(`Brak zadania nadrzędnego o ID: ${subTaskData.parentId}`);  // Wykonujemy logowanie, gdy parentId nie jest znaleziony
                }
                console.log('Wczytane zadania po SUBTASK:', tasks);
            });

            // Zwracamy zadania jako JSON
            res.json({ tasks: Object.values(tasks) });
        })
        .on('error', (error) => {
            console.error('Błąd przetwarzania CSV:', error);
            res.status(500).json({ error: 'Failed to process CSV file' });
        });
});

module.exports = router;
