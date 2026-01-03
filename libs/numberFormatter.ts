const numberFormatter = (number: number | string) => {
  if (typeof number === "string") {
    number = parseFloat(number);
  }
  number = isNaN(number) ? 0 : number;

  if (number >= 1000000000000) {
    // Trillions
    return (number / 1000000000000).toFixed(1).replace(/\.00$/, "") + "T";
  } else if (number >= 1000000000) {
    // Billions
    return (number / 1000000000).toFixed(1).replace(/\.00$/, "") + "B";
  } else if (number >= 1000000) {
    // Millions
    return (number / 1000000).toFixed(1).replace(/\.00$/, "") + "M";
  } else if (number >= 1000) {
    // Thousands
    return (number / 1000).toFixed(1).replace(/\.00$/, "") + "K";
  } else {
    return number.toString();
  }
};

export default numberFormatter;
