// Il campione che rappresenta una materia nei riquadri (campo `campione` di
// materia.json): ne restituisce nome, foto originale e miniatura. Solo lato
// server: il JSON del campionario non va nei componenti del browser.
import campioni from "../../content/campionario/campioni.json";
import { miniatura } from "@/lib/foto";

interface Voce {
  id: string;
  nome: string;
  foto?: { file: string };
}

export function fotoCampione(id: string | undefined): { nome: string; file: string; mini: string } | undefined {
  const c = (campioni as Voce[]).find((x) => x.id === id);
  return c?.foto ? { nome: c.nome, file: c.foto.file, mini: miniatura(c.foto.file) } : undefined;
}
