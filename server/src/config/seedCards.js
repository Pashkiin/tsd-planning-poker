const cards = [
    { value: 0, label: "0", description: "Brak pracy", isSpecial: false, color: "#E0E0E0" },
    { value: 1, label: "1", description: "Małe zadanie", isSpecial: false, color: "#A8E6CF" },
    { value: 2, label: "2", description: "Niewielki wysiłek", isSpecial: false, color: "#DCE775" },
    { value: 3, label: "3", description: "Średni wysiłek", isSpecial: false, color: "#FFD54F" },
    { value: 5, label: "5", description: "Zadanie typowe", isSpecial: false, color: "#FFB74D" },
    { value: 8, label: "8", description: "Złożone zadanie", isSpecial: false, color: "#FF8A65" },
    { value: 13, label: "13", description: "Duża niepewność", isSpecial: false, color: "#F06292" },
    { value: 20, label: "20", description: "Wysoki poziom trudności", isSpecial: false, color: "#BA68C8" },
    { value: 40, label: "40", description: "Ogromne zadanie", isSpecial: false, color: "#7986CB" },
    { value: 100, label: "100", description: "Niemożliwe do wykonania", isSpecial: false, color: "#4FC3F7" },
    { value: -1, label: "?", description: "Brak zdania", isSpecial: true, color: "#B0BEC5" },
    { value: 1000, label: "∞", description: "Zbyt duże", isSpecial: true, color: "#CFD8DC" }
];
module.exports = cards;