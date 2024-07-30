'use strict';

var invoker = require('../../base/invokers/invoker.invoker');
var reportInvoker = require('../../base/invokers/report.invoker');

var decryptToken = require('../../base/utils/decryptToken');
var reply = require('../../base/utils/reply');
var report = require('../../base/utils/report');
var reportUtils = require('../../base/utils/reportUtils');
var validador = require('../../base/utils/validador');


let leeToken = async (request, response) => {
    try {
        let dataDecrypt = await decryptToken(request.headers.authorization);

        response.json(reply.ok(dataDecrypt));
    } catch (e) {
        response.json(reply.fatal(e));
    }
};

let getFacultades = async (request, response) => {
    try {
        let facultades = await invoker(
            global.config.serv_proyectoBaseMedio,
            'getFacultades',
            null
        );

        response.json(reply.ok(facultades));
    } catch (e) {
        response.json(reply.fatal(e));
    }
};

let getInformacionPrograma = async (request, response) => {
    try {
        let args = JSON.parse(request.body.arg === undefined ? '{}' : request.body.arg);
        let msg = validador.validarParametro(args, 'numero', 'codPrograma', true);

        if (msg == '') {
            let param = {
                codPrograma: parseInt(args.codPrograma),
            };

            let dataPrograma = await invoker(
                global.config.serv_proyectoBaseMedio,
                'getInformacionPrograma',
                param
            );
            
            response.json(reply.ok(dataPrograma));
        } else {
            response.json(reply.error(msg));
        }
    } catch (e) {
        response.json(reply.fatal(e));
    }
};

let generaCertificadoAlumnoRegular = async (request, response) => {
    try {
        /**
          rutAlumno 21394589
        */

        let args = JSON.parse(request.body.arg === undefined ? '{}' : request.body.arg);
        let msg = validador.validarParametro(args, 'numero', 'rutAlumno', true);

        if (msg == '') {
            let codigoVerificacion = '16811875190902048E';
            let fechaTerminoPeriodo = 20220117;
            let fechaCreacion = '11/10/2023 10:30';

            /**
              URL que se debe formar para el reporte.
              
              http://reporteadoracademico.uv.cl:8080/jasperserver/flow.html?
              _flowId=viewReportFlow&
              standAlone=true&
              ParentFolderUri=%2FReportes_Portal_Academico%2FReportes&
              reportUnit=%2FReportes_Portal_Academico%2FReportes%2FCertificadoAlumnoRegular&
              j_username=guest&
              j_password=guest&
              output=pdf&
              P_RUTALUMNO=21394589&
              P_FECHA_HORA=01/01/2014%2014:16&
              P_FEC_TER_PERIODO=20220117&
              P_COD_VERIFICACION=16811875190902048E
            */

            let serverJasper = global.config.param_base_url_reporteador_academico;
            let parentFolder = '%2FReportes_Portal_Academico%2FReportes';
            let reportUnit = '%2FReportes_Portal_Academico%2FReportes%2FCertificadoAlumnoRegular';
            let formato = 'pdf';

            let params = {
                P_RUTALUMNO: parseInt(args.rutAlumno),
                P_FECHA_HORA: fechaCreacion,
                P_FEC_TER_PERIODO: fechaTerminoPeriodo,
                P_COD_VERIFICACION: codigoVerificacion
            };

            /** Opción 1
              Usando reportUtils
            */
            let urlReporte = reportUtils(serverJasper, parentFolder, reportUnit, formato, params);

            /** Opción 2
                Generar 'a mano' url concatenando los valores:

                let urlReporte = 'http://reporteadoracademico.uv.cl:8080/jasperserver/flow.html?';
                urlReporte+= '_flowId=viewReportFlow&';
                urlReporte+= 'standAlone=true&';
                urlReporte+= 'ParentFolderUri=%2FReportes_Portal_Academico%2FReportes&';
                urlReporte+= 'reportUnit=%2FReportes_Portal_Academico%2FReportes%2FCertificadoAlumnoRegular&';
                urlReporte+= 'j_username=guest&';
                urlReporte+= 'j_password=guest&';
                urlReporte+= 'output=pdf&';
                urlReporte+= 'P_RUTALUMNO=' + parseInt(args.rutAlumno) + '&';
                urlReporte+= 'P_FECHA_HORA=' + fechaCreacion + '&';
                urlReporte+= 'P_FEC_TER_PERIODO=' + fechaTerminoPeriodo + '&';
                urlReporte+= 'P_COD_VERIFICACION=' + codigoVerificacion;
            */

            response.send(await report(urlReporte));
        } else {
            response.json(reply.error(msg));
        }
    } catch (e) {
        response.json(reply.fatal(e));
    }
};

let generaCertificadoAlumnoRegular2 = async (request, response) => {
    try {
        /**
          rutAlumno 21394589
        */

        let args = JSON.parse(request.body.arg === undefined ? '{}' : request.body.arg);
        let msg = validador.validarParametro(args, 'numero', 'rutAlumno', true);

        if (msg == '') {
            /**
             En este caso el reporte es generado en un servicio de lógica que retorna el buffer de datos del reporte.
            */

            let param = {
                rutAlumno: parseInt(args.rutAlumno),
            };

            let reporte = await reportInvoker(
                global.config.serv_proyectoBaseMedio,
                'generaCertificadoAlumnoRegular',
                param
            );

            response.send(reporte);
        } else {
            response.json(reply.error(msg));
        }
    } catch (e) {
        response.json(reply.fatal(e));
    }
};

let generaReporteCargaAcademica = async (request, response) => {
    try {
        /**
          rutAcademico 20706496
        */

          let args = JSON.parse(request.body.arg === undefined ? '{}' : request.body.arg);
          let msg = validador.validarParametro(args, 'numero', 'rutAcademico', true);
  
          if (msg == '') {
  
              /**
                URL que se debe formar para el reporte.
                
                http://reporteadoracademico.uv.cl:8080/jasperserver/flow.html?
                _flowId=viewReportFlow&
                standAlone=true&
                reportUnit=%2FReportes_Portal_Academico%2FReportes%2FCargaAcademicaV2&
                j_username=guest&
                j_password=guest&
                output=pdf&
                P_RUT=20706496&
              */
  
              let serverJasper = global.config.param_base_url_reporteador_academico;
              let parentFolder = ''; // Este reporte NO tiene un ParentFolderUri
              let reportUnit = '%2FReportes_Portal_Academico%2FReportes%2FCargaAcademicaV2';
              let formato = 'pdf';
  
              let params = {
                  P_RUT: parseInt(args.rutAcademico),
              };

              let urlReporte = reportUtils(serverJasper, parentFolder, reportUnit, formato, params);
              
              response.send(await report(urlReporte));
          } else {
              response.json(reply.error(msg));
          }
    } catch (e) {
        response.json(reply.fatal(e));
    }
};

let obtenerDigitoRut = async (request, response) => {
    try {
        /**
          rut: 12345678 --> repuesta 5
        */

        let args = JSON.parse(request.body.arg === undefined ? '{}' : request.body.arg);
        let msg = validador.validarParametro(args, 'numero', 'rut', true);

        if (msg == '') {
            let r = {
                rut: parseInt(args.rut),
                dv: global.funciones.calculaDigito(parseInt(args.rut))
            };

            response.json(reply.ok(r));
        } else {
            response.json(reply.error(msg));
        }
    } catch (e) {
        response.json(reply.fatal(e));
    }
};

let validarFormatoCorreo = async (request, response) => {
    try {
        /**
          correo.correcto@uv.cl --> válido.
          correo.incorrecto2uv.cl --> inválido.
          correo.incorrecto@uv. --> inválido.
        */

        let args = JSON.parse(request.body.arg === undefined ? '{}' : request.body.arg);
        let msg = validador.validarParametro(args, 'cadena', 'correo', true);

        if (msg == '') {
            let r = {
                correo: args.correo,
                valido: global.funciones.validarEmail(args.correo)
            };

            response.json(reply.ok(r));
        } else {
            response.json(reply.error(msg));
        }
    } catch (e) {
        response.json(reply.fatal(e));
    }
};


module.exports = {
    leeToken,

    getFacultades,
    getInformacionPrograma,

    generaCertificadoAlumnoRegular,
    generaCertificadoAlumnoRegular2,
    generaReporteCargaAcademica,

    obtenerDigitoRut,
    validarFormatoCorreo,
};
