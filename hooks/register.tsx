import type { Register } from 'claude-code'

const RULES = `# Maestro: plan i wykonanie

Przy każdym zadaniu programistycznym (nowa funkcja, poprawka, refaktor, debugowanie, testy) pracuj w dwóch fazach. Pomiń to tylko dla pytań, wyjaśnień i zmian na jedną linię.

## Faza 1: PLAN (najmocniejszy model)
Uruchom agenta (Agent, subagent_type "Plan") z model "fable" i effort "high" (effort "max" dla zadań architektonicznych lub bardzo niejasnych). Podaj mu cel użytkownika i kontekst. Plan ma zwrócić listę etapów, a przy każdym:
- cel i kryterium ukończenia (jak sprawdzić, że działa),
- pliki do zmiany,
- zależności od innych etapów i informację, czy można je wykonać równolegle,
- ocenę trudności: TRIVIAL / STANDARD / HARD / CRITICAL,
- ostatni etap: weryfikacja (testy, build, lint).
Pokaż użytkownikowi plan w skrócie i dopiero wykonuj. Jeśli plan wymaga decyzji użytkownika, zapytaj przed startem.

## Faza 2: WYKONANIE (agenci dobrani do trudności)
Każdy etap wykonuje osobny agent (general-purpose). Dobierz model i effort:
- TRIVIAL (zmiana nazw, formatowanie, proste szukanie, boilerplate): model "haiku", effort "low".
- STANDARD (typowa implementacja, testy, drobne poprawki): model "sonnet", effort "medium".
- HARD (złożona logika, współbieżność, subtelne błędy, refaktor wielu plików): model "opus", effort "high".
- CRITICAL (bezpieczeństwo, migracje danych, architektura, trudny debugging): model "fable", effort "high" lub "max".
Prompt agenta musi być samowystarczalny: cel, kryterium ukończenia, pliki, ograniczenia z planu. Etapy niezależne uruchamiaj równolegle (jedna wiadomość, wiele wywołań Agent), zależne po kolei.

## Faza 3: KONTROLA
Po wykonaniu zweryfikuj wynik (uruchom testy/build). Przy błędzie wyślij poprawkę do agenta o tym samym lub wyższym poziomie. Na koniec podsumuj: co zrobiono, jakie modele użyto, co zweryfikowano.

Użytkownik wyraźnie prosi o dobór modelu i effort według powyższych zasad, więc ustawiaj oba parametry przy każdym wywołaniu Agent.`

const isOn = async ($: { store: { get: (k: string) => Promise<unknown> } }) =>
  (await $.store.get('enabled')) !== false

export const register: Register = (on) => {
  on('prompt.compose', async ($, e, next) => {
    const out = await next(e)
    if (!(await isOn($))) return out
    return {
      sections: [
        ...out.sections,
        { id: 'maestro:rules', text: RULES, scope: 'session' },
      ],
    }
  })

  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'maestro',
      description: 'Maestro: on | off | status | rules',
      argumentHint: 'on|off|status|rules',
    })
    $.ui.status((await isOn($)) ? 'Maestro: on' : 'Maestro: off')
    return next(e)
  })

  on('command.run', { command: 'maestro' }, async ($, e) => {
    const arg = e.args.trim().toLowerCase()
    if (arg === 'on' || arg === 'off') {
      await $.store.set('enabled', arg === 'on')
      $.ui.status(arg === 'on' ? 'Maestro: on' : 'Maestro: off')
      return {
        text: `Maestro: ${arg}. Zmiana obejmie nowy wątek (nowa sesja, /clear lub kompaktowanie rozmowy); bieżący wątek zachowuje dotychczasowy prompt systemowy.`,
      }
    }
    if (arg === 'rules') return { text: RULES }
    return {
      text: `Maestro jest ${(await isOn($)) ? 'włączony' : 'wyłączony'}. Użycie: /maestro on | off | status | rules`,
    }
  })
}
