'use strict';
var invoker = require('../../base/invokers/invoker.invoker');
var reply = require('../../base/utils/reply');
var validador = require('../../base/utils/validador');
const uuid = require("uuid");
const reportInvoker = require("../../base/invokers/report.invoker");
const { categorias_tp } = require("../services/categorias-tp.service.js")
const { getRandomColor, getTextColor, badgeColorMapping} = require("../utils/colors.js")

var tipos_programas = [
    {
        "Cod_tipoPrograma": 1,
        "Descripcion_tp" : "Doctorado",
        "Categoria" : {
            "Cod_CategoriaTP": 1,
            "Descripcion_categoria": "Postgrado"
        }
    },
    {
        "Cod_tipoPrograma": 2,
        "Descripcion_tp" : "Magister",
        "Categoria" : {
            "Cod_CategoriaTP": 1,
            "Descripcion_categoria": "Postgrado"
        }
    },
    {
        "Cod_tipoPrograma": 3,
        "Descripcion_tp" : "Diploma académicos",
        "Categoria" : {
            "Cod_CategoriaTP": 2,
            "Descripcion_categoria": "Postítulo"
        }
    },
    {
        "Cod_tipoPrograma": 4,
        "Descripcion_tp" : "Diplomados de extensión",
        "Categoria" : {
            "Cod_CategoriaTP": 2,
            "Descripcion_categoria": "Postítulo"
        }
    }
]

var tipos_programas_separated = [
    {
        "Cod_tipoPrograma": 1,
        "Descripcion_tp" : "Doctorado",
        "Cod_CategoriaTP": 1
    },
    {
        "Cod_tipoPrograma": 2,
        "Descripcion_tp" : "Magister",
        "Cod_CategoriaTP": 1
    },
    {
        "Cod_tipoPrograma": 3,
        "Descripcion_tp" : "Diploma académicos",
        "Cod_CategoriaTP": 2
    },
    {
        "Cod_tipoPrograma": 4,
        "Descripcion_tp" : "Diplomados de extensión",
        "Cod_CategoriaTP": 2
    }
]


const badgeClasses = [
    'p-badge-success',
    'p-badge-danger',
];

const getUniqueBadgeClass = (availableClasses) => {
    const randomIndex = Math.floor(Math.random() * availableClasses.length);
    const selectedClass = availableClasses[randomIndex];
    // Remove the selected class from the array
    availableClasses.splice(randomIndex, 1);
    return selectedClass;
};

let bruto_getTiposProgramas = async (req, res) => {

    //MODO CON DATA UNIDA
    // try {
    //     res.json(reply.ok(tipos_programas));
    // } catch (e) {
    //     res.json(reply.fatal(e));
    // }

    //MODO SIN DATA UNIDA
    try {
        const availableClasses = [...badgeClasses];
        const colorMapping = {};

        categorias_tp.forEach(categoria => {
            const randomColor = getRandomColor();
            if (!colorMapping[categoria.Cod_CategoriaTP]) {
                colorMapping[categoria.Cod_CategoriaTP] = badgeColorMapping[categoria.Cod_CategoriaTP] || { backgroundColor: randomColor, textColor: getTextColor(randomColor) };
            }
        });

        let tipos_programas = tipos_programas_separated.map( programa => {
            let categoria = categorias_tp.find( cat => cat.Cod_CategoriaTP === programa.Cod_CategoriaTP);
            return {
                "Cod_tipoPrograma": programa.Cod_tipoPrograma,
                "Descripcion_tp" : programa.Descripcion_tp,
                "Categoria": categoria ? {
                    "Cod_CategoriaTP": categoria.Cod_CategoriaTP,
                    "Descripcion_categoria": categoria.Descripcion_categoria,
                    "BadgeClass": colorMapping[categoria.Cod_CategoriaTP]
                } : null
            }
        })

        res.json(reply.ok(tipos_programas));
    } catch (e) {
        res.json(reply.fatal(e));
    }
}

let bruto_insertTipoPrograma = async (req, res) => {
    
	try {
		let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
		let msg = validador.validarParametro(args, "cadena", "Descripcion_tp", true);
		msg += validador.validarParametro(args, "number", "Cod_CategoriaTP", true);

		if (msg != "") {
            res.json(reply.error(msg));
            return;
        }

        let response = {};

        let ultimoObjeto = tipos_programas[tipos_programas.length - 1];
        let ultimoCodigo = ultimoObjeto.Cod_tipoPrograma;
        let codigoTipoPrograma = ultimoCodigo + 1; 

		let newTipoPrograma = { 
			Cod_tipoPrograma: codigoTipoPrograma,
			Descripcion_tp: args.Descripcion_tp,
			Cod_CategoriaTP: args.Cod_CategoriaTP,
		}

		//tipos_programas.push(newTipoPrograma);
		tipos_programas_separated.push(newTipoPrograma);

        
        response = { dataWasInserted: newTipoPrograma , dataInserted: args.Descripcion_tp}
		res.json(reply.ok(response));

	} catch (e) {
		res.json(reply.fatal(e));
	}
}

let bruto_updateTipoPrograma = async (req, res) => {
	try {
		let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
        let msg = validador.validarParametro(args, "number", "Cod_tipoPrograma", true);
		msg += validador.validarParametro(args, "cadena", "Descripcion_tp", true);
		msg += validador.validarParametro(args, "number", "Cod_CategoriaTP", true);

		if (msg != "") {
            res.json(reply.error(msg));
            return;
        }

        let response = {};

        let tipoProgramaToUpdate = tipos_programas_separated.find(c => c.Cod_tipoPrograma === args.Cod_tipoPrograma);

        if (!tipoProgramaToUpdate) {
            res.json(reply.error("Tipo de programa no encontrado"));
            return;
        }
        
        tipoProgramaToUpdate.Descripcion_tp = args.Descripcion_tp;
        tipoProgramaToUpdate.Cod_CategoriaTP = args.Cod_CategoriaTP;

        response = { dataWasUpdated: tipoProgramaToUpdate , dataUpdated: args.Descripcion_tp }

		res.json(reply.ok(response));

	} catch (e) {
		res.json(reply.fatal(e));
	}
}

let bruto_deleteTipoPrograma = async (req, res) => {
    try {
        let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
        let msg = validador.validarParametro(args, "lista", "tiposProgramasToDelete", true);

        if (msg != "") {
            res.json(reply.error(msg));
            return;
        }

        let tiposProgramaToDelete = args.tiposProgramasToDelete;
        
        for (let i = 0; i < tiposProgramaToDelete.length; i++) {
            const e = tiposProgramaToDelete[i];
            tipos_programas = tipos_programas.filter( tp => tp.Cod_tipoPrograma !== e.Cod_tipoPrograma)
        }

        let response = { dataWasDeleted: true , dataDeleted: tiposProgramaToDelete}
        res.json(reply.ok(response));

    } catch (e) {
        res.json(reply.fatal(e));
    }
}

let getTiposProgramas = async (req , res) => {
    try {
        const colorMapping = {};

        let tiposProgramas = await invoker(
            global.config.serv_basePostgrado,
            'tipoPrograma/getTipoPrograma',
            null
        );

        let categoriasTp = await invoker(
            global.config.serv_basePostgrado,
            'categoriaTipoPrograma/getCategoriaTipoPrograma',
            null
        );

        categoriasTp.forEach(categoria => {
            const randomColor = getRandomColor();
            if (!colorMapping[categoria.codigo]) {
                colorMapping[categoria.codigo] = badgeColorMapping[categoria.codigo] || { backgroundColor: randomColor, textColor: getTextColor(randomColor) };
            }
        });
        

        let listTiposProgramas = tiposProgramas.map( tipo => {
            let categoria = categoriasTp.find( categoria => categoria.codigo === tipo.codcategoria)
            return {
                "Cod_tipoPrograma": tipo.codigo,
                "Descripcion_tp" : tipo.descripcion,
                "Categoria": categoria ? {
                    "Cod_CategoriaTP": parseInt(categoria.codigo),
                    "Descripcion_categoria": categoria.descripcion,
                    "BadgeClass": colorMapping[categoria.codigo]
                } : null
            }
        })
        // tiposProgramas = tiposProgramas.map( e => {
        //     return {
        //         Cod_tipoPrograma : e.codigo,
        //         Descripcion_tp: e.descripcion,
        //         Cod_CategoriaTP: e.codcategoria
        //     }
        // })
        res.json(reply.ok(listTiposProgramas));
    } catch (e) {
        res.json(reply.fatal(e));
    }
}

let insertTipoPrograma = async (req, res) => {

    try {
        let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
        let msg = validador.validarParametro(args, "cadena", "Descripcion_tp", true);
        msg += validador.validarParametro(args, "number", "Cod_CategoriaTP", true);

        if (msg != "") {
            res.json(reply.error(msg));
            return;
        }

        let tiposProgramas = await invoker(
            global.config.serv_basePostgrado,
            'tipoPrograma/getTipoPrograma',
            null
        );

        let tiposProgramasExists = tiposProgramas.some(data => (String(data.descripcion).toLowerCase() === String(args.Descripcion_tp).toLowerCase()) );

        if (tiposProgramasExists) {
            res.json(reply.error(`El tipo de programa ${args.Descripcion_tp} ya existe.`));
            return;
        }

        let ultimoObjeto = tiposProgramas[tiposProgramas.length - 1];
        let ultimoCodigo = ultimoObjeto.codigo;
        let codigoTipoPrograma = ultimoCodigo + 1;

        let params = {
            codigoTp: parseInt(codigoTipoPrograma),
            descripcionTp: args.Descripcion_tp,
            codigoCategoriaTp: args.Cod_CategoriaTP
        }

        let insertTipoPrograma = await invoker(
            global.config.serv_basePostgrado,
            'tipoPrograma/insertTipoPrograma',
            params
        );

        if (!insertTipoPrograma){
            res.json(reply.error(`El tipo de programa no pudo ser creado.`));
            return;
        }

        let response = { dataWasInserted: insertTipoPrograma , dataInserted: args.Descripcion_tp}
        res.json(reply.ok(response));
    } catch (e) {
        res.json(reply.fatal(e));
    }
    
}

let updateTipoPrograma = async (req, res) => {
    try {
        let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
        let msg = validador.validarParametro(args, "number", "Cod_tipoPrograma", true);
		msg += validador.validarParametro(args, "cadena", "Descripcion_tp", true);
		msg += validador.validarParametro(args, "number", "Cod_CategoriaTP", true);

        if (msg != "") {
            res.json(reply.error(msg));
            return;
        }

        let tiposProgramas = await invoker(
            global.config.serv_basePostgrado,
            'tipoPrograma/getTipoPrograma',
            null
        );

        let tipoProgramaToUpdate = tiposProgramas.find(c => c.codigo === args.Cod_tipoPrograma);

        if (!tipoProgramaToUpdate) {
            res.json(reply.error("Tipo de programa no encontrado."));
            return;
        }

        let params = {
            codigoTp: args.Cod_tipoPrograma,
            descripcionTp: args.Descripcion_tp,
            codigoCategoriaTp: args.Cod_CategoriaTP
        }

        let updateTipoPrograma = await invoker(
            global.config.serv_basePostgrado,
            'tipoPrograma/updateTipoPrograma',
            params
        );

        if (!updateTipoPrograma){
            res.json(reply.error(`El tipo de programa no pudo ser actualizado.`));
            return;
        }

        let response = { dataWasUpdated: updateTipoPrograma, dataUpdated: args.Descripcion_tp }
        res.json(reply.ok(response));

    } catch (e) {
        res.json(reply.fatal(e));
    }
}

let deleteTipoPrograma = async (req , res) => {
    try {
        let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
        let msg = validador.validarParametro(args, "lista", "tiposProgramasToDelete", true);

        if (msg != "") {
            res.json(reply.error(msg));
            return;
        }

        let tiposProgramaToDelete = args.tiposProgramasToDelete;

        for (let i = 0; i < tiposProgramaToDelete.length; i++) {
            const e = tiposProgramaToDelete[i];

            let params = {
                codigoTp: parseInt(e.Cod_tipoPrograma),
            }

            let deleteTipoPrograma = await invoker(
                global.config.serv_basePostgrado,
                'tipoPrograma/deleteTipoPrograma',
                params
            );

            if (!deleteTipoPrograma){
                res.json(reply.error(`El tipo de programa no pudo ser eliminado.`));
                return;
            }
        }

        let response = { dataWasDeleted: true , dataDeleted: tiposProgramaToDelete}
        res.json(reply.ok(response));

    } catch (e) {
        res.json(reply.fatal(e));
    }
}

module.exports = {
    //bruto
    bruto_getTiposProgramas,
    bruto_insertTipoPrograma,
    bruto_updateTipoPrograma,
    bruto_deleteTipoPrograma,

    //logica
    getTiposProgramas,
    insertTipoPrograma,
    updateTipoPrograma,
    deleteTipoPrograma


}