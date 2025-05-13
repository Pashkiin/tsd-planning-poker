const fs = require('fs');
const path = require('path');
const request = require('supertest');
const app = require('../../app'); // upewnij się, że app.js eksportuje instancję aplikacji Express

const sampleTasks = [
    {
        id: '10014',
        name: 'As A developer I can see future',
        status: 'Do zrobienia',
        averageEstimation: 5.0,
        subTasks: [
            {
                id: '10018',
                name: 'Make time machine',
                status: 'Do zrobienia',
                averageEstimation: null
            }
        ]
    },
    {
        id: '10016',
        name: 'As A developer I can see Past',
        status: 'Do zrobienia',
        averageEstimation: 3.0,
        subTasks: []
    }
];

describe('POST /api/tasks/export-tasks', () => {
    it('should export tasks to CSV', async () => {
        const response = await request(app)
            .post('/api/tasks/export-tasks')
            .send(sampleTasks)
            .set('Content-Type', 'application/json');

        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toBe('text/csv; charset=utf-8');
        expect(response.headers['content-disposition']).toContain('tasks.csv');

        const csvContent = response.text;
        expect(csvContent).toContain('Typ zgłoszenia,Podsumowanie,Status,Klucz zgłoszenia,Id. zgłoszenia,Pole niestandardowe (Story point estimate),Element nadrzędny,Parent summary');
        expect(csvContent).toContain('Story,As A developer I can see future,Do zrobienia,,10014,5,,');
        expect(csvContent).toContain('Podzadanie,Make time machine,Do zrobienia,,10018,,10014,As A developer I can see future');
        expect(csvContent).toContain('Story,As A developer I can see Past,Do zrobienia,,10016,3,,');
    });
});

afterAll(async () => {
    // Ścieżka do pliku, który został zapisany
    const filePath = path.join(__dirname, '..', 'uploads', 'tasks.csv');

    // Sprawdzanie, czy plik istnieje przed usunięciem
    try {
        await fs.promises.access(filePath, fs.constants.F_OK);
        // Usuwanie pliku po zakończeniu testów
        await fs.promises.unlink(filePath);
        console.log('CSV file deleted successfully');
    } catch (err) {
        console.log('File does not exist or error deleting:', err);
    }
});
