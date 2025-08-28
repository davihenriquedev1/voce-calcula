import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input";
import { ChangeEvent } from "react";
import { UseFormReturn } from "react-hook-form";

type Props = {
    form: UseFormReturn<any>,
    name:string,
    label?:string,
    placeholder?:string,
    description?:string,
    type:string,
    mask?:(...args:any)=>string
    maxLength?: number
}

export const CustomInput = ({maxLength, form, name, label, placeholder, description, type, mask}:Props) => {

    const { control, setValue } = form;

    const handleChange = (e:ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;

        if (!rawValue || rawValue === '0') {
            setValue(name, '');
            return;
        }

        if(mask) {
            const value = e.target.value;
            const maskedValue = mask(value);
            setValue(name, maskedValue);
        } else {
            setValue(name, e.target.value);
        }
    }

    return (
        <FormField
          control={control}
          name={name}
          render={({ field }) => (
            <FormItem>
                <FormLabel className="font-bold">{label}</FormLabel>
                <FormControl>
                    <Input
                        {...field}
                        type={type}
                        placeholder={placeholder}
                        onChange={handleChange}
                        className="w-full"
                        maxLength={maxLength}
                    />
                </FormControl>
                <FormDescription>
                    {description}
                </FormDescription>
                <FormMessage />
            </FormItem>
          )}
        />
    )
}