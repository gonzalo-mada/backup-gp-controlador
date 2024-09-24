'use strict';

let formatDateToSQL  = (isoDate) => {
    console.log("isoDAte",typeof isoDate, isoDate, isoDate.length);
    
    const [day, month, year] = isoDate.split('-');
    return `${year}-${month}-${day}`
    // const date = new Date(isoDate);
    
    // return date.toISOString().split('T')[0]; // Formato 'YYYY-MM-DD'
}

let normalizeSwitch = (value , type) => {    
    switch (type) {
        case 'acreditado':
            if (value == null) {
                return 'NO';
            }else{
                return value;
            }

        case 'certificado':
            if (value == null) {
                return 'NO';
            }else{
                return value;
            }

        case 'evaluacion':
            if (value == null) {
                return 'NO';
            }else{
                //llega un NO o SI
                return value;
            }

    }
}

const minDate = '1900-01-01';
const notAgencia = 'N/A'
module.exports = { formatDateToSQL, minDate, notAgencia, normalizeSwitch };