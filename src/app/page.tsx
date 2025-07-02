'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Pizza, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUser, userProfiles } from '@/contexts/user-context';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


export default function LoginPage() {
  const router = useRouter();
  const { setCurrentUser } = useUser();
  const [selectedUser, setSelectedUser] = useState<string>('admin');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser) {
      setCurrentUser(selectedUser);
      router.push('/dashboard');
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm shadow-2xl">
        <form onSubmit={handleLogin}>
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <Pizza className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="font-headline text-3xl">
              Pizzaria Bela Massa
            </CardTitle>
            <CardDescription>
              Selecione um usuário para entrar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user-select">Usuário</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger id="user-select">
                  <SelectValue placeholder="Selecione um usuário..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(userProfiles).map((profile) => (
                    <SelectItem key={profile.key} value={profile.key}>
                      <div className="flex items-center gap-2">
                         <span>{profile.name}</span>
                         <span className="text-xs text-muted-foreground">({profile.role})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90">
              <LogIn className="mr-2 h-4 w-4" />
              Entrar
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
