'use strict';
const badgeColorMapping = {
    1: { backgroundColor: '#003c58', textColor: 'white' },    // Para Cod_CategoriaTP = 1
    2: { backgroundColor: '#ffc107', textColor: 'black' },    // Para Cod_CategoriaTP = 2
    3: { backgroundColor: '#06717e', textColor: 'white' },    // Para Cod_CategoriaTP = 3
    4: { backgroundColor: '#28a745', textColor: 'white' },    // Para Cod_CategoriaTP = 4
    5: { backgroundColor: '#dc3545', textColor: 'white' },    // Para Cod_CategoriaTP = 5
    // Agrega más mapeos según sea necesario
};

let getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

let getLuminance = (hex) => {
    // Convert hex to RGB
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    // Apply the luminance formula
    const a = [r, g, b].map(val => {
        return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function getTextColor(backgroundColor) {
    return getLuminance(backgroundColor) > 0.5 ? 'black' : 'white';
}

module.exports = { getRandomColor, getTextColor, badgeColorMapping };