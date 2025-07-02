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
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Pizza, LogIn, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/user-context';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const loginSchema = z.object({
  email: z.string().email("Por favor, insira um e-mail válido."),
  password: z.string().min(1, "A senha é obrigatória."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useUser();
  const [loginError, setLoginError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleLogin = (data: LoginFormValues) => {
    setLoginError(null);
    const success = login(data.email, data.password);
    if (success) {
      router.push('/dashboard');
    } else {
      setLoginError("E-mail ou senha inválidos. Tente novamente.");
      form.resetField('password');
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
            <Pizza className="mx-auto h-14 w-14 text-primary" />
            <h1 className="mt-4 font-headline text-4xl font-bold tracking-tighter">
              Pizzaria Bela Massa
            </h1>
            <p className="mt-2 text-muted-foreground">
              Faça login para gerenciar sua pizzaria
            </p>
        </div>
        <Card className="shadow-2xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-6">
              <CardContent className="space-y-4 pt-6">
                {loginError && (
                   <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Erro de Autenticação</AlertTitle>
                      <AlertDescription>
                        {loginError}
                      </AlertDescription>
                    </Alert>
                )}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Ex: sergio.lemos@belamassa.com" {...field} />
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
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={form.formState.isSubmitting}>
                  <LogIn className="mr-2 h-4 w-4" />
                  Entrar
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
        <div className="text-center text-xs text-muted-foreground">
          <p>Use <span className="font-semibold">sergio.lemos@belamassa.com</span> (senha: admin) para acesso de Administrador.</p>
          <p>Use <span className="font-semibold">beatriz.costa@belamassa.com</span> (senha: func) para acesso de Funcionário.</p>
        </div>
      </div>
    </div>
  );
}
