'use strict';
var invoker = require('../../base/invokers/invoker.invoker');
var reply = require('../../base/utils/reply');

var campus = 
	[
		{
			"id": "1000",
			"estado": 1,
			"nombre": "Valparaíso"
		},
        {
			"id": "2000",
			"estado": 1,
			"nombre": "Santiago"
		},
        {
			"id": "3000",
			"estado": 1,
			"nombre": "San Felipe"
		},
        {
			"id": "4000",
			"estado": 0,
			"nombre": "Melipilla"
		}

	]



let getCampus = async (request, response) => {

    try {
        let transformedCampus = campus.map(c => ({
            ...c,
            estado: c.estado === 1 ? "Activo" : "Desactivo"
        }));
        response.json(reply.ok(transformedCampus));
    } catch (e) {
        response.json(reply.fatal(e));
    }

}

module.exports = {
    getCampus
}