# Maestro

Mod do Claude Code, który dzieli każde zadanie programistyczne na plan i wykonanie przez agentów.

1. **Plan** robi agent `Plan` na najmocniejszym modelu (`fable`, effort `high` lub `max`).
2. **Wykonanie**: każdy etap planu robi osobny agent z modelem i wysiłkiem dobranym do trudności (TRIVIAL: haiku/low, STANDARD: sonnet/medium, HARD: opus/high, CRITICAL: fable/high lub max). Niezależne etapy idą równolegle.
3. **Kontrola**: testy lub build po wykonaniu i krótkie podsumowanie.

Pytania, wyjaśnienia i zmiany na jedną linię pomija.

## Komendy

- `/maestro on` i `/maestro off` włączają i wyłączają zasady (stan zapamiętany między sesjami, domyślnie włączony)
- `/maestro status` pokazuje, czy jest włączony
- `/maestro rules` wyświetla treść zasad

Zmiana obowiązuje od nowego wątku (nowa sesja, `/clear` lub kompaktowanie rozmowy).

## Instalacja

W terminalu, w sesji Claude Code:

```
/plugin install maestro --marketplace <owner>/<repo>
```

Z powłoki:

```
claude plugin install maestro --marketplace <owner>/<repo>
```

W aplikacji desktopowej: kliknij + obok pola promptu, potem Plugins, Add marketplace z `<owner>/<repo>`, potem Add plugin.

Repozytorium jest prywatne: instalacja działa tylko dla osób, które je widzą na GitHubie i mają na komputerze dane logowania do github.com (klucz SSH albo `gh auth login` i `gh auth setup-git`).
