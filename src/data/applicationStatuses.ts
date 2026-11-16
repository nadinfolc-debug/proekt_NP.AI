export const applicationStatuses = [
  { value: "new", title: "Новая заявка", description: "Клиент отправил форму" },
  { value: "in_progress", title: "В работе", description: "Создание материалов" },
  { value: "review", title: "На согласовании", description: "Клиент проверяет результат" },
  { value: "done", title: "Завершён", description: "Материалы готовы к передаче" },
  { value: "delivered", title: "Работа сдана", description: "Результат передан клиенту" },
] as const;

export type ApplicationStatus = (typeof applicationStatuses)[number]["value"];

export function applicationStatus(value: string) {
  return applicationStatuses.find((status) => status.value === value) ?? applicationStatuses[0];
}
