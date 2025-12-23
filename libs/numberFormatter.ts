const numberFormatter = (number: number | string) => {
    if (typeof number === 'string') {
        number = parseFloat(number);
    }
    number = isNaN(number) ? 0 : number;

    if (number >= 10000000) {
        // Crores
        return (number / 10000000).toFixed(2).replace(/\.00$/, '') + 'Cr';
    } else if (number >= 100000) {
        // Lakhs
        return (number / 100000).toFixed(2).replace(/\.00$/, '') + 'L';
    } else if (number >= 1000) {
        // Thousands
        return (number / 1000).toFixed(2).replace(/\.00$/, '') + 'K';
    } else {
        return number.toString();
    }
}

export default numberFormatter