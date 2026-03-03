import { BmiCategory } from '../types';

export const BmiResult = ({category, result}: {category: BmiCategory, result:number}) => {
    return (
        <div className="w-full flex flex-col gap-2 text-white p-5 justify-center items-center text-center rounded-md" style={{ backgroundColor: `${category.color}` }}>
            <div className="text-8xl">{category.emoji}</div>
            <div className="font-bold text-2xl">Seu IMC é {result}</div>
            <div className="text-sm opacity-80">IMC {category.rangeText}</div>
            <div className="font-bold">{category.category}</div>
        </div>
    )
}
