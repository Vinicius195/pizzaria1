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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockProducts } from '@/lib/mock-data';
import { MapPin, PlusCircle, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

const orderItemSchema = z.object({
  productId: z.string().min(1, "Selecione um produto."),
  quantity: z.coerce.number().min(1, "A quantidade deve ser pelo menos 1."),
});

const addOrderSchema = z.object({
  customerName: z.string().min(2, "O nome do cliente é obrigatório."),
  orderType: z.enum(['entrega', 'retirada'], {
    required_error: 'Selecione o tipo de pedido.',
  }),
  items: z.array(orderItemSchema).min(1, "Adicione pelo menos um item ao pedido."),
  address: z.string().optional(),
}).refine(data => {
    if (data.orderType === 'entrega' && (!data.address || data.address.trim().length < 10)) {
        return false;
    }
    return true;
}, {
    message: "O endereço é obrigatório e deve ter pelo menos 10 caracteres.",
    path: ["address"],
});

type AddOrderFormValues = z.infer<typeof addOrderSchema>;

interface AddOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddOrderDialog({ open, onOpenChange }: AddOrderDialogProps) {
  const { toast } = useToast();
  const form = useForm<AddOrderFormValues>({
    resolver: zodResolver(addOrderSchema),
    defaultValues: {
      customerName: '',
      orderType: 'retirada',
      items: [{ productId: '', quantity: 1 }],
      address: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const orderType = form.watch('orderType');
  
  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  }

  function onSubmit(data: AddOrderFormValues) {
    // In a real app, you would add the new order to your data source.
    // For this prototype, we'll just show a success message.
    console.log('Novo Pedido:', data);
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
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço de Entrega</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Textarea
                            placeholder="Ex: Rua das Flores, 123, Bairro Jardim, Cidade - Estado, CEP 12345-678"
                            className="pr-10"
                            {...field}
                          />
                          <Button type="button" variant="ghost" size="icon" className="absolute top-1/2 right-1 -translate-y-1/2 h-8 w-8">
                              <MapPin className="h-4 w-4" />
                              <span className="sr-only">Usar localização</span>
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <Separator />
              
              <div>
                <FormLabel>Itens do Pedido</FormLabel>
                <div className="space-y-3 mt-2">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-start gap-2">
                      <FormField
                        control={form.control}
                        name={`items.${index}.productId`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione um produto" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {mockProducts.filter(p => p.isAvailable).map(product => (
                                  <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
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
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => append({ productId: '', quantity: 1 })}
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
