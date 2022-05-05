export default (high, low) => {
    high++;
    return Math.floor((Math.random()) * (high - low)) + low;
}


