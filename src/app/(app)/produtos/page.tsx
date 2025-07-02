'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { mockProducts } from '@/lib/mock-data';
import type { Product, PizzaSize } from '@/types';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AddProductDialog, type ProductFormValues } from '@/components/app/add-product-dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useUser } from '@/contexts/user-context';

export default function ProdutosPage() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const { toast } = useToast();
  const { currentUser } = useUser();
  const isManager = currentUser.role === 'Administrador';

  const handleToggleAvailable = (productId: string, isAvailable: boolean) => {
    setProducts(prev =>
      prev.map(p =>
        p.id === productId ? { ...p, isAvailable } : p
      )
    );
  };
  
  const handleOpenAddDialog = () => {
    setEditingProduct(null);
    setIsDialogOpen(true);
  };
  
  const handleOpenEditDialog = (product: Product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const handleDuplicateProduct = (product: Product) => {
    const newProduct: Product = {
      ...product,
      id: String(Date.now()),
      name: `${product.name} (Cópia)`,
    };
    setProducts(prev => [...prev, newProduct]);
    toast({
      title: "Produto Duplicado!",
      description: `O produto "${product.name}" foi duplicado com sucesso.`,
    });
  };

  const handleConfirmDelete = () => {
    if (!deletingProduct) return;
    setProducts(prev => prev.filter(p => p.id !== deletingProduct.id));
    toast({
      variant: "destructive",
      title: "Produto Deletado!",
      description: `O produto "${deletingProduct.name}" foi removido.`,
    });
    setDeletingProduct(null);
  };
  
  const handleSubmitProduct = (data: ProductFormValues) => {
    const commonData = {
        name: data.name,
        category: data.category,
        description: data.description,
    };

    let productData: Omit<Product, 'id' | 'isAvailable'>;

    if (data.category === 'Pizza') {
        productData = {
            ...commonData,
            category: 'Pizza',
            sizes: Object.fromEntries(
                Object.entries(data.sizes || {}).filter(([, price]) => price && price > 0)
            ) as Partial<Record<PizzaSize, number>>,
        };
    } else {
        productData = {
            ...commonData,
            category: data.category,
            price: data.price,
            volume: data.volume,
        };
    }

    if (editingProduct) {
        setProducts(prev =>
            prev.map(p =>
                p.id === editingProduct.id ? { ...p, ...productData } : p
            )
        );
        toast({
            title: "Produto Atualizado!",
            description: `O produto "${data.name}" foi atualizado com sucesso.`,
        });
    } else {
        const newProduct: Product = {
            id: String(Date.now()),
            isAvailable: true,
            ...productData,
        };
        setProducts(prev => [...prev, newProduct]);
        toast({
            title: "Produto Adicionado!",
            description: `O produto "${data.name}" foi adicionado com sucesso.`,
        });
    }
  };

  const groupedProducts = products.reduce((acc, product) => {
    const { category } = product;
    if (category === 'Bebida') return acc; // Bebidas são tratadas separadamente
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {} as Record<'Pizza' | 'Adicional', Product[]>);

  const drinkGroups = products
    .filter((p) => p.category === 'Bebida')
    .reduce((acc, product) => {
        const volume = product.volume || 'Tamanho único';
        if (!acc[volume]) {
            acc[volume] = [];
        }
        acc[volume].push(product);
        return acc;
    }, {} as Record<string, Product[]>);

  const categoryOrder: ('Pizza' | 'Adicional')[] = ['Pizza', 'Adicional'];

  return (
    <>
      {isManager && (
        <AddProductDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSubmit={handleSubmitProduct}
          product={editingProduct}
        />
      )}
      
       <AlertDialog open={!!deletingProduct} onOpenChange={(open) => !open && setDeletingProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso irá deletar permanentemente o produto
              <span className="font-bold"> "{deletingProduct?.name}"</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingProduct(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Deletar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-headline">Produtos</h1>
            <p className="text-muted-foreground">Adicione, edite e gerencie seus produtos.</p>
          </div>
          {isManager && (
            <Button onClick={handleOpenAddDialog}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Produto
            </Button>
          )}
        </div>

        <div className="space-y-8">
          {categoryOrder.map((category) => (
            groupedProducts[category] && groupedProducts[category].length > 0 && (
              <section key={category}>
                <h2 className="text-2xl font-bold font-headline mb-4 pb-2 border-b-2 border-primary/20">
                  {category === 'Adicional' ? 'Adicionais' : `${category}s`}
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                  {groupedProducts[category].map((product) => (
                    <Card key={product.id} className="shadow-md hover:shadow-lg transition-shadow flex flex-col justify-between">
                      <div>
                        <CardHeader className="flex flex-row items-start justify-between pb-2">
                          <CardTitle className="text-lg font-headline truncate" title={product.name}>
                            {product.name}
                          </CardTitle>
                          {isManager && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Toggle menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleOpenEditDialog(product)}>
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDuplicateProduct(product)}>
                                  Duplicar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive-foreground focus:bg-destructive"
                                  onClick={() => setDeletingProduct(product)}
                                >
                                  Deletar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </CardHeader>
                        <CardContent className="pt-0 pb-4 px-6">
                          {product.category === 'Pizza' && product.description && (
                            <p className="text-sm text-muted-foreground my-2 line-clamp-2" title={product.description}>
                              {product.description}
                            </p>
                          )}
                          {product.category === 'Pizza' && product.sizes && (
                            <div className="my-2 space-y-1">
                              {Object.entries(product.sizes).map(([size, price]) => (
                                <div key={size} className="flex justify-between items-center text-sm">
                                  <span className="text-muted-foreground capitalize">{size}</span>
                                  <span className="font-semibold">
                                    {price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center justify-between pt-2">
                            <Badge variant="outline">{product.category}</Badge>
                            {product.category !== 'Pizza' && product.price && (
                              <div className="text-lg font-bold">
                                {product.price.toLocaleString('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL',
                                })}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </div>
                      <CardFooter className="flex justify-between items-center bg-muted/50 py-3 px-4 border-t">
                        <Label htmlFor={`available-${product.id}`} className="text-sm font-medium text-muted-foreground cursor-pointer">
                          Disponível
                        </Label>
                        <Switch
                          id={`available-${product.id}`}
                          checked={product.isAvailable}
                          onCheckedChange={(checked) => handleToggleAvailable(product.id, checked)}
                          aria-label={`Disponibilidade do produto ${product.name}`}
                          disabled={!isManager}
                        />
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </section>
            )
          ))}

          {Object.keys(drinkGroups).length > 0 && (
            <section>
              <h2 className="text-2xl font-bold font-headline mb-4 pb-2 border-b-2 border-primary/20">
                Bebidas
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                {Object.entries(drinkGroups).map(([volume, drinkList]) => (
                  <Card key={volume} className="shadow-md hover:shadow-lg transition-shadow flex flex-col">
                    <CardHeader>
                      <CardTitle className="text-lg font-headline">{volume}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 pb-4 px-6 flex-1">
                      <div className="space-y-3">
                        {drinkList.map((drink) => (
                          <div key={drink.id} className="flex items-center justify-between gap-2">
                            <div className="flex-1 space-y-1">
                              <Label htmlFor={`available-${drink.id}`} className="font-normal text-sm truncate" title={drink.name}>
                                {drink.name}
                              </Label>
                              <div className="text-sm font-semibold text-muted-foreground">
                                 {Number(drink.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                              </div>
                            </div>
                            <div className="flex items-center shrink-0">
                               <Switch
                                id={`available-${drink.id}`}
                                checked={drink.isAvailable}
                                onCheckedChange={(checked) => handleToggleAvailable(drink.id, checked)}
                                aria-label={`Disponibilidade do produto ${drink.name}`}
                                disabled={!isManager}
                              />
                              {isManager && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button aria-haspopup="true" size="icon" variant="ghost" className="h-8 w-8">
                                      <MoreHorizontal className="h-4 w-4" />
                                      <span className="sr-only">Toggle menu for {drink.name}</span>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => handleOpenEditDialog(drink)}>
                                      Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDuplicateProduct(drink)}>
                                      Duplicar
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-destructive focus:text-destructive-foreground focus:bg-destructive"
                                      onClick={() => setDeletingProduct(drink)}
                                    >
                                      Deletar
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
