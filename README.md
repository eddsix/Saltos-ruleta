# European Roulette Jumps

Aplicación independiente para registrar resultados de ruleta europea y calcular los saltos entre pockets.

## Funciones

- Introducción manual de resultados `0–36`.
- El resultado más reciente aparece siempre primero.
- Cálculo de saltos usando el orden real de la rueda europea.
- Saltos firmados desde `-18` hasta `+18`.
- 18 casillas: `±1` hasta `±18`.
- Una casilla se vuelve roja cuando aparece un salto de esa magnitud, tanto positivo como negativo.
- El contador de cada casilla indica cuántas veces apareció esa magnitud durante la sesión.
- `Borrar historial` reinicia resultados, saltos y contadores.

## Convención

El orden utilizado es:

`0 → 32 → 15 → 19 → 4 → 21 → 2 → 25 → 17 → 34 → 6 → 27 → 13 → 36 → 11 → 30 → 8 → 23 → 10 → 5 → 24 → 16 → 33 → 1 → 20 → 14 → 31 → 9 → 22 → 18 → 29 → 7 → 28 → 12 → 35 → 3 → 26`

El movimiento hacia adelante en esta secuencia se considera positivo.

Ejemplos:

- `17 → 34 = +1`
- `17 → 6 = +2`
- `17 → 15 = -6`

## Uso

No requiere instalación ni servidor.

Abre `index.html` en un navegador.

## Nota

Esta versión es únicamente un registrador y analizador visual de saltos. No contiene predicciones ni sistemas de apuestas.
