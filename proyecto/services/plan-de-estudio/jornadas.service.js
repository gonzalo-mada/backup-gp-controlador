var invoker = require('../../../base/invokers/invoker.invoker');
var reply = require('../../../base/utils/reply');
var validador = require('../../../base/utils/validador');
const { getNextCodigo } = require('../../utils/gpUtils')


let listJornadas = [];
const haveLogica = false;

const jor = {
    "j" : "jornada",
    "get" : "getJornadas",
    "insert" : "insertJornada",
    "update" : "updateJornada",
    "delete" : "deleteJornada",
};

listJornadas = [
    {
        "Cod_jornada": 1,
        "Descripcion_jornada": "Diurna"
    },
    {
        "Cod_jornada": 2,
        "Descripcion_jornada": "Nocturna"
    },
    {
        "Cod_jornada": 3,
        "Descripcion_jornada": "Diurno-Vespertino"
    }
]

const campos_jor = {
    "Cod_jornada": "Cod_jornada",
    "Descripcion_jornada": "Descripcion_jornada",
};

let getJornadas = async (req, res) => {
    try {
        if (haveLogica) {
            listJornadas = await invoker(
                global.config.serv_basePostgrado,
                `${jor.j}/${jor.get}`,
                null
            );
        }
        res.json(reply.ok(listJornadas));
    } catch (e) {
        res.json(reply.fatal(e));
    }
}

let insertJornada = async (req, res) =>{
    try{
        let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
        let msg = validador.validarParametro(args, "cadena", "Descripcion_jornada", true);

        if (msg != "") {
            res.json(reply.error(msg));
            return;
        };
        if (haveLogica) {
            listJornadas = await invoker(
                global.config.serv_basePostgrado,
                `${jor.j}/${jor.get}`,
                null
            );
        }
        let codigo_jor = getNextCodigo(listJornadas,'Cod_jornada');

        let params = {
            [campos_jor.Cod_jornada]: parseInt(codigo_jor),
            [campos_jor.Descripcion_jornada]: args.Descripcion_jornada,
        };

        let insertJornada;

        if (haveLogica) {
            insertJornada = await invoker (
                global.config.serv_basePostgrado,
                `${jor.j}/${jor.insert}`,
                params
            );
        }else{
            insertJornada = listJornadas.push(params);
        }

        if (!insertJornada) {
            res.json(reply.error(`La jornada no pudo ser creada.`));
            return;
        }else{
            try {
                //No posee documentos REXE
            } catch (error) {
                if (haveLogica) {
                    await invoker(
                        global.config.serv_basePostgrado,
                        `${jor.j}/${jor.delete}`,
                        { [campos_jor.Cod_jornada] : parseInt(codigo_jor) }
                    );
                }else{
                    listJornadas = listJornadas.filter( jor => jor[campos_jor.Cod_jornada] != parseInt(codigo_jor))
                }
                throw error;
            }
        }
        let response = { dataWasInserted: insertJornada , dataInserted: args.Descripcion_jornada}
        res.json(reply.ok(response));

    }catch(error){
        return res.json(reply.fatal(error));
    }
}


module.exports = {

    //data en bruto
    getJornadas,
    insertJornada
}