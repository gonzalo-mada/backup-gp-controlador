'use strict'
var sql = require('mssql');
var reply = require('../../base/utils/reply');
var validador = require('../../base/utils/validador');


let getCategoriasTp = async (request, response) => {
    try {
        let con = await sql.connect(global.config.ds_postgrado);

        let result = await con.request()
            .execute('TR_LISTAR_CATEGORIAS_TP');
        con.close();

        let listCategoriasTp = result[0].map((a) => {
            return {
                codigo: a.Cod_CategoriaTP,
                descripcion: a.Descripcion_categoria.trim(),
            }
        }) || [];

        response.json(reply.ok(listCategoriasTp));

    } catch (e) {
        response.json(reply.fatal(e));
    }
}

let insertCategoriasTp = async (request, response) => {
    try {
        let args = JSON.parse(request.body.arg === undefined ? '{}' : request.body.arg);
        let msg = validador.validarParametro(args, 'numero', 'codigoCategoriaTp', true);
        msg += validador.validarParametro(args, 'cadena', 'descripcionCategoriaTp', true);

        if (msg == '') {
            let con = await sql.connect(global.config.ds_postgrado);

            let result = await con.request()
                .input('COD_CATEGORIATP', sql.Int, args.codigoCategoriaTp)
                .input('DESCRIPCION_CATEGORIA', sql.VarChar, args.descripcionCategoriaTp)
                .execute('SP_AGREGAR_CATEGORIAS_TP');
            con.close();
            response.json(reply.ok(true));
        } else {
            response.json(reply.error(msg));
        }
    } catch (e) {
        response.json(reply.fatal(e));
    }
}

let updateCategoriasTp = async (request, response) => {
    try {
        let args = JSON.parse(request.body.arg === undefined ? '{}' : request.body.arg);
        let msg = validador.validarParametro(args, 'numero', 'codigoCategoriaTp', true);
        msg += validador.validarParametro(args, 'cadena', 'descripcionCategoriaTp', true);

        if (msg == '') {
            let con = await sql.connect(global.config.ds_postgrado);

            let result = await con.request()
                .input('COD_CATEGORIATP', sql.Int, args.codigoCategoriaTp)
                .input('DESCRIPCION_CATEGORIA', sql.VarChar, args.descripcionCategoriaTp)
                .execute('SP_ACTUALIZAR_CATEGORIA_TP');
            con.close();
            response.json(reply.ok(true));
        } else {
            response.json(reply.error(msg));
        }
        
    } catch (e) {
        response.json(reply.fatal(e));
    }
}

let deleteCategoriasTp = async (request, response) => {
    try {
        let args = JSON.parse(request.body.arg === undefined ? '{}' : request.body.arg);
        let msg = validador.validarParametro(args, 'numero', 'codigoCategoriaTp', true);

        if (msg == '') {
            let con = await sql.connect(global.config.ds_postgrado);

            let result = await con.request()
                .input('COD_CATEGORIATP', sql.Int, args.codigoCategoriaTp)
                .execute('SP_ELIMINAR_CATEGORIA_TP');
            con.close();
            response.json(reply.ok(true));
        } else {
            response.json(reply.error(msg));
        }
    } catch (e) {
        response.json(reply.fatal(e));
    }
}

let getTiposProgramas = async (request, response) => {
    try {
        let con = await sql.connect(global.config.ds_postgrado);

        let resultTiposProgramas = await con.request()
            .execute('TR_LISTAR_TIPO_PROGRAMA');
        con.close();

        let resultCategoriasTp = await con.request()
            .execute('TR_LISTAR_CATEGORIAS_TP');
        con.close();

        let listTiposProgramas = resultTiposProgramas[0].map( tipo => {
            let categoria = resultCategoriasTp[0].find( categoria => categoria.Cod_CategoriaTP === tipo.Cod_CategoriaTP)
            return {
                codigo: tipo.Cod_tipoPrograma,
                descripcion: tipo.Descripcion_tp.trim(),
                categoria: categoria ? {
                    codigo: categoria.Cod_CategoriaTP,
                    descripcion: categoria.Descripcion_categoria.trim()
                } : null
            }
        }) || [];

        response.json(reply.ok(listTiposProgramas));

    } catch (e) {
        response.json(reply.fatal(e));
    }
}

let insertTiposProgramas = async (request, response) => {
    try {
        
        let args = JSON.parse(request.body.arg === undefined ? '{}' : request.body.arg);
        let msg = validador.validarParametro(args, 'numero', 'codigoTipoPrograma', true);
        msg += validador.validarParametro(args, 'cadena', 'descripcionTipoPrograma', true);
        msg += validador.validarParametro(args, 'numero', 'codigoCategoriaTp', true);

        if (msg == '') {
            let con = await sql.connect(global.config.ds_postgrado);

            let result = await con.request()
                .input('COD_TIPOTP', sql.Int, args.codigoTipoPrograma)
                .input('DESCRIPCION_TP', sql.VarChar, args.descripcionTipoPrograma)
                .input('COD_CATEGORIATP', sql.Int, args.codigoCategoriaTp)
                .execute('SP_AGREGAR_TIPO_PROGRAMA');
            con.close();
            response.json(reply.ok(true));
        } else {
            response.json(reply.error(msg));
        }

    } catch (e) {
        response.json(reply.fatal(e));
    }
}

let updateTiposProgramas = async (request, response) => {
    try {
        
        let args = JSON.parse(request.body.arg === undefined ? '{}' : request.body.arg);
        let msg = validador.validarParametro(args, 'numero', 'codigoTipoPrograma', true);
        msg += validador.validarParametro(args, 'cadena', 'descripcionTipoPrograma', true);
        msg += validador.validarParametro(args, 'numero', 'codigoCategoriaTp', true);

        if (msg == '') {
            let con = await sql.connect(global.config.ds_postgrado);

            let result = await con.request()
                .input('COD_TIPOTP', sql.Int, args.codigoTipoPrograma)
                .input('DESCRIPCION_TP', sql.VarChar, args.descripcionTipoPrograma)
                .input('COD_CATEGORIATP', sql.Int, args.codigoCategoriaTp)
                .execute('SP_ACTUALIZAR_TIPO_PROGRAMA');
            con.close();
            response.json(reply.ok(true));
        } else {
            response.json(reply.error(msg));
        }

    } catch (e) {
        response.json(reply.fatal(e));
    }
}

let deleteTiposProgramas = async (request, response) => {
    try {
        let args = JSON.parse(request.body.arg === undefined ? '{}' : request.body.arg);
        let msg = validador.validarParametro(args, 'numero', 'codigoTipoPrograma', true);

        if (msg == '') {
            let con = await sql.connect(global.config.ds_postgrado);

            let result = await con.request()
                .input('COD_TP', sql.Int, args.codigoTipoPrograma)
                .execute('SP_ELIMINAR_TIPO_PROGRAMA');
            con.close();
            response.json(reply.ok(true));
        } else {
            response.json(reply.error(msg));
        }
    } catch (e) {
        response.json(reply.fatal(e));
    }
}


module.exports = {
    getCampus,
    updateCampus,
    insertCampus,
    deleteCampus,
    getFacultades,
    updateFacultades,
    insertFacultades,
    deleteFacultades,
    getCategoriasTp,
    insertCategoriasTp,
    updateCategoriasTp,
    deleteCategoriasTp,
    getTiposProgramas,
    insertTiposProgramas,
    updateTiposProgramas,
    deleteTiposProgramas
};