var invoker = require('../../../base/invokers/invoker.invoker');
var reply = require('../../../base/utils/reply');
var validador = require('../../../base/utils/validador');
const { getNextCodigo } = require('../../utils/gpUtils')


let listJornadas = [];
const haveLogica = true;

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

        let jorExist = listJornadas.some(jor => (String(jor.Descripcion_jornada).toLowerCase() === String(args.Descripcion_jornada).toLowerCase()) );

        if (jorExist) {
            res.json(reply.error(`La jornada ${args.Descripcion_jornada} ya existe.`));
            return;
        }

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
                        { [campos_jor.Cod_jornada] : codigo_jor }
                    );
                }else{
                    listJornadas = listJornadas.filter( jor => jor[campos_jor.Cod_jornada] != codigo_jor)
                }
                throw error;
            }
        }
        let response = { dataWasInserted: insertJornada , dataInserted: args.Descripcion_jornada}
        res.json(reply.ok(response));

    }catch(error){
        console.log("e",error);
        
        return res.json(reply.fatal(error));
    }
}

let updateJornada = async (req, res) => {
    try{
        let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
        let msg = validador.validarParametro(args, "numero", "Cod_jornada", true);
        msg += validador.validarParametro(args, "cadena", "Descripcion_jornada", true);

        if (msg != "") {
            res.json(reply.error(msg));
            return;
        }
        
        let params = {
            [campos_jor.Cod_jornada]: args.Cod_jornada,
            [campos_jor.Descripcion_jornada]: args.Descripcion_jornada,
        };

        let updateJornada;

        let jorExist = listJornadas.some(jor => (String(jor.Descripcion_jornada).toLowerCase() === String(args.Descripcion_jornada).toLowerCase()) );

        if (jorExist) {
            res.json(reply.error(`La jornada ${args.Descripcion_jornada} ya existe.`));
            return;
        }

        if (haveLogica) {
            updateJornada = await invoker (
                global.config.serv_basePostgrado,
                `${jor.j}/${jor.update}`,
                params
            );
        }else{
            let index_jor = listJornadas.findIndex( item => item.Cod_jornada === params[campos_jor.Cod_jornada])
            if (index_jor !== -1 ) {
                updateJornada = listJornadas[index_jor] = {...listJornadas[index_jor], ...params}
            }else{
                updateJornada = null;
            }
        }

        let response = { dataWasUpdated: updateJornada, dataUpdated: args.Descripcion_jornada }
        res.json(reply.ok(response));

    }catch(e){
        res.json(reply.fatal(e));
    }
}

let deleteJornada = async (req, res) => {
    try {
        let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
        
        let msg = validador.validarParametro(args, "lista", "jornadaToDelete", true);
        if (msg != "") {
            res.json(reply.error(msg));
            return;
        }

        let jornadaToDelete = args.jornadaToDelete;

        for (let i = 0; i < jornadaToDelete.length; i++) {
            const e = jornadaToDelete[i];

            let params = {
                [campos_jor.Cod_jornada]: parseInt(e.Cod_jornada)
            };

            let deleteJornada;

            if (haveLogica) {
                deleteJornada = await invoker(
                    global.config.serv_basePostgrado,
                    `${jor.j}/${jor.delete}`,
                    params
                );
            } else {
                listJornadas = listJornadas.filter(jor => 
                    jor[campos_jor.Cod_jornada] != e.Cod_jornada
                );
                deleteJornada = true;
            }

            if (!deleteJornada) {
                res.json(reply.error(`La jornada no pudo ser eliminada.`));
                return;
            }
        }

        let response = { dataWasDeleted: true, dataDeleted: jornadaToDelete };
        res.json(reply.ok(response));
    } catch (e) {
        res.json(reply.fatal(e));
    }
};

module.exports = {

    //data en bruto
    getJornadas,
    insertJornada,
    updateJornada,
    deleteJornada
}