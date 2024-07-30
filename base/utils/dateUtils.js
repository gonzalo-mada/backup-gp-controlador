"use strict";

let getDateToJSON = (fecha) => {
    let r = {
        date:
            "" +
            (fecha.getUTCDate() < 10
                ? "0" + fecha.getUTCDate()
                : fecha.getUTCDate()),
        month:
            "" +
            (fecha.getUTCMonth() + 1 < 10
                ? "0" + (fecha.getUTCMonth() + 1)
                : fecha.getUTCMonth() + 1),
        year: "" + fecha.getUTCFullYear(),
    };

    return r;
};

let getNumberToJSON = (fecha) => {
    let sFecha = "" + fecha;

    let r = {
        date: sFecha.substr(6, 2),
        month: sFecha.substr(4, 2),
        year: sFecha.substr(0, 4),
    };

    return r;
};

let getNumberToJSON_DMY = (fecha) => {
    let sFecha = "" + fecha;

    let r = {
        date: sFecha.substr(0, 2),
        month: sFecha.substr(2, 2),
        year: sFecha.substr(4, 4),
    };

    return r;
};

let parseJSONtoDate = (fechaJSON) => {
    return new Date(
        fechaJSON.year,
        fechaJSON.month - 1,
        fechaJSON.date,
        0,
        0,
        0,
        0
    );
};

let parseJSONtoNumber = (fechaJSON, formato) => {
    let fecha = "";

    if (formato == "DMY") {
        fecha =
            "" + fechaJSON.date + "" + fechaJSON.month + "" + fechaJSON.year;
    } else if (formato == "YMD") {
        fecha =
            "" + fechaJSON.year + "" + fechaJSON.month + "" + fechaJSON.date;
    }

    return fecha;
};

let parseDateToNumber = (fecha, formato) => {
    let fechaNumber = "";

    if (formato == "DMY") {
        fechaNumber +=
            fecha.getUTCDate() < 10
                ? "0" + fecha.getUTCDate()
                : fecha.getUTCDate();
        fechaNumber +=
            fecha.getUTCMonth() + 1 < 10
                ? "0" + (fecha.getUTCMonth() + 1)
                : fecha.getUTCMonth() + 1;
        fechaNumber += fecha.getUTCFullYear();
    } else if (formato == "YMD") {
        fechaNumber += fecha.getUTCFullYear();
        fechaNumber +=
            fecha.getUTCMonth() + 1 < 10
                ? "0" + (fecha.getUTCMonth() + 1)
                : fecha.getUTCMonth() + 1;
        fechaNumber +=
            fecha.getUTCDate() < 10
                ? "0" + fecha.getUTCDate()
                : fecha.getUTCDate();
    }

    return parseInt(fechaNumber);
};

let getFechaHoraFromDate = (fecha) => {
    let r = getDateToJSON(fecha);

    return (
        r.date +
        "/" +
        r.month +
        "/" +
        r.year +
        " " +
        (fecha.getUTCHours() < 10
            ? "0" + fecha.getUTCHours()
            : fecha.getUTCHours()) +
        ":" +
        (fecha.getUTCMinutes() < 10
            ? "0" + fecha.getUTCMinutes()
            : fecha.getUTCMinutes()) +
        ":" +
        (fecha.getUTCSeconds() < 10
            ? "0" + fecha.getUTCSeconds()
            : fecha.getUTCSeconds())
    );
};

module.exports = {
    getDateToJSON,
    getNumberToJSON,
    getNumberToJSON_DMY,
    parseJSONtoDate,
    parseJSONtoNumber,
    parseDateToNumber,
    getFechaHoraFromDate,
};
