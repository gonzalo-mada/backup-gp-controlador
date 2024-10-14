var invoker = require('../../../base/invokers/invoker.invoker');
var reply = require('../../../base/utils/reply');
var validador = require('../../../base/utils/validador');
const reportInvoker = require("../../../base/invokers/report.invoker");
const { getNextCodigo } = require('../../utils/gpUtils')

let listModalidades = [];
const haveLogica = true;

const mod = {
    "m" : "modalidad",
    "get" : "getModalidades",
    "insert" : "insertModalidad",
    "update" : "updateModalidad",
    "delete" : "deleteModalidad",
};

listModalidades = [
    {
        "Cod_modalidad": 1,
        "Descripcion_modalidad": "Híbrido"
    },
    {
        "Cod_modalidad": 2,
        "Descripcion_modalidad": "Presencial"
    },
    {
        "Cod_modalidad": 3,
        "Descripcion_modalidad": "Virtual"
    },
    {
        "Cod_modalidad": 4,
        "Descripcion_modalidad": "Semi-presencial"
    }
]

const campos_mod = {
    "Cod_modalidad": "Cod_modalidad",
    "Descripcion_modalidad": "Descripcion_modalidad",
};

let getModalidades = async (req, res) => {

    try {
        if (haveLogica) {
            listModalidades = await invoker(
                global.config.serv_basePostgrado,
                `${mod.m}/${mod.get}`,
                null
            );
        }
        res.json(reply.ok(listModalidades));
    } catch (e) {
        res.json(reply.fatal(e));
    }
}

let insertModalidad = async (req, res) =>{
    try{
        let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
        let msg = validador.validarParametro(args, "cadena", "Descripcion_modalidad", true);

        if (msg != "") {
            res.json(reply.error(msg));
            return;
        };
        if (haveLogica) {
            listModalidades = await invoker(
                global.config.serv_basePostgrado,
                `${mod.m}/${mod.get}`,
                null
            );
        }
        let codigo_mod = getNextCodigo(listModalidades,'Cod_modalidad');

        let params = {
            [campos_mod.Cod_modalidad]: parseInt(codigo_mod),
            [campos_mod.Descripcion_modalidad]: args.Descripcion_modalidad,
        };

        let insertModalidad;

        let modExist = listModalidades.some(mod => (String(mod.Descripcion_modalidad).toLowerCase() === String(args.Descripcion_modalidad).toLowerCase()) );

        if (modExist) {
            res.json(reply.error(`La modalidad ${args.Descripcion_modalidad} ya existe.`));
            return;
        }

        if (haveLogica) {
            insertModalidad = await invoker (
                global.config.serv_basePostgrado,
                `${mod.m}/${mod.insert}`,
                params
            );
        }else{
            insertModalidad = listModalidades.push(params);
        }

        if (!insertModalidad) {
            if (haveLogica) {
                await invoker(
                    global.config.serv_basePostgrado,
                    `${mod.m}/${mod.delete}`,
                    { [campos_mod.Cod_modalidad] : parseInt(codigo_mod) }
                );
            }else{
                listModalidades = listModalidades.filter( mod => mod[campos_mod.Cod_modalidad] != parseInt(campos_mod))
            }
            return res.json(reply.error(`La modalidad no pudo ser creada.`));
        }
        
        let response = { dataWasInserted: insertModalidad , dataInserted: args.Descripcion_modalidad}
        res.json(reply.ok(response));

    }catch(error){
        return res.json(reply.fatal(error));
    }
}

let updateModalidad = async (req, res) => {
    try{
        let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
        let msg = validador.validarParametro(args, "number", "Cod_modalidad", true);
        msg += validador.validarParametro(args, "cadena", "Descripcion_modalidad", true);

        if (msg != "") {
            res.json(reply.error(msg));
            return;
        }
        
        let params = {
            [campos_mod.Cod_modalidad]: args.Cod_modalidad,
            [campos_mod.Descripcion_modalidad]: args.Descripcion_modalidad,
        };

        let updateModalidad;

        if (haveLogica) {
            updateModalidad = await invoker (
                global.config.serv_basePostgrado,
                `${mod.m}/${mod.update}`,
                params
            );
        }else{
            let index_mod = listModalidades.findIndex( item => item.Cod_modalidad === params[campos_mod.Cod_modalidad])
            if (index_mod !== -1 ) {
                updateModalidad = listModalidades[index_mod] = {...listModalidades[index_mod], ...params}
            }else{
                updateModalidad = null;
            }
        }

        let response = { dataWasUpdated: updateModalidad, dataUpdated: args.Descripcion_modalidad }
        res.json(reply.ok(response));

    }catch(e){
        res.json(reply.fatal(e));
    }
}

let deleteModalidad = async (req, res) => {
    try {
        let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
        
        let msg = validador.validarParametro(args, "lista", "modalidadToDelete", true);
        if (msg != "") {
            res.json(reply.error(msg));
            return;
        }

        let modalidadToDelete = args.modalidadToDelete;

        for (let i = 0; i < modalidadToDelete.length; i++) {
            const e = modalidadToDelete[i];

            let params = {
                [campos_mod.Cod_modalidad]: parseInt(e.Cod_modalidad)
            };

            let deleteModalidad;

            if (haveLogica) {
                deleteModalidad = await invoker(
                    global.config.serv_basePostgrado,
                    `${mod.m}/${mod.delete}`,
                    params
                );
            } else {
                listModalidades = listModalidades.filter(mod => 
                    mod[campos_mod.Cod_modalidad] != parseInt(e.Cod_modalidad)
                );
                deleteModalidad = true;
            }

            if (!deleteModalidad) {
                res.json(reply.error(`La modalidad no pudo ser eliminada.`));
                return;
            }
        }

        let response = { dataWasDeleted: true, dataDeleted: modalidadToDelete };
        res.json(reply.ok(response));
    } catch (e) {
        res.json(reply.fatal(e));
    }
};

module.exports = {

    //data en bruto
    getModalidades,
    insertModalidad,
    updateModalidad,
    deleteModalidad
}