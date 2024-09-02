'use strict'
var sql = require('mssql');
var reply = require('../../base/utils/reply');
var validador = require('../../base/utils/validador');

let getCampus = async (request, response) => {
    try {
        let con = await sql.connect(global.config.ds_postgrado);

        let result = await con.request()
            .execute('TR_LISTAR_CAMPUS');
        con.close();

        let listCampus = result[0].map((a) => {
            return {
                codigo: a.Cod_Campus,
                descripcion: a.Descripcion_campus.trim(),
                estado: a.Estado_campus,
            }
        }) || [];

        response.json(reply.ok(listCampus));

    } catch (e) {
        response.json(reply.fatal(e));
    }
}

let updateCampus = async (request, response) => {
    try {
        let args = JSON.parse(request.body.arg === undefined ? '{}' : request.body.arg);
        let msg = validador.validarParametro(args, 'numero', 'codigoCampus', true);
        msg += validador.validarParametro(args, 'cadena', 'descripcionCampus', true);
        msg += validador.validarParametro(args, 'numero', 'estadoCampus', true);

        if (msg == '') {
            let con = await sql.connect(global.config.ds_postgrado);

            let result = await con.request()
                .input('COD_CAMPUS', sql.Int, args.codigoCampus)
                .input('DESCRIPCION_CAMPUS', sql.VarChar, args.descripcionCampus)
                .input('ESTADO_CAMPUS', sql.VarChar, args.estadoCampus)
                .execute('SP_ACTUALIZAR_CAMPUS');
            con.close();
            response.json(reply.ok(true));
        } else {
            response.json(reply.error(msg));
        }
    } catch (e) {
        response.json(reply.fatal(e));
    }
};

let insertCampus = async (request, response) => {
    try {
        let args = JSON.parse(request.body.arg === undefined ? '{}' : request.body.arg);
        let msg = validador.validarParametro(args, 'numero', 'codigoCampus', true);
        msg += validador.validarParametro(args, 'cadena', 'descripcionCampus', true);
        msg += validador.validarParametro(args, 'numero', 'estadoCampus', true);

        if (msg == '') {
            let con = await sql.connect(global.config.ds_postgrado);

            let result = await con.request()
                .input('COD_CAMPUS', sql.Int, args.codigoCampus)
                .input('DESCRIPCION_CAMPUS', sql.VarChar, args.descripcionCampus)
                .input('ESTADO_CAMPUS', sql.VarChar, args.estadoCampus)
                .execute('SP_AGREGAR_CAMPUS');
            con.close();
            response.json(reply.ok(true));
        } else {
            response.json(reply.error(msg));
        }
    } catch (e) {
        response.json(reply.fatal(e));
    }
};

let deleteCampus = async (request, response) => {
    try {
        let args = JSON.parse(request.body.arg === undefined ? '{}' : request.body.arg);
        let msg = validador.validarParametro(args, 'numero', 'codigoCampus', true);

        if (msg == '') {
            let con = await sql.connect(global.config.ds_postgrado);

            let result = await con.request()
                .input('COD_CAMPUS', sql.Int, args.codigoCampus)
                .execute('SP_ELIMINAR_CAMPUS');
            con.close();
            response.json(reply.ok(true));
        } else {
            response.json(reply.error(msg));
        }
    } catch (e) {
        response.json(reply.fatal(e));
    }
};

let getFacultades = async (request, response) => {
    try {
        let con = await sql.connect(global.config.ds_postgrado);

        let result = await con.request()
            .execute('TR_LISTAR_FACULTAD');
        con.close();

        let listFacultades = result[0].map((a) => {
            return {
                codigo: a.Cod_facultad,
                descripcion: a.Descripcion_facu.trim(),
                estado: a.Estado_facu,
            }
        }) || [];

        response.json(reply.ok(listFacultades));

    } catch (e) {
        response.json(reply.fatal(e));
    }
}

let updateFacultades = async (request, response) => {
    try {
        let args = JSON.parse(request.body.arg === undefined ? '{}' : request.body.arg);
        let msg = validador.validarParametro(args, 'numero', 'codigoFacultad', true);
        msg += validador.validarParametro(args, 'cadena', 'descripcionFacultad', true);
        msg += validador.validarParametro(args, 'numero', 'estadoFacultad', true);

        if (msg == '') {
            let con = await sql.connect(global.config.ds_postgrado);

            let result = await con.request()
                .input('COD_FACULTAD', sql.Int, args.codigoFacultad)
                .input('DESCRIPCION_FACULTAD', sql.VarChar, args.descripcionFacultad)
                .input('ESTADO_FACU', sql.VarChar, args.estadoFacultad)
                .execute('SP_ACTUALIZAR_FACULTAD');
            con.close();
            response.json(reply.ok(true));
        } else {
            response.json(reply.error(msg));
        }
    } catch (e) {
        response.json(reply.fatal(e));
    }
};

let insertFacultades = async (request, response) => {
    try {
        let args = JSON.parse(request.body.arg === undefined ? '{}' : request.body.arg);
        let msg = validador.validarParametro(args, 'numero', 'codigoFacultad', true);
        msg += validador.validarParametro(args, 'cadena', 'descripcionFacultad', true);
        msg += validador.validarParametro(args, 'numero', 'estadoFacultad', true);

        if (msg == '') {
            let con = await sql.connect(global.config.ds_postgrado);

            let result = await con.request()
                .input('COD_FACULTAD', sql.Int, args.codigoFacultad)
                .input('DESCRIPCION_FACULTAD', sql.VarChar, args.descripcionFacultad)
                .input('ESTADO_FACU', sql.VarChar, args.estadoFacultad)
                .execute('SP_AGREGAR_FACULTAD');
            con.close();
            response.json(reply.ok(true));
        } else {
            response.json(reply.error(msg));
        }
    } catch (e) {
        response.json(reply.fatal(e));
    }
};

let deleteFacultades = async (request, response) => {
    try {
        let args = JSON.parse(request.body.arg === undefined ? '{}' : request.body.arg);
        let msg = validador.validarParametro(args, 'numero', 'codigoFacultad', true);

        if (msg == '') {
            let con = await sql.connect(global.config.ds_postgrado);

            let result = await con.request()
                .input('COD_FACULTAD', sql.Int, args.codigoFacultad)
                .execute('SP_ELIMINAR_FACULTAD');
            con.close();
            response.json(reply.ok(true));
        } else {
            response.json(reply.error(msg));
        }
    } catch (e) {
        response.json(reply.fatal(e));
    }
};

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