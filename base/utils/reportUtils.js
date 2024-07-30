'use strict';

const queryParams = {
    _flowId: 'viewReportFlow',
    standAlone: 'true',
    ParentFolderUri: null,
    reportUnit: null,
    output: null,
    j_username: 'guest',
    j_password: 'guest',
};


let _concatenaUrl = (data) => {
    let urlReport = '';

    for (let key in data) {
        urlReport+= `${key}=${data[key]}&`;
    }

    return urlReport.substring(0, urlReport.length - 1);
};


module.exports = (serverJasper, ParentFolderUri, reportUnit, formato, params) => {
    let output = Object.assign({}, queryParams);
    output.ParentFolderUri = ParentFolderUri;
    output.reportUnit = reportUnit;
    output.output = formato;

    for (let key in params) {
        output[key] = params[key];
    }

    return serverJasper + _concatenaUrl(output);
};
