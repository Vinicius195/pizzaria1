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
  FormDescription as FormDescriptionUI,
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
import { Check, ChevronsUpDown, Link, Phone, PlusCircle, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { getMockSettings } from '@/lib/settings-data';
import { Switch } from '../ui/switch';
import { useUser } from '@/contexts/user-context';

const orderItemSchema = z.object({
  productId: z.string().min(1, "Selecione um produto."),
  product2Id: z.string().optional(), // For the second half
  isHalfHalf: z.boolean().default(false),
  quantity: z.coerce.number().min(1, "A quantidade deve ser pelo menos 1."),
  size: z.custom<PizzaSize>().optional(),
});

const addOrderSchema = z.object({
  customerName: z.string().min(2, "O nome do cliente é obrigatório."),
  customerPhone: z.string().optional(),
  orderType: z.enum(['entrega', 'retirada'], {
    required_error: 'Selecione o tipo de pedido.',
  }),
  items: z.array(orderItemSchema).min(1, "Adicione pelo menos um item ao pedido."),
  addressType: z.enum(['manual', 'link']).default('manual'),
  address: z.string().optional(),
  locationLink: z.string().optional(),
  notes: z.string().optional(),
}).superRefine((data, ctx) => {
    data.items.forEach((item, index) => {
      const product1 = mockProducts.find(p => p.id === item.productId);

      if (item.isHalfHalf) {
          const product2 = mockProducts.find(p => p.id === item.product2Id);
          if (!product1 || product1.category !== 'Pizza') {
             ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "O primeiro sabor deve ser uma pizza.",
                path: [`items`, index, `productId`],
             });
          }
           if (!item.product2Id) {
             ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Selecione o segundo sabor.",
                path: [`items`, index, `product2Id`],
             });
          } else if (!product2 || product2.category !== 'Pizza') {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "O segundo sabor deve ser uma pizza.",
                path: [`items`, index, `product2Id`],
             });
          }

          if (!item.size) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Selecione o tamanho da pizza.",
                path: [`items`, index, `size`],
            });
          }
      } else if (product1?.category === 'Pizza') {
        if (!item.size) {
           ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Selecione o tamanho da pizza.",
              path: [`items`, index, `size`],
           });
        } else if (!product1.sizes || !product1.sizes[item.size]) {
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
  const [openProduct2Combobox, setOpenProduct2Combobox] = useState<number | null>(null);
  const { currentUser } = useUser();
  const isManager = currentUser?.role === 'Administrador';

  const form = useForm<AddOrderFormValues>({
    resolver: zodResolver(addOrderSchema),
    defaultValues: {
      customerName: '',
      customerPhone: '',
      orderType: 'retirada',
      items: [{ productId: '', product2Id: undefined, isHalfHalf: false, quantity: 1, size: undefined }],
      addressType: 'manual',
      address: '',
      locationLink: '',
      notes: '',
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
  const availablePizzas = availableProducts.filter((p) => p.category === 'Pizza');
  
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
  
  const getProductDisplayName = (product: Product): string => {
    if (product.category === 'Bebida' && product.volume) {
        return `${product.name} ${product.volume}`;
    }
    return product.name;
  };

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
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  name="customerPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone (Opcional)</FormLabel>
                      <FormControl>
                        <div className="relative">
                           <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                           </div>
                           <Input type="tel" placeholder="(00) 90000-0000" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                        {isManager && (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="entrega" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">Entrega</FormLabel>
                          </FormItem>
                        )}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {orderType === 'entrega' && isManager && (
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
                    const isFirstFlavorPizza = selectedProduct?.category === 'Pizza';
                    const isHalfHalf = watchedItems[index]?.isHalfHalf ?? false;
                    return (
                      <div key={field.id} className="flex flex-col gap-3 rounded-md border p-4">
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
                                          ? getProductDisplayName(availableProducts.find(
                                              (product) => product.id === field.value
                                            )!)
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
                                                value={getProductDisplayName(product)}
                                                key={product.id}
                                                onSelect={() => {
                                                  form.setValue(`items.${index}.productId`, product.id, { shouldValidate: true });
                                                  form.setValue(`items.${index}.size`, undefined, { shouldValidate: true });
                                                  form.setValue(`items.${index}.isHalfHalf`, false, { shouldValidate: true });
                                                  form.setValue(`items.${index}.product2Id`, undefined, { shouldValidate: true });
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
                                                {getProductDisplayName(product)}
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

                        {isFirstFlavorPizza && (
                            <FormField
                                control={form.control}
                                name={`items.${index}.isHalfHalf`}
                                render={({ field: switchField }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border bg-muted/30 p-3 shadow-sm">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-sm font-medium">
                                            Pizza Meio a Meio?
                                        </FormLabel>
                                        <FormDescriptionUI className="text-xs">
                                            Será cobrado o valor do sabor mais caro.
                                        </FormDescriptionUI>
                                    </div>
                                    <FormControl>
                                    <Switch
                                        checked={switchField.value}
                                        onCheckedChange={(checked) => {
                                            switchField.onChange(checked);
                                            if (!checked) {
                                                form.setValue(`items.${index}.product2Id`, undefined, { shouldValidate: true });
                                            }
                                        }}
                                    />
                                    </FormControl>
                                </FormItem>
                                )}
                            />
                        )}

                        {isHalfHalf && (
                             <FormField
                                control={form.control}
                                name={`items.${index}.product2Id`}
                                render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>2º Sabor da Pizza</FormLabel>
                                    <Popover open={openProduct2Combobox === index} onOpenChange={(isOpen) => setOpenProduct2Combobox(isOpen ? index : null)}>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            className={cn(
                                            "w-full justify-between",
                                            !field.value && "text-muted-foreground"
                                            )}
                                        >
                                            {field.value
                                            ? availablePizzas.find((p) => p.id === field.value)?.name
                                            : "Selecione o segundo sabor"}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                                        <Command>
                                        <CommandInput placeholder="Pesquisar pizza..." />
                                        <CommandEmpty>Nenhuma pizza encontrada.</CommandEmpty>
                                        <CommandList>
                                            <CommandGroup>
                                            {availablePizzas.map((pizza) => (
                                                <CommandItem
                                                value={pizza.name}
                                                key={pizza.id}
                                                onSelect={() => {
                                                    form.setValue(`items.${index}.product2Id`, pizza.id, { shouldValidate: true });
                                                    setOpenProduct2Combobox(null)
                                                }}
                                                >
                                                <Check
                                                    className={cn(
                                                    "mr-2 h-4 w-4",
                                                    pizza.id === field.value ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                {pizza.name}
                                                </CommandItem>
                                            ))}
                                            </CommandGroup>
                                        </CommandList>
                                        </Command>
                                    </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        )}

                        {isFirstFlavorPizza && (
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
                                        {Object.keys(selectedProduct.sizes!)
                                            .filter(
                                                (size) => getMockSettings().sizeAvailability[size as PizzaSize]
                                            )
                                            .map((size) => (
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
                  onClick={() => append({ productId: '', product2Id: undefined, isHalfHalf: false, quantity: 1, size: undefined })}
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

              <Separator className="my-4" />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ex: Pizza sem cebola, troco para R$100, etc."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
