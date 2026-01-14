// Текст для вступительного окна
const introText = [
  "Ты — моя особенная валентинка!",
  "Этот сайт был создан только для тебя.",
  "Я надеюсь, что тебе понравится!"
];

let currentTextIndex = 0;
const introTextElement = document.getElementById('introText');
const introScreen = document.getElementById('introScreen');
const mainContent = document.getElementById('mainContent');

// Функция для отображения текста поочередно
function showIntroText() {
  if (currentTextIndex < introText.length) {
    introTextElement.style.opacity = 0;
    introTextElement.innerHTML = introText[currentTextIndex];
    
    // Плавное появление текста
    setTimeout(() => {
      introTextElement.style.opacity = 1;
    }, 100);
    
    currentTextIndex++;
    setTimeout(showIntroText, 3000); // Меняем текст каждые 3 секунды
  } else {
    // После окончания текста скрываем вступительный экран и показываем основное содержимое
    setTimeout(() => {
      introScreen.style.opacity = 0;
      mainContent.style.display = "block";
      mainContent.style.animation = "fadeIn 2s";
    }, 1000); // Плавно скрываем вступительный экран через 1 секунду
  }
}

// Запуск вступительного окна
showIntroText();
