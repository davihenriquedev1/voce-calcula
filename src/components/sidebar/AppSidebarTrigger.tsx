"use client";

import CalcIcon from '@/svgs/calc-icon.svg';

import { SidebarTrigger } from '../ui/sidebar';

export const AppSidebarTrigger = () => {
    return (
      <SidebarTrigger title='calculadoras' className="h-12 w-12 p-0 flex items-center justify-center [&_svg]:w-10 [&_svg]:h-10" 
>
        <CalcIcon className="w-full h-full fill-primary" />
      </SidebarTrigger>

    )   
}
