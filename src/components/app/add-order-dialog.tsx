'use client';

import { useForm, useFieldArray } from 'react-hook-form';
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
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { mockProducts } from '@/lib/mock-data';
import type { Product, PizzaSize } from '@/types';
import { Check, ChevronsUpDown, Link, PlusCircle, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

const orderItemSchema = z.object({
  productId: z.string().min(1, "Selecione um produto."),
  quantity: z.coerce.number().min(1, "A quantidade deve ser pelo menos 1."),
  size: z.custom<PizzaSize>().optional(),
});

const addOrderSchema = z.object({
  customerName: z.string().min(2, "O nome do cliente é obrigatório."),
  orderType: z.enum(['entrega', 'retirada'], {
    required_error: 'Selecione o tipo de pedido.',
  }),
  items: z.array(orderItemSchema).min(1, "Adicione pelo menos um item ao pedido."),
  addressType: z.enum(['manual', 'link']).default('manual'),
  address: z.string().optional(),
  locationLink: z.string().optional(),
}).superRefine((data, ctx) => {
    data.items.forEach((item, index) => {
      const product = mockProducts.find(p => p.id === item.productId);
      if (product?.category === 'Pizza') {
        if (!item.size) {
           ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Selecione o tamanho da pizza.",
              path: [`items`, index, `size`],
           });
        } else if (!product.sizes || !product.sizes[item.size]) {
             ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Tamanho indisponível para esta pizza.",
                path: [`items`, index, `size`],
             });
        }
      }
    });

    if (data.orderType === 'entrega') {
        if (data.addressType === 'manual') {
            if (!data.address || data.address.trim().length < 10) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "O endereço é obrigatório e deve ter pelo menos 10 caracteres.",
                    path: ["address"],
                });
            }
        } else if (data.addressType === 'link') {
            if (!data.locationLink || data.locationLink.trim() === '') {
                 ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "O link de localização é obrigatório.",
                    path: ["locationLink"],
                });
            } else {
                try {
                    new URL(data.locationLink);
                } catch (_) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Por favor, insira um link válido (Ex: https://maps.app.goo.gl/...).",
                        path: ["locationLink"],
                    });
                }
            }
        }
    }
});


export type AddOrderFormValues = z.infer<typeof addOrderSchema>;

interface AddOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddOrder: (data: AddOrderFormValues) => void;
}

export function AddOrderDialog({ open, onOpenChange, onAddOrder }: AddOrderDialogProps) {
  const { toast } = useToast();
  const [openProductCombobox, setOpenProductCombobox] = useState<number | null>(null);

  const form = useForm<AddOrderFormValues>({
    resolver: zodResolver(addOrderSchema),
    defaultValues: {
      customerName: '',
      orderType: 'retirada',
      items: [{ productId: '', quantity: 1, size: undefined }],
      addressType: 'manual',
      address: '',
      locationLink: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });
  
  const watchedItems = form.watch('items');

  const orderType = form.watch('orderType');
  const addressType = form.watch('addressType');

  const availableProducts = mockProducts.filter((p) => p.isAvailable);
  const groupedProducts = availableProducts.reduce(
    (acc, product) => {
      const { category } = product;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(product);
      return acc;
    },
    {} as Record<Product['category'], Product[]>
  );
  
  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  }

  function onSubmit(data: AddOrderFormValues) {
    onAddOrder(data);
    toast({
      title: "Pedido Criado com Sucesso!",
      description: `O pedido para ${data.customerName} foi adicionado.`,
    })
    handleClose();
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Pedido</DialogTitle>
          <DialogDescription>
            Preencha os detalhes abaixo para criar um novo pedido.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4 max-h-[60vh] overflow-y-auto p-1 pr-4">
              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Cliente</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: João da Silva" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="orderType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Tipo do Pedido</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="retirada" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">Retirada</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="entrega" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">Entrega</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {orderType === 'entrega' && (
                <div className="space-y-4 rounded-md border bg-muted/50 p-4">
                   <FormField
                    control={form.control}
                    name="addressType"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Como informar o endereço?</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={(value) => {
                              field.onChange(value);
                              form.setValue('address', '');
                              form.setValue('locationLink', '');
                            }}
                            defaultValue={field.value}
                            className="flex flex-col space-y-2 pt-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="manual" />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                Digitar Endereço Manualmente
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="link" />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                Colar Link de Localização
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {addressType === 'manual' && (
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Endereço Completo</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Ex: Rua das Flores, 123, Bairro Jardim, Cidade - Estado, CEP 12345-678"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {addressType === 'link' && (
                    <FormField
                      control={form.control}
                      name="locationLink"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Link do Google Maps</FormLabel>
                          <FormControl>
                            <div className="relative">
                               <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Link className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <Input
                                placeholder="https://maps.app.goo.gl/..."
                                className="pl-10"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              )}
              
              <Separator />
              
              <div>
                <FormLabel>Itens do Pedido</FormLabel>
                <div className="space-y-3 mt-2">
                  {fields.map((field, index) => {
                    const selectedProduct = availableProducts.find(p => p.id === watchedItems[index]?.productId);
                    return (
                      <div key={field.id} className="flex flex-col gap-2 rounded-md border p-4">
                        <div className="flex items-start gap-2">
                          <FormField
                            control={form.control}
                            name={`items.${index}.productId`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <Popover open={openProductCombobox === index} onOpenChange={(isOpen) => setOpenProductCombobox(isOpen ? index : null)}>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openProductCombobox === index}
                                        className={cn(
                                          "w-full justify-between",
                                          !field.value && "text-muted-foreground"
                                        )}
                                      >
                                        {field.value
                                          ? availableProducts.find(
                                              (product) => product.id === field.value
                                            )?.name
                                          : "Selecione um produto"}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                                    <Command>
                                      <CommandInput placeholder="Pesquisar produto..." />
                                      <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
                                      <CommandList>
                                        {Object.entries(groupedProducts).map(([category, products]) => (
                                          <CommandGroup key={category} heading={category}>
                                            {products.map((product) => (
                                              <CommandItem
                                                value={product.name}
                                                key={product.id}
                                                onSelect={() => {
                                                  form.setValue(`items.${index}.productId`, product.id, { shouldValidate: true });
                                                  form.setValue(`items.${index}.size`, undefined, { shouldValidate: false });
                                                  setOpenProductCombobox(null)
                                                }}
                                              >
                                                <Check
                                                  className={cn(
                                                    "mr-2 h-4 w-4",
                                                    product.id === field.value
                                                      ? "opacity-100"
                                                      : "opacity-0"
                                                  )}
                                                />
                                                {product.name}
                                              </CommandItem>
                                            ))}
                                          </CommandGroup>
                                        ))}
                                      </CommandList>
                                    </Command>
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`items.${index}.quantity`}
                            render={({ field }) => (
                              <FormItem className="w-24">
                                <FormControl>
                                  <Input type="number" min="1" placeholder="Qtd." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remover item</span>
                          </Button>
                        </div>
                        {selectedProduct?.category === 'Pizza' && selectedProduct.sizes && (
                            <FormField
                                control={form.control}
                                name={`items.${index}.size`}
                                render={({ field }) => (
                                <FormItem className="pt-2">
                                    <FormLabel className="text-sm">Tamanho</FormLabel>
                                    <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="flex flex-wrap gap-x-4 gap-y-2"
                                    >
                                        {Object.keys(selectedProduct.sizes!).map((size) => (
                                        <FormItem key={size} className="flex items-center space-x-2 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value={size} />
                                            </FormControl>
                                            <FormLabel className="font-normal capitalize cursor-pointer">{size}</FormLabel>
                                        </FormItem>
                                        ))}
                                    </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        )}
                      </div>
                    )
                  })}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => append({ productId: '', quantity: 1, size: undefined })}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Adicionar Item
                </Button>
                <FormField
                  control={form.control}
                  name="items"
                  render={() => <FormMessage className="mt-2" />}
                />
              </div>
            </div>

            <DialogFooter className="pt-4 border-t">
              <DialogClose asChild>
                <Button type="button" variant="ghost">Cancelar</Button>
              </DialogClose>
              <Button type="submit">Salvar Pedido</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
