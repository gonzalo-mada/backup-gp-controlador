const getNextCodigoJornada = (data, atributo) => {
    try {
        if (!data || data.length === 0) {
            // Si no hay datos, el primer código será "J1"
            return 'J01';
        }

        // Obtengo el último valor del arreglo de datos
        let last_value = data[data.length - 1];

        // Obtengo el último código del atributo
        let last_code = last_value[atributo];

        // Extraigo la parte numérica del código (por ejemplo, "J01" -> "01")
        let numericPart = last_code.substring(1);

        if (isNaN(numericPart)) {
            throw new Error(`El último código no es un número válido`);
        }

        // Incremento la parte numérica
        let nextNumericPart = (parseInt(numericPart) + 1).toString();

        // Si el número es menor que 10, lo formateo con 2 dígitos
        if (nextNumericPart < 10) {
            nextNumericPart = nextNumericPart.padStart(2, '0');
        }

        // Devuelvo el siguiente código con la letra "J" delante
        return 'J' + nextNumericPart;

    } catch (e) {
        throw e;
    }
};

module.exports = { 
    getNextCodigoJornada,
};