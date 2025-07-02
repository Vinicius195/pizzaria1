'use client';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { mockProducts } from '@/lib/mock-data';
import Image from 'next/image';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';

export default function ProdutosPage() {
  return (
    <div className="space-y-6">
       <div className="flex flex-wrap items-center justify-between gap-4">
         <div>
          <h1 className="text-3xl font-bold font-headline">Produtos</h1>
          <p className="text-muted-foreground">Adicione, edite e gerencie seus produtos.</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar Produto
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {mockProducts.map((product) => (
          <Card key={product.id} className="shadow-md hover:shadow-lg transition-shadow flex flex-col">
            <CardHeader className="flex flex-row items-start justify-between pb-4">
              <div>
                <CardTitle className="text-xl font-headline leading-tight mb-1">{product.name}</CardTitle>
                 <Badge variant="outline">{product.category}</Badge>
              </div>
               <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button aria-haspopup="true" size="icon" variant="ghost">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Ações</DropdownMenuLabel>
                  <DropdownMenuItem>Editar</DropdownMenuItem>
                  <DropdownMenuItem>Duplicar</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive focus:text-destructive-foreground focus:bg-destructive">
                    Deletar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
             <CardContent className="flex-1 flex flex-col items-center justify-center text-center gap-4">
               <Image
                alt={product.name}
                className="aspect-square rounded-md object-cover"
                height="140"
                src={product.imageUrl}
                width="140"
                data-ai-hint="pizza food"
              />
               <div className="text-2xl font-bold">
                {product.price.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center bg-muted/50 py-3 px-4 border-t">
               <Label htmlFor={`available-${product.id}`} className="text-sm font-medium text-muted-foreground cursor-pointer">
                Disponível
              </Label>
               <Switch
                id={`available-${product.id}`}
                checked={product.isAvailable}
                aria-label={`Disponibilidade do produto ${product.name}`}
              />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
