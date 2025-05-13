const request = require('supertest');
const app = require('../../app'); // upewnij się, że app.js eksportuje instancję aplikacji Express
const fs = require('fs');
const path = require('path');

const sampleCsvContent = `
Typ zgłoszenia,Podsumowanie,Status,Klucz zgłoszenia,Id. zgłoszenia,Pole niestandardowe (Story point estimate),Element nadrzędny,Parent summary
Podzadanie,Make time machine,Do zrobienia,T1-3,10018,,10014,As A developer I can see future
Story,As A developer I can see Past,Do zrobienia,T1-2,10016,3.0,,
Story,As A developer I can see future,Do zrobienia,T1-1,10014,5.0,,
`;

const csvPath = path.join(__dirname, 'sample.csv');
fs.writeFileSync(csvPath, sampleCsvContent);

describe('POST /api/tasks/import-tasks', () => {
    it('should import tasks from CSV and return them as JSON', async () => {
        const response = await request(app)
            .post('/api/tasks/import-tasks')
            .attach('csvFile', csvPath);

        expect(response.status).toBe(200);
        expect(response.body.tasks).toBeDefined();
        expect(response.body.tasks.length).toBe(2); // Zmieniamy na 2, bo masz 2 główne zadania
        expect(response.body.tasks[0].name).toBe('As A developer I can see future'); // Dostosuj do swoich danych
        expect(response.body.tasks[0].subTasks.length).toBe(1); // Zmieniamy na 1, bo jest 1 subtask
        expect(response.body.tasks[0].subTasks[0].name).toBe('Make time machine'); // Oczekiwana nazwa subtasku
    });
});


afterAll(() => {
    fs.unlinkSync(csvPath);
});
