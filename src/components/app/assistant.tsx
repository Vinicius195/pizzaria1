'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Send, User, Loader2, Sparkles } from 'lucide-react';
import { useUser } from '@/contexts/user-context';
import { processAgentCommand } from '@/ai/flows/assistant-flow';
import { cn } from '@/lib/utils';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export function Assistant() {
  const { currentUser } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Olá! Como posso ajudar você a gerenciar a pizzaria hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || !currentUser) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const response = await processAgentCommand({
        command: currentInput,
        role: currentUser.role,
      });
      const assistantMessage: Message = { role: 'assistant', content: response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = { role: 'assistant', content: "Desculpe, ocorreu um erro ao processar sua solicitação." };
      setMessages(prev => [...prev, errorMessage]);
      console.error("Assistant error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg z-40 flex items-center justify-center bg-primary hover:bg-primary/90"
        onClick={() => setIsOpen(true)}
        aria-label="Abrir Assistente Virtual"
      >
        <Sparkles className="h-8 w-8 text-primary-foreground" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg h-[80vh] flex flex-col p-0 gap-0">
          <DialogHeader className="p-4 border-b">
            <DialogTitle>Assistente Virtual</DialogTitle>
            <DialogDescription>
              Peça ajuda para gerenciar a pizzaria.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 p-4" viewportRef={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={cn("flex items-start gap-3", message.role === 'user' ? 'justify-end' : '')}>
                  {message.role === 'assistant' && <Bot className="h-6 w-6 text-primary flex-shrink-0" />}
                  <div className={cn("p-3 rounded-lg max-w-sm", message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                   {message.role === 'user' && <User className="h-6 w-6 text-muted-foreground flex-shrink-0" />}
                </div>
              ))}
               {isLoading && (
                  <div className="flex items-start gap-3">
                     <Bot className="h-6 w-6 text-primary flex-shrink-0" />
                     <div className="p-3 rounded-lg bg-muted flex items-center">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                     </div>
                  </div>
               )}
            </div>
          </ScrollArea>
          <DialogFooter className="p-4 border-t bg-background">
            <div className="flex w-full items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }}}
                placeholder="Ex: informações do pedido 1003"
                disabled={isLoading}
                autoFocus
              />
              <Button onClick={handleSendMessage} disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
                <span className="sr-only">Enviar</span>
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
