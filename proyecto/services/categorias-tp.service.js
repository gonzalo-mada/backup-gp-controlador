'use strict';
var invoker = require('../../base/invokers/invoker.invoker');
var reply = require('../../base/utils/reply');
var validador = require('../../base/utils/validador');
const uuid = require("uuid");
const reportInvoker = require("../../base/invokers/report.invoker");

var categorias_tp = [
    {
        "Cod_CategoriaTP": 1,
        "Descripcion_categoria": "Postgrado"
    },
    {
        "Cod_CategoriaTP": 2,
        "Descripcion_categoria": "Postítulo"
    },
    {
        "Cod_CategoriaTP": 3,
        "Descripcion_categoria": "Especialidad médica"
    }
]


let bruto_getCategoriasTp = async (req, res) => {

    try {
        res.json(reply.ok(categorias_tp));
    } catch (e) {
        res.json(reply.fatal(e));
    }
}

let bruto_insertCategoriaTp = async (req, res) => {
    
	try {
		let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
		let msg = validador.validarParametro(args, "cadena", "Descripcion_categoria", true);

		if (msg != "") {
            res.json(reply.error(msg));
            return;
        }

        let dataExists = categorias_tp.some(c => (String(c.Descripcion_categoria).toLowerCase() === String(args.Descripcion_categoria).toLowerCase()) );
        if (dataExists) {
            res.json(reply.error(`La categoría de tipo de programa ${args.Descripcion_categoria} ya existe.`));
            return;
        }
        let response = {};

        let ultimoObjeto = categorias_tp[categorias_tp.length - 1];
        let ultimoCodigo = ultimoObjeto.Cod_CategoriaTP;
        let codigoCategoriaTP = ultimoCodigo + 1; 

		let newCategoriaTP = { 
			Cod_CategoriaTP: codigoCategoriaTP,
			Descripcion_categoria: args.Descripcion_categoria
		}

		categorias_tp.push(newCategoriaTP);
        
        response = { dataWasInserted: newCategoriaTP , dataInserted: args.Descripcion_categoria}
		res.json(reply.ok(response));

	} catch (e) {
		res.json(reply.fatal(e));
	}
}

let bruto_updateCategoriaTp = async (req, res) => {
	try {
		let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
        let msg = validador.validarParametro(args, "number", "Cod_CategoriaTP", true);
		msg += validador.validarParametro(args, "cadena", "Descripcion_categoria", true);

		if (msg != "") {
            res.json(reply.error(msg));
            return;
        }

        let response = {};

        let categoriaTpToUpdate = categorias_tp.find(c => c.Cod_CategoriaTP === args.Cod_CategoriaTP);

        if (!categoriaTpToUpdate) {
            res.json(reply.error("Categoría de tipo de programa no encontrada"));
            return;
        }
        
        categoriaTpToUpdate.Descripcion_categoria = args.Descripcion_categoria;

        response = { dataWasUpdated: categoriaTpToUpdate , dataUpdated: args.Descripcion_categoria }

		res.json(reply.ok(response));

	} catch (e) {
		res.json(reply.fatal(e));
	}
}

let bruto_deleteCategoriaTp = async (req, res) => {
    try {
        let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
        let msg = validador.validarParametro(args, "lista", "categoriasTpToDelete", true);

        if (msg != "") {
            res.json(reply.error(msg));
            return;
        }

        let categoriasTpToDelete = args.categoriasTpToDelete;
        
        for (let i = 0; i < categoriasTpToDelete.length; i++) {
            const e = categoriasTpToDelete[i];
            categorias_tp = categorias_tp.filter( tp => tp.Cod_CategoriaTP !== e.Cod_CategoriaTP)
        }

        let response = { dataWasDeleted: true , dataDeleted: categoriasTpToDelete}
        res.json(reply.ok(response));

    } catch (e) {
        res.json(reply.fatal(e));
    }
}

let getCategoriasTp = async (req, res) => {
    try {

        let categoriasTp = await invoker(
            global.config.serv_basePostgrado,
            'categoriaTipoPrograma/getCategoriaTipoPrograma',
            null
        );

        categoriasTp = categoriasTp.map( e => {
            return {
                Cod_CategoriaTP : e.codigo,
                Descripcion_categoria: e.descripcion
            }
        })
        res.json(reply.ok(categoriasTp));
    } catch (e) {
        res.json(reply.fatal(e));
    }
}

let insertCategoriaTp = async (req, res) => {
    try {
        let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
		let msg = validador.validarParametro(args, "cadena", "Descripcion_categoria", true);

        if (msg != "") {
            res.json(reply.error(msg));
            return;
        }

        let categoriasTp = await invoker(
            global.config.serv_basePostgrado,
            'categoriaTipoPrograma/getCategoriaTipoPrograma',
            null
        );

        let categoriasTpExists = categoriasTp.some(data => (String(data.descripcion).toLowerCase() === String(args.Descripcion_categoria).toLowerCase()) );

        if (categoriasTpExists) {
            res.json(reply.error(`La categoría de tipo de programa ${args.Descripcion_categoria} ya existe.`));
            return;
        }

        let ultimoObjeto = categoriasTp[categoriasTp.length - 1];
        let ultimoCodigo = ultimoObjeto.codigo;
        let codigoCategoriasTp = ultimoCodigo + 1;

        let params = {
            codigoCategoria: parseInt(codigoCategoriasTp),
            descripcionCategoria: args.Descripcion_categoria,
        }

        let insertCategoriasTp = await invoker(
            global.config.serv_basePostgrado,
            'categoriaTipoPrograma/insertCategoriaTipoPrograma',
            params
        );

        if (!insertCategoriasTp){
            res.json(reply.error(`La categoría de tipo de programa no pudo ser creada.`));
            return;
        }

        let response = { dataWasInserted: insertCategoriasTp , dataInserted: args.Descripcion_categoria}
        res.json(reply.ok(response));

    } catch (e) {
        res.json(reply.fatal(e));
    }
}

let updateCategoriaTp = async (req, res) => {
    try {
        let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
        let msg = validador.validarParametro(args, "number", "Cod_CategoriaTP", true);
		msg += validador.validarParametro(args, "cadena", "Descripcion_categoria", true);

        if (msg != "") {
            res.json(reply.error(msg));
            return;
        }

        let categoriasTp = await invoker(
            global.config.serv_basePostgrado,
            'categoriaTipoPrograma/getCategoriaTipoPrograma',
            null
        );

        let categoriaTpToUpdate = categoriasTp.find(c => c.codigo === args.Cod_CategoriaTP);

        if (!categoriaTpToUpdate) {
            res.json(reply.error("Categoría de tipo de programa no encontrada."));
            return;
        }

        let params = {
            codigoCategoria: args.Cod_CategoriaTP,
            descripcionCategoria: args.Descripcion_categoria
        }

        let updateCategoriaTp = await invoker(
            global.config.serv_basePostgrado,
            'categoriaTipoPrograma/updateCategoriaTipoPrograma',
            params
        );

        if (!updateCategoriaTp){
            res.json(reply.error(`La categoría de tipo de programa no pudo ser actualizada.`));
            return;
        }

        let response = { dataWasUpdated: updateCategoriaTp, dataUpdated: args.Descripcion_categoria }
        res.json(reply.ok(response));

    } catch (e) {
        res.json(reply.fatal(e));
    }
}

let deleteCategoriaTp = async (req, res) => {
    try {
        let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
        let msg = validador.validarParametro(args, "lista", "categoriasTpToDelete", true);

        if (msg != "") {
            res.json(reply.error(msg));
            return;
        }

        let categoriasTpToDelete = args.categoriasTpToDelete;

        for (let i = 0; i < categoriasTpToDelete.length; i++) {
            const e = categoriasTpToDelete[i];

            let params = {
                codigoCategoria: parseInt(e.Cod_CategoriaTP),
            }

            let deleteCategoriaTp = await invoker(
                global.config.serv_basePostgrado,
                'categoriaTipoPrograma/deleteCategoriaTipoPrograma',
                params
            );
            
            if (!deleteCategoriaTp){
                res.json(reply.error(`La categoría de tipo de programa no pudo ser eliminada.`));
                return;
            }
            
        }

        let response = { dataWasDeleted: true , dataDeleted: categoriasTpToDelete}
        res.json(reply.ok(response));

    } catch (e) {
        res.json(reply.fatal(e));
    }
}

module.exports = {
    //bruto
    categorias_tp,
    bruto_getCategoriasTp,
    bruto_insertCategoriaTp,
    bruto_updateCategoriaTp,
    bruto_deleteCategoriaTp,

    //logicas
    getCategoriasTp,
    insertCategoriaTp,
    updateCategoriaTp,
    deleteCategoriaTp





}