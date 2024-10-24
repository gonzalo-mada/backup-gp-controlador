# Template Controlador - DTIC

Este proyecto esta orientado a ser base (template) para los diversos desarrollos de aplicaciones de servicios en DTIC. Este proyecto fue generado basándose en [Node JS](https://nodejs.org/es/) versión 14.17.0.

A Modo de ejemplo viene configurado para ser usado por el servicio template de lógica.

## Cambios a la versión anterior.

#### 1. Eliminación de dependencia de librería build-url.

Se elimina dicha librería y en su reemplazo se agrega una utilidad para generar la url.

Ejemplo:
```js
var reportUtils = require('../../base/utils/reportUtils');

let codigoVerificacion = '16811875190902048E';
let fechaTerminoPeriodo = 20220117;
let fechaCreacion = '11/10/2023 10:30';

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

let urlReporte = reportUtils(serverJasper, parentFolder, reportUnit, formato, params);
```

#### 2. Carga de funciones en memoria (scripts).

Se definen a nivel de los archivos de configuración de ambiente. La idea es contar con _**funciones de uso común**_ que no requieran acceso a base de datos. Por el momento disponibles, calculaDigito (rut), validarEmail (formato), aproximaNota y calculaPromedioExamen.

Ejemplo:
```js
...
],
funciones: [
    { name: 'calculaDigito' },
    { name: 'validarEmail' }
],
params: [
...
```

Para usar:
```js
...
let r = {
    rut: parseInt(args.rut),
    dv: global.funciones.calculaDigito(parseInt(args.rut)),
    emailValido: global.funciones.validarEmail(args.correo)
};

response.json(reply.ok(r));
...
```


#### 3. Agrega atributo _**tipoPregrado**_ en config.js.

Este atributo tiene los valores posibles _**true**_ o _**false**_. Debe ser **true** cuando el proyecto que se está construyendo será usado por alumnos de pregrado. Esto es así debido a que se deben ocultar algunos módulos que solo se _**habilitan**_ en determinadas circunstancias según la carrera del alumno.


#### 4. Elimina atributos usaCrypterLocal y usaServices de los archivos de configuración de ambientes.

