# Archivos para configurar variables por ambiente

### development.js

- En ese archivo iran las variables de configuracion necesarias para ambientes de desarrollo
- Comando para levantar en modo desarollo `npm run start` o `npm run dev`

### production.js

- En ese archivo iran las variables de configuracion necesarias para ambientes de producción
- Comando para levantar en modo producción o `npm run prod`

### local.js

- Este archivo permite ingresar configuraciones para cuando queremos desarrollar en nuestro ambiente local, si el archivo existe y la app se levanta con los comandos `npm run start` se tomaran las configuraciones que esten en este archivo, las configuraciones que no se encuentren en este serán obtenidas del archivo de configuración de desarrollo o el config general.
- Para cuando nos encontramos desarrollando en nuestro entorno local y queremos concectarnos a un servicio que se encuentra en nuestra maquina local u otra ip que no es la que se encuentra en desarrollo podemos agregar la siguiente conf

```
"use strict";

module.exports = {
    localServices: [
        {
            name: "<nombre_del_servicio>",
            host: "<host>", // localhost para nuestro local
            port: <puerto>,
            path: "/<path>",
        },
    ],
};
```
```
// ejemplo
module.exports = {
    localServices: [
        {
            name: "garinInvestigacion",
            host: "10.100.50.45",
            port: 2800,
            path: "/garinInvestigacion",
        },
    ],
};
```