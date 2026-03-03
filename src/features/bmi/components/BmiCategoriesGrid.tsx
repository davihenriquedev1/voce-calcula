import { BmiCategory } from '../types';

export const BmiCategoriesGrid = ({categories}: {categories: BmiCategory[]}) => {
    return (
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 w-full">
            {categories.map((item, key) => (
                <div className="flex flex-col gap-1 text-white p-5 justify-center items-center text-center rounded-md" style={{ backgroundColor: `${item.color}` }} key={key}>
                    <div className="text-4xl">{item.emoji}</div>
                    <div className="text-sm">IMC {item.rangeText}</div>
                    <div className="font-bold">{item.category}</div>
                </div>
            ))}
        </div>
    )
}
