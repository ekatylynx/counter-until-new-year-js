const input = document.getElementById('dateInput'); // поле даты (dd.mm.yyyy)
const btn = document.getElementById('calcBtn'); // кнопка "Посчитать"
const daysOut = document.getElementById('daysOut'); // Первый див куда записываем кол-во дней до НГ 31.12.yy
const leapOut = document.getElementById('leapOut'); // Второй див куда записываем високосный год или нет
const errorOut = document.getElementById('errorOut'); // Див для отображения ошибок

// Функция для проверки високосности года
function isLeapYear(year) {
  // Високосный: кратен 4, но не кратен 100; однако кратный 400 — високосный
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

// Функция для проверки по регулярке в формате dd.mm.yyyy.
function parseRuDateStrict(value) {
  // Ожидаем строго dd.mm.yyyy
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value.trim());
  if (!m) return null;
  // преобразование значений в числа
  const dd = Number(m[1]);
  const mm = Number(m[2]);
  const yyyy = Number(m[3]);
  if (mm < 1 || mm > 12) return null;
  if (dd < 1 || dd > 31) return null;
  // Кол-во дней в месяце с учётом високосности
  const daysInMonth = [31, isLeapYear(yyyy) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (dd > daysInMonth[mm - 1]) return null;
  // Создаём дату в UTC, чтобы избежать проблем с часовыми поясами/DST
  const utc = Date.UTC(yyyy, mm - 1, dd);
  return { dd, mm, yyyy, dateUtc: new Date(utc) };
}

function daysDiffUtc(aUtcDate, bUtcDate) {
  // Обнуляем время по UTC и считаем разницу в целых днях
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  // Нормализуем обе даты до полуночи по UTC
  const a = Date.UTC(aUtcDate.getUTCFullYear(), aUtcDate.getUTCMonth(), aUtcDate.getUTCDate());
  const b = Date.UTC(bUtcDate.getUTCFullYear(), bUtcDate.getUTCMonth(), bUtcDate.getUTCDate());
  // Округляем до целого (Math.round) — получаем целое количество дней
  return Math.round((b - a) / MS_PER_DAY);
}

// Мини-склонение "день/дня/дней"»" по русским правилам
function formatDays(n) {
  // Простая русская форма для "дней"
  const abs = Math.abs(n);
  const last = abs % 10;
  const last2 = abs % 100;
  if (last === 1 && last2 !== 11) return `${n} день`;
  if ([2,3,4].includes(last) && ![12,13,14].includes(last2)) return `${n} дня`;
  return `${n} дней`;
}

// Основная функция просчета
function calculate() {
  // Скрываем ошибки и чистим тексты ошибок
  errorOut.style.display = 'none';
  errorOut.textContent = '';

  // Берем значение полученное от пользователя и форматируем его через функцию parseRuDateStrict
  const parsed = parseRuDateStrict(input.value);
  // Если в дате ошибка или пустота - то выводим ошибки
  if (!parsed) {
    daysOut.textContent = '—';
    leapOut.textContent = '—';
    errorOut.textContent = 'Введите корректную дату в формате дд.мм.гггг (например, 10.10.2026).';
    errorOut.style.display = 'flex';
    return;
  }

  // Если дата валидная и не пустая, то дальше мы:
  // Вычисляет целевую дату 31.12 того же года (UTC)
  const { dd, mm, yyyy, dateUtc } = parsed;
  const targetUtc = new Date(Date.UTC(yyyy, 11, 31)); // 31 декабря того же года (месяц 11)

  // Если дата после 31.12.гггг — считаем 0 дней
  const diff = Math.max(0, daysDiffUtc(dateUtc, targetUtc));

  // Обновляем дивы-заглушки на результатные данные
  daysOut.classList.remove('muted');
  leapOut.classList.remove('muted');
  daysOut.textContent = `До 31.12.${yyyy} осталось: ${formatDays(diff)}`;
  leapOut.textContent = isLeapYear(yyyy) ? `${yyyy} — високосный год` : `${yyyy} — невисокосный год`;
}

// Здесь мы добавляем функцию отправки по клавише Enter (для удобства пользователя)
btn.addEventListener('click', calculate);
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    calculate();
  }
});
