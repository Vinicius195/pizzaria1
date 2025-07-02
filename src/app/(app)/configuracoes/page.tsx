'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { getMockSettings, updateMockSettings } from '@/lib/settings-data';
import { pizzaSizes } from '@/types';
import { useUser } from '@/contexts/user-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const settingsSchema = z.object({
  basePrices: z.object({
    pequeno: z.coerce.number().min(0, "O preço deve ser positivo."),
    medio: z.coerce.number().min(0, "O preço deve ser positivo."),
    grande: z.coerce.number().min(0, "O preço deve ser positivo."),
    GG: z.coerce.number().min(0, "O preço deve ser positivo."),
  }),
  sizeAvailability: z.object({
    pequeno: z.boolean(),
    medio: z.boolean(),
    grande: z.boolean(),
    GG: z.boolean(),
  }),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function ConfiguracoesPage() {
  const { toast } = useToast();
  const { currentUser } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (currentUser.role !== 'Administrador') {
      router.replace('/pedidos');
    }
  }, [currentUser, router]);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: getMockSettings(),
  });

  const onSubmit = (data: SettingsFormValues) => {
    updateMockSettings(data);
    toast({
      title: 'Configurações Salvas!',
      description: 'Suas alterações foram salvas com sucesso.',
    });
  };

  if (currentUser.role !== 'Administrador') {
    return (
        <div className="space-y-4">
          <Skeleton className="h-12 w-1/4" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      );
  }

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold font-headline">Configurações</h1>
        <p className="text-muted-foreground">Gerencie as configurações gerais da sua pizzaria.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Preços Base das Pizzas</CardTitle>
              <CardDescription>
                Defina os preços padrão para cada tamanho de pizza. Eles serão usados como sugestão ao criar um novo produto.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {pizzaSizes.map((size) => (
                  <FormField
                    key={size}
                    control={form.control}
                    name={`basePrices.${size}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="capitalize font-medium">{size}</FormLabel>
                         <FormControl>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground text-sm">R$</span>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0,00"
                              className="pl-8"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Disponibilidade de Tamanhos</CardTitle>
              <CardDescription>
                Ative ou desative tamanhos de pizza para todo o cardápio. Isso afetará as opções ao criar um novo pedido.
              </CardDescription>
            </CardHeader>
            <CardContent>
               <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {pizzaSizes.map((size) => (
                   <FormField
                    key={size}
                    control={form.control}
                    name={`sizeAvailability.${size}`}
                    render={({ field }) => (
                      <FormItem className="flex flex-col items-start gap-4 rounded-lg border p-4 shadow-sm h-full">
                        <FormLabel className="text-base font-semibold capitalize cursor-pointer">
                          {size}
                        </FormLabel>
                        <FormControl>
                           <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            aria-label={`Disponibilidade do tamanho ${size}`}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit">Salvar Alterações</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
