import { contactUsSchema } from './schema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export const useContactUsController = () => {
    const form = useForm({
        resolver: zodResolver(contactUsSchema),
    });
    
    const {register, handleSubmit } = form;

    const onSubmit = () => {
        
    }

    return { form, onSubmit, handleSubmit, register }
}