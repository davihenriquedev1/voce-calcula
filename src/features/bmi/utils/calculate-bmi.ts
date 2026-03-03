export const calculateBmi = (height:number, weight:number) => {
    const bmi = weight / (height * height);
    const formattedBmi = parseFloat(bmi.toString()).toFixed(2);
    return parseFloat(formattedBmi);
}
