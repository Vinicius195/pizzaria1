'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { mockProducts } from '@/lib/mock-data';
import type { Product } from '@/types';
import { MoreHorizontal, PlusCircle, Search, Pizza } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AddProductDialog, type ProductFormValues } from '@/components/app/add-product-dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useUser } from '@/contexts/user-context';
import { Input } from '@/components/ui/input';

export default function ProdutosPage() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const { currentUser } = useUser();

  if (!currentUser) {
    return null; // Or a skeleton loader
  }

  const isManager = currentUser.role === 'Administrador';

  // Employee-facing menu view
  if (!isManager) {
    const availableProducts = mockProducts.filter(p => p.isAvailable);

    const filteredProducts = searchQuery
      ? availableProducts.filter(p =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : availableProducts;
    
    const groupedByCategory = filteredProducts.reduce((acc, product) => {
        const { category } = product;
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(product);
        return acc;
      }, {} as Record<Product['category'], Product[]>);
      
    const categoryOrder: (Product['category'])[] = ['Pizza', 'Bebida', 'Adicional'];

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-headline">Cardápio</h1>
            <p className="text-muted-foreground">Consulte os produtos, ingredientes e preços disponíveis.</p>
          </div>
          <div className="relative w-full sm:w-auto sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produto..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-8">
          {categoryOrder.map((category) => (
            groupedByCategory[category] && groupedByCategory[category].length > 0 && (
              <section key={category}>
                <h2 className="text-2xl font-bold font-headline mb-4 pb-2 border-b-2 border-primary/20">
                  {category === 'Adicional' ? 'Adicionais' : `${category}s`}
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {groupedByCategory[category].map((product) => (
                    <Card key={product.id} className="shadow-md flex flex-col justify-between">
                      <CardHeader>
                        <CardTitle className="text-lg font-headline">{product.name}</CardTitle>
                        {product.description && (
                          <CardDescription className="pt-1 text-sm">{product.description}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        {product.sizes ? (
                          <div className="space-y-2">
                            {Object.entries(product.sizes).map(([size, price]) => (
                              <div key={size} className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground capitalize">{size}</span>
                                <span className="font-semibold">
                                  {Number(price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : product.price ? (
                           <div className="text-xl font-bold text-right">
                              {Number(product.price).toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                              })}
                           </div>
                        ) : null}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )
          ))}
          {filteredProducts.length === 0 && (
               <div className="text-center text-muted-foreground py-16">
                  <Pizza className="mx-auto h-12 w-12" />
                  <h3 className="mt-4 text-lg font-semibold">Nenhum produto encontrado</h3>
                  <p className="mt-1 text-sm">Tente refinar sua busca. Apenas produtos disponíveis são exibidos.</p>
              </div>
          )}
        </div>
      </div>
    );
  }

  // Admin-facing management view
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
    let productData: Omit<Product, 'id' | 'isAvailable'>;
    
    if (data.category === 'Pizza') {
        productData = {
            name: data.name,
            category: 'Pizza',
            description: data.description,
            sizes: data.pizzaSizes
        };
    } else if (data.category === 'Bebida') {
        const drinkSizes = data.drinkSizes?.reduce((acc, variant) => {
            if (variant.name && variant.price) {
                acc[variant.name] = variant.price;
            }
            return acc;
        }, {} as Record<string, number>);

        productData = {
            name: data.name,
            category: 'Bebida',
            sizes: drinkSizes,
        };
    } else { // Adicional
        productData = {
            name: data.name,
            category: 'Adicional',
            price: data.price,
        };
    }

    if (editingProduct) {
        const updatedProduct = { ...editingProduct, ...productData };
        setProducts(prev =>
            prev.map(p =>
                p.id === editingProduct.id ? updatedProduct : p
            )
        );
        toast({
            title: "Produto Atualizado!",
            description: `O produto "${updatedProduct.name}" foi atualizado com sucesso.`,
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
            description: `O produto "${newProduct.name}" foi adicionado com sucesso.`,
        });
    }
  };

  const filteredProductsForAdmin = searchQuery
    ? products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products;

  const groupedProducts = filteredProductsForAdmin.reduce((acc, product) => {
    const { category } = product;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {} as Record<Product['category'], Product[]>);

  const categoryOrder: (Product['category'])[] = ['Pizza', 'Bebida', 'Adicional'];

  return (
    <>
      <AddProductDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmitProduct}
        product={editingProduct}
      />
      
       <AlertDialog open={!!deletingProduct} onOpenChange={(open) => !open && setDeletingProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso irá deletar permanentemente o produto
              <span className="font-bold"> "{deletingProduct ? deletingProduct.name : ''}"</span>.
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
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar produto..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={handleOpenAddDialog}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Produto
            </Button>
          </div>
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
                        </CardHeader>
                        <CardContent className="pt-0 pb-4 px-6">
                          {product.description && (
                            <p className="text-sm text-muted-foreground my-2 line-clamp-2" title={product.description}>
                              {product.description}
                            </p>
                          )}
                          {product.sizes && (
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
                           {product.price && (
                              <div className="text-lg font-bold text-right pt-2">
                                {product.price.toLocaleString('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL',
                                })}
                              </div>
                            )}
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
                        />
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </section>
            )
          ))}
           {filteredProductsForAdmin.length === 0 && searchQuery && (
             <div className="text-center text-muted-foreground py-16">
                <Pizza className="mx-auto h-12 w-12" />
                <h3 className="mt-4 text-lg font-semibold">Nenhum produto encontrado</h3>
                <p className="mt-1 text-sm">Tente refinar sua busca ou adicione um novo produto.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
