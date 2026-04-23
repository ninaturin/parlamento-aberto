import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato — Dashboard de Emendas" },
      {
        name: "description",
        content: "Fale com a equipe responsável pelo Dashboard de Emendas Parlamentares.",
      },
    ],
  }),
  component: Contato,
});

function Contato() {
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEnviando(true);
    setTimeout(() => {
      setEnviando(false);
      (e.target as HTMLFormElement).reset();
      toast.success("Mensagem registrada", {
        description: "Obrigado pelo contato. Entraremos em contato em breve.",
      });
    }, 600);
  };

  return (
    <AppLayout title="Contato" subtitle="Tire dúvidas, envie sugestões ou reporte inconsistências" showFilters={false}>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionCard title="Envie sua mensagem">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="nome">Nome</Label>
                  <Input id="nome" name="nome" required placeholder="Seu nome" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" name="email" type="email" required placeholder="seu@email.com" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="assunto">Assunto</Label>
                <Input id="assunto" name="assunto" required placeholder="Sobre o que deseja falar?" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mensagem">Mensagem</Label>
                <Textarea
                  id="mensagem"
                  name="mensagem"
                  required
                  rows={6}
                  placeholder="Escreva sua mensagem..."
                />
              </div>
              <Button type="submit" disabled={enviando} className="gap-2">
                <Send className="h-4 w-4" />
                {enviando ? "Enviando..." : "Enviar mensagem"}
              </Button>
            </form>
          </SectionCard>
        </div>
        <div className="space-y-4">
          <SectionCard title="Informações">
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 text-secondary" />
                <div>
                  <p className="font-medium text-foreground">E-mail</p>
                  <p className="text-muted-foreground">transparencia@exemplo.gov.br</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 text-secondary" />
                <div>
                  <p className="font-medium text-foreground">Telefone</p>
                  <p className="text-muted-foreground">(11) 0000-0000</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-secondary" />
                <div>
                  <p className="font-medium text-foreground">Endereço</p>
                  <p className="text-muted-foreground">São Paulo, SP — Brasil</p>
                </div>
              </li>
            </ul>
          </SectionCard>
          <SectionCard title="Sobre os dados">
            <p className="text-xs leading-relaxed text-muted-foreground">
              As informações deste painel são extraídas dos arquivos públicos de emendas
              parlamentares impositivas da Assembleia Legislativa do Estado de São Paulo (ALESP).
              Os valores apresentados refletem o que consta nos registros oficiais — sem
              inferências de valores indicados ou recebidos antes do efetivo pagamento.
            </p>
          </SectionCard>
        </div>
      </div>
    </AppLayout>
  );
}
