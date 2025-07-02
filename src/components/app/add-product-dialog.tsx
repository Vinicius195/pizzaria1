'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Product } from '@/types';
import { useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';

const productSchema = z.object({
  name: z.string().min(3, "O nome do produto deve ter pelo menos 3 caracteres."),
  category: z.enum(['Pizza', 'Bebida', 'Adicional'], {
    required_error: "Selecione uma categoria.",
  }),
  price: z.coerce.number().min(0.01, "O preço deve ser maior que zero."),
  description: z.string().optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ProductFormValues) => void;
  product?: Product | null;
}

export function AddProductDialog({ open, onOpenChange, onSubmit, product }: AddProductDialogProps) {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      category: undefined,
      price: 0,
      description: '',
    },
  });

  const category = form.watch('category');

  useEffect(() => {
    if (product) {
      form.reset(product);
    } else {
      form.reset({
        name: '',
        category: undefined,
        price: 0,
        description: '',
      });
    }
  }, [product, form, open]);

  const handleDialogClose = () => {
    form.reset();
    onOpenChange(false);
  }

  const handleFormSubmit = (data: ProductFormValues) => {
    onSubmit(data);
    handleDialogClose();
  }
  
  const dialogTitle = product ? "Editar Produto" : "Adicionar Novo Produto";
  const dialogDescription = product ? "Atualize as informações do produto." : "Preencha os detalhes para criar um novo produto.";

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Produto</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Pizza de Calabresa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Pizza">Pizza</SelectItem>
                      <SelectItem value="Bebida">Bebida</SelectItem>
                      <SelectItem value="Adicional">Adicional</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             {category === 'Pizza' && (
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ingredientes (Descrição)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Molho de tomate, mussarela, calabresa, etc."
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço</FormLabel>
                   <FormControl>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground text-sm">R$</span>
                      <Input type="number" step="0.01" placeholder="0,00" className="pl-8" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="ghost">Cancelar</Button>
              </DialogClose>
              <Button type="submit">{product ? 'Salvar Alterações' : 'Adicionar Produto'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
