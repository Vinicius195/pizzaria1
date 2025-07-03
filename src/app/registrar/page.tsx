'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Pizza, UserPlus, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/user-context';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { UserRole } from '@/types';

const registerSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  email: z.string().email("Por favor, insira um email válido."),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
  role: z.enum(['Administrador', 'Funcionário'], {
    required_error: "Selecione um tipo de conta.",
  }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { registerUser } = useUser();
  const [formFeedback, setFormFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'Funcionário'
    },
  });

  const handleRegister = async (data: RegisterFormValues) => {
    setFormFeedback(null);
    const result = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role as UserRole,
    });
    
    setFormFeedback({ type: result.success ? 'success' : 'error', message: result.message });

    if (result.success) {
        form.reset();
        setTimeout(() => {
            router.push('/');
        }, 3000); // Redirect to login page after 3 seconds
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
            <Pizza className="mx-auto h-14 w-14 text-primary" />
            <h1 className="mt-4 font-headline text-4xl font-bold tracking-tighter">
              Criar Conta
            </h1>
            <p className="mt-2 text-muted-foreground">
              Preencha seus dados para solicitar acesso
            </p>
        </div>
        <Card className="shadow-2xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleRegister)} className="space-y-6">
              <CardContent className="space-y-4 pt-6">
                {formFeedback && (
                   <Alert variant={formFeedback.type === 'error' ? 'destructive' : 'default'} className={formFeedback.type === 'success' ? 'border-green-500/50 text-green-700 dark:border-green-500 [&>svg]:text-green-500' : ''}>
                      {formFeedback.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                      <AlertTitle>{formFeedback.type === 'error' ? 'Erro no Cadastro' : 'Sucesso!'}</AlertTitle>
                      <AlertDescription>
                        {formFeedback.message}
                      </AlertDescription>
                    </Alert>
                )}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Seu nome" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                            type="email"
                            placeholder="seu.nome@email.com"
                            {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute inset-y-0 right-0 h-full px-3 text-muted-foreground hover:bg-transparent hover:text-foreground"
                            onClick={() => setShowPassword((prev) => !prev)}
                            tabIndex={-1}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                            <span className="sr-only">
                              {showPassword ? 'Esconder senha' : 'Mostrar senha'}
                            </span>
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Conta</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo de conta" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Funcionário">Funcionário</SelectItem>
                          <SelectItem value="Administrador">Administrador</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={form.formState.isSubmitting}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Criar Conta
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
         <div className="text-center text-sm">
          <p className="text-muted-foreground">
            Já tem uma conta?{' '}
            <Link href="/" className="font-medium text-primary underline-offset-4 hover:underline">
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
