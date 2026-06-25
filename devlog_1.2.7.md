# Devlog — El Gran Capitalista v1.2.7

¡Hola a todos! Después de varias semanas de trabajo intenso, aquí va un resumen de todo lo que ha cambiado desde la v1.2.0. Ha sido una actualización enorme, así que voy por partes.

---

## 🐛 Corrección de bugs críticos

La v1.2.1 llegó para resolver un bug bastante feo: al volver al juego después de un tiempo, la pantalla se quedaba en negro. El culpable era el popup de ganancias offline, que intentaba leer un valor que no existía y crasheaba toda la interfaz. Ya está resuelto y las ganancias offline aparecen correctamente.

También se corrigió un bug en las **misiones en cadena** que mostraba un contador falso de misiones disponibles aunque no hubiera nada que reclamar. Ahora el badge solo aparece cuando hay algo real que cobrar.

---

## 🏆 Ranking propio y tabla en tiempo real

El ranking salió de la pestaña de Logros donde estaba escondido y ahora tiene **su propia pestaña**. Además:

- La tabla se **actualiza automáticamente cada minuto** sin que tengas que pulsar nada.
- Tu puntuación se **sube al servidor cada 5 minutos** de forma automática, ya no hace falta prestigiar o pulsar "Actualizar" para aparecer en el global.
- El ranking regional (Europa, América, etc.) ya funciona correctamente.

---

## 📈 Cripto con P&L real

La sección de criptomonedas ahora calcula el **precio medio de compra real** usando media ponderada. Esto significa que si compras en varios momentos distintos, el P&L (ganancia/pérdida) refleja exactamente cuánto estás ganando o perdiendo sobre tu inversión real, igual que en una app de bolsa de verdad.

---

## 🖥️ Interfaz y layout

- Las tarjetas de **Negocios, Mejoras, Managers y Misiones** ahora se adaptan en cuadrícula y aprovechan mejor el ancho de pantalla.
- El **panel izquierdo** es más compacto para dejar más espacio al contenido principal.
- En **Ajustes** hay nuevos botones de escala de interfaz: 75%, 90%, 100%, 110%, 125%, 150%, 175% y 200%. Si el juego se ve pequeño en tu pantalla, prueba 125% o 150%.

---

## ⬆️ Sistema de actualizaciones mejorado

Antes las actualizaciones se descargaban en silencio y era difícil saber qué estaba pasando. Ahora hay una **ventana de progreso** que muestra:

- Porcentaje descargado
- Velocidad de descarga en MB/s
- MB descargados / total
- Botón para instalar al terminar o dejarlo para cuando cierres el juego

---

## 🎬 Pantalla de carga

La pantalla de carga tiene un nuevo diseño más limpio y elegante, centrado correctamente en todos los monitores.

---

Eso es todo por esta actualización. Queda mucho trabajo por delante — más contenido, más balanceo y muchas mejoras de interfaz. ¡Gracias por jugar!

— Pedro
