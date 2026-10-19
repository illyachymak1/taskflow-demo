
<template>
  <f7-page name="about">
    <f7-navbar title="Про застосунок" back-link="Назад" />

    <f7-block-title>TaskFlow</f7-block-title>

    <f7-block strong inset>
      <h2>TaskFlow — менеджер завдань</h2>

      <p>
        TaskFlow — це вебзастосунок для створення
        та керування особистими завданнями.
      </p>

      <p>
        Застосунок допомагає організувати роботу,
        відстежувати виконання завдань
        та контролювати їхні пріоритети.
      </p>
    </f7-block>

    <f7-block-title>Можливості застосунку</f7-block-title>

    <f7-list strong inset dividers>
      <f7-list-item title="Перегляд списку завдань" />
      <f7-list-item title="Додавання нових завдань" />
      <f7-list-item title="Позначення виконаних завдань" />
      <f7-list-item title="Відображення пріоритетів" />
    </f7-list>

    <f7-block strong inset>
      <p><b>Технології:</b> Vue 3, Vite, Framework7</p>
      <p><b>Версія:</b> 1.0</p>
    </f7-block>

    <f7-block-title>Допомога</f7-block-title>

    <f7-block>
      <f7-button fill href="/help/">
        Правила використання TaskFlow
      </f7-button>
    </f7-block>
  </f7-page>
</template>
