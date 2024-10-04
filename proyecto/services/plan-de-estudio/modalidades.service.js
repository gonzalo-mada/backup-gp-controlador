var invoker = require('../../../base/invokers/invoker.invoker');
var reply = require('../../../base/utils/reply');
var validador = require('../../../base/utils/validador');
const reportInvoker = require("../../../base/invokers/report.invoker");

let listModalidades = [];
const haveLogica = false;

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
            res.json(reply.error(`La modalidad no pudo ser creada.`));
            return;
        }else{
            try {
                //No posee documentos REXE
            } catch (error) {
                if (haveLogica) {
                    await invoker(
                        global.config.serv_basePostgrado,
                        `${mod.m}/${mod.delete}`,
                        { [campos_mod.Cod_modalidad] : parseInt(codigo_mod) }
                    );
                }else{
                    listModalidades = listModalidades.filter( mod => mod[campos_mod.Cod_modalidad] != parseInt(campos_mod))
                }
                throw error;
            }
        }
        let response = { dataWasInserted: insertModalidad , dataInserted: args.Descripcion_modalidad}
        res.json(reply.ok(response));

    }catch(error){
        return res.json(reply.fatal(error));
    }
}

module.exports = {

    //data en bruto
    getModalidades,
    insertModalidad
}