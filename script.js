const body = document.body;
const themeToggleBtn = document.querySelector('.theme-toggle');
const themeIcon = document.getElementById('theme-icon');

// Icons for theme toggle
const sunSVG = `<circle cx="12" cy="12" r="5" />
  <g stroke="currentColor" stroke-width="2" stroke-linecap="round">
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </g>`;

const moonSVG = `<path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"/>`;

themeToggleBtn.addEventListener('click', () => {
  if (body.classList.contains('dark')) {
    body.classList.remove('dark');
    themeIcon.innerHTML = sunSVG;
  } else {
    body.classList.add('dark');
    themeIcon.innerHTML = moonSVG;
  }
});

// Elements for home
const homeScreen = document.getElementById('home-screen');
const usernameInput = document.getElementById('username');
const startBtn = document.getElementById('start-btn');

// Elements for quiz
const quizScreen = document.getElementById('quiz-screen');
const questionNumberEl = quizScreen.querySelector('.question-number');
const questionTextEl = quizScreen.querySelector('.question-text');
const optionsContainer = quizScreen.querySelector('.options');
const timerBar = quizScreen.querySelector('.timer-bar');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const submitAnswerBtn = document.getElementById('submit-answer-btn');
const submitQuizBtn = document.getElementById('submit-quiz-btn');

// Result screen
const resultScreen = document.getElementById('result-screen');
const resultText = resultScreen.querySelector('.result');
const restartBtn = document.getElementById('restart-btn');

// Quiz Data
const questions = [
  {
    question: "What is the capital city of India?",
    options: ["Mumbai", "Delhi", "Bangalore", "Chennai"],
    answer: 1
  },
  {
    question: "Which data structure uses FIFO principle?",
    options: ["Stack", "Queue", "Linked List", "Tree"],
    answer: 1
  },
  {
    question: "What does CSS stand for?",
    options: ["Computer Style Sheets", "Creative Style System", "Cascading Style Sheets", "Colorful Style Sheets"],
    answer: 2
  },
  {
    question: "Which of these is NOT a JavaScript framework?",
    options: ["React", "Angular", "Django", "Vue"],
    answer: 2
  },
  {
    question: "Which protocol is used to send emails?",
    options: ["HTTP", "FTP", "SMTP", "TCP"],
    answer: 2
  }
];

const QUESTION_TIME = 20; // seconds per question

// State
let currentQuestionIndex = 0;
let selectedOption = null;
let timerInterval = null;
let timeLeft = QUESTION_TIME;
let userAnswers = Array(questions.length).fill(null);
let userName = '';

// Enable start button only if user types a non-empty name
usernameInput.addEventListener('input', () => {
  const val = usernameInput.value.trim();
  if (val.length > 0) {
    startBtn.disabled = false;
    startBtn.setAttribute('aria-disabled', 'false');
  } else {
    startBtn.disabled = true;
    startBtn.setAttribute('aria-disabled', 'true');
  }
});

startBtn.addEventListener('click', () => {
  userName = usernameInput.value.trim();
  if (!userName) return;
  // Hide home, show quiz
  homeScreen.style.display = 'none';
  quizScreen.style.display = 'block';

  loadQuestion(currentQuestionIndex);
  startTimer();
  updateNavButtons();
});

function loadQuestion(index) {
  clearInterval(timerInterval);
  timeLeft = QUESTION_TIME;
  updateTimerBar();

  selectedOption = userAnswers[index];

  questionNumberEl.textContent = `Question ${index + 1} of ${questions.length}`;
  questionTextEl.textContent = questions[index].question;

  optionsContainer.innerHTML = '';
  questions[index].options.forEach((opt, i) => {
    const optionDiv = document.createElement('div');
    optionDiv.classList.add('option');
    optionDiv.setAttribute('role', 'listitem');
    optionDiv.setAttribute('tabindex', '0');
    optionDiv.textContent = opt;
    if (selectedOption === i) optionDiv.classList.add('selected');

    optionDiv.addEventListener('click', () => {
      if (selectedOption !== null) return; // disable changing answer
      selectedOption = i;
      userAnswers[currentQuestionIndex] = i;
      renderOptions();
      submitAnswerBtn.disabled = false;
      submitAnswerBtn.setAttribute('aria-disabled', 'false');
    });

    optionDiv.addEventListener('keydown', (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        optionDiv.click();
      }
    });

    optionsContainer.appendChild(optionDiv);
  });

  // Disable submit answer if already answered
  if (selectedOption !== null) {
    submitAnswerBtn.disabled = true;
    submitAnswerBtn.setAttribute('aria-disabled', 'true');
  } else {
    submitAnswerBtn.disabled = true;
    submitAnswerBtn.setAttribute('aria-disabled', 'true');
  }

  // If last question, enable submit quiz only if answered
  if (currentQuestionIndex === questions.length - 1 && userAnswers[currentQuestionIndex] !== null) {
    submitQuizBtn.disabled = false;
    submitQuizBtn.setAttribute('aria-disabled', 'false');
  } else {
    submitQuizBtn.disabled = true;
    submitQuizBtn.setAttribute('aria-disabled', 'true');
  }

  startTimer();
}

function renderOptions() {
  const optionDivs = optionsContainer.querySelectorAll('.option');
  optionDivs.forEach((optDiv, idx) => {
    optDiv.classList.toggle('selected', idx === selectedOption);
  });
}

function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerBar();

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      // Auto submit answer if selected else move forward
      if (selectedOption !== null) {
        submitAnswer();
      } else {
        nextQuestion();
      }
    }
  }, 1000);
}

function updateTimerBar() {
  const percent = (timeLeft / QUESTION_TIME) * 100;
  timerBar.style.width = `${percent}%`;
}

submitAnswerBtn.addEventListener('click', () => {
  submitAnswer();
});

function submitAnswer() {
  submitAnswerBtn.disabled = true;
  submitAnswerBtn.setAttribute('aria-disabled', 'true');
  prevBtn.disabled = false;
  prevBtn.setAttribute('aria-disabled', 'false');

  nextBtn.disabled = false;
  nextBtn.setAttribute('aria-disabled', 'false');

  // Lock answer (disable selecting other option)
  renderOptions();

  // If last question, enable submit quiz
  if (currentQuestionIndex === questions.length - 1) {
    submitQuizBtn.disabled = false;
    submitQuizBtn.setAttribute('aria-disabled', 'false');
  }

  clearInterval(timerInterval);
}

prevBtn.addEventListener('click', () => {
  if (currentQuestionIndex === 0) return;
  currentQuestionIndex--;
  loadQuestion(currentQuestionIndex);
  updateNavButtons();
});

nextBtn.addEventListener('click', () => {
  if (currentQuestionIndex === questions.length - 1) return;
  currentQuestionIndex++;
  loadQuestion(currentQuestionIndex);
  updateNavButtons();
});

function nextQuestion() {
  // Auto move to next question if not last
  if (currentQuestionIndex < questions.length - 1) {
    currentQuestionIndex++;
    loadQuestion(currentQuestionIndex);
    updateNavButtons();
  }
}

function updateNavButtons() {
  prevBtn.disabled = currentQuestionIndex === 0;
  prevBtn.setAttribute('aria-disabled', currentQuestionIndex === 0);

  nextBtn.disabled = currentQuestionIndex === questions.length - 1;
  nextBtn.setAttribute('aria-disabled', nextBtn.disabled /*currentQuestionIndex === questions.length - 1*/);

  // Submit answer depends on if answer selected and not yet submitted
  submitAnswerBtn.disabled = selectedOption === null || userAnswers[currentQuestionIndex] !== null;
  submitAnswerBtn.setAttribute('aria-disabled', submitAnswerBtn.disabled);

  // Submit quiz button enable only on last question answered
  submitQuizBtn.disabled = !(currentQuestionIndex === questions.length - 1 && userAnswers[currentQuestionIndex] !== null);
  submitQuizBtn.setAttribute('aria-disabled', submitQuizBtn.disabled);
}

submitQuizBtn.addEventListener('click', () => {
  // Show results screen
  quizScreen.style.display = 'none';
  resultScreen.style.display = 'block';

  const score = calculateScore();
  resultText.innerHTML = `Hello <strong>${userName}</strong>, you scored <strong>${score} / ${questions.length * 2}</strong> marks.`;

  clearInterval(timerInterval);
});

restartBtn.addEventListener('click', () => {
  // Reset everything
  userAnswers.fill(null);
  currentQuestionIndex = 0;
  selectedOption = null;
  timeLeft = QUESTION_TIME;
  usernameInput.value = '';
  startBtn.disabled = true;
  startBtn.setAttribute('aria-disabled', 'true');

  resultScreen.style.display = 'none';
  homeScreen.style.display = 'block';
});

function calculateScore() {
  let score = 0;
  userAnswers.forEach((ans, idx) => {
    if (ans === questions[idx].answer) {
      score += 2;
    }
  });
  return score;
}