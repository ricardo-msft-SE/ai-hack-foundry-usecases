(function () {
  var app = document.getElementById("advisor-app");
  var dataEl = document.getElementById("advisor-survey-data");

  if (!app || !dataEl) {
    return;
  }

  var survey;
  try {
    survey = JSON.parse(dataEl.textContent);
  } catch (error) {
    app.innerHTML = "<p>Unable to load survey data.</p>";
    return;
  }

  var questions = survey.questions || [];
  var accelerators = survey.accelerators || [];
  var answers = {};
  var questionIndex = 0;
  var baseUrl = app.getAttribute("data-baseurl") || "";

  function withBaseUrl(path) {
    if (!path) {
      return baseUrl || "/";
    }

    if (path.indexOf("http://") === 0 || path.indexOf("https://") === 0) {
      return path;
    }

    var normalizedBase = baseUrl.replace(/\/$/, "");
    var normalizedPath = path.indexOf("/") === 0 ? path : "/" + path;
    return normalizedBase + normalizedPath;
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getOptionById(question, optionId) {
    for (var i = 0; i < question.options.length; i += 1) {
      if (question.options[i].id === optionId) {
        return question.options[i];
      }
    }
    return null;
  }

  function scoreAccelerators() {
    var scores = {};
    var reasons = {};
    var i;

    for (i = 0; i < accelerators.length; i += 1) {
      scores[accelerators[i].id] = 0;
      reasons[accelerators[i].id] = [];
    }

    for (i = 0; i < questions.length; i += 1) {
      var question = questions[i];
      var optionId = answers[question.id];

      if (!optionId) {
        continue;
      }

      var option = getOptionById(question, optionId);
      if (!option) {
        continue;
      }

      var weights = option.weights || {};
      var optionReasons = option.reasons || {};
      var acceleratorIds = Object.keys(weights);

      for (var j = 0; j < acceleratorIds.length; j += 1) {
        var acceleratorId = acceleratorIds[j];
        var weight = Number(weights[acceleratorId]) || 0;

        if (!(acceleratorId in scores)) {
          continue;
        }

        scores[acceleratorId] += weight;

        if (optionReasons[acceleratorId]) {
          reasons[acceleratorId].push(optionReasons[acceleratorId]);
        }
      }
    }

    var ranked = accelerators.map(function (accelerator) {
      return {
        id: accelerator.id,
        title: accelerator.title,
        url: accelerator.url,
        summary: accelerator.summary,
        order: accelerator.order,
        score: scores[accelerator.id] || 0,
        reasons: reasons[accelerator.id] || []
      };
    });

    ranked.sort(function (a, b) {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.order - b.order;
    });

    return ranked;
  }

  function reasonText(result) {
    var unique = [];

    for (var i = 0; i < result.reasons.length; i += 1) {
      if (unique.indexOf(result.reasons[i]) === -1) {
        unique.push(result.reasons[i]);
      }
      if (unique.length === 2) {
        break;
      }
    }

    if (unique.length > 0) {
      return unique.join(" ");
    }

    return result.summary;
  }

  function renderQuestion() {
    var question = questions[questionIndex];
    var selected = answers[question.id] || "";
    var optionsHtml = "";

    for (var i = 0; i < question.options.length; i += 1) {
      var option = question.options[i];
      var checked = selected === option.id ? " checked" : "";

      optionsHtml +=
        '<label class="survey-option">' +
        '<input type="radio" name="survey-' + escapeHtml(question.id) + '" value="' + escapeHtml(option.id) + '"' + checked + ">" +
        '<span>' + escapeHtml(option.label) + "</span>" +
        "</label>";
    }

    var isLast = questionIndex === questions.length - 1;
    var canAdvance = selected !== "";

    app.innerHTML =
      '<div class="survey-progress" aria-label="Progress">Question ' + (questionIndex + 1) + " of " + questions.length + "</div>" +
      '<h2 class="survey-question">' + escapeHtml(question.prompt) + "</h2>" +
      '<form class="survey-form" novalidate><fieldset><legend class="sr-only">Choose one answer</legend>' +
      optionsHtml +
      "</fieldset></form>" +
      '<div class="survey-controls">' +
      '<button type="button" class="survey-btn secondary" id="survey-prev"' + (questionIndex === 0 ? " disabled" : "") + ">Previous</button>" +
      '<button type="button" class="survey-btn" id="survey-next"' + (canAdvance ? "" : " disabled") + ">" + (isLast ? "See Results" : "Next") + "</button>" +
      "</div>";

    var radios = app.querySelectorAll("input[type='radio']");
    for (var j = 0; j < radios.length; j += 1) {
      radios[j].addEventListener("change", function (event) {
        answers[question.id] = event.target.value;
        renderQuestion();
      });
    }

    var prevButton = document.getElementById("survey-prev");
    var nextButton = document.getElementById("survey-next");

    prevButton.addEventListener("click", function () {
      if (questionIndex > 0) {
        questionIndex -= 1;
        renderQuestion();
      }
    });

    nextButton.addEventListener("click", function () {
      if (!answers[question.id]) {
        return;
      }

      if (isLast) {
        renderResults();
        return;
      }

      questionIndex += 1;
      renderQuestion();
    });
  }

  function resultCardHtml(result, index) {
    var reason = reasonText(result);
    return (
      '<article class="result-card">' +
      '<p class="meta">Rank #' + (index + 1) + "</p>" +
      "<h3>" + escapeHtml(result.title) + "</h3>" +
      '<p class="result-score">Score: <strong>' + result.score + "</strong></p>" +
      "<p>" + escapeHtml(reason) + "</p>" +
      '<a class="result-link" href="' + escapeHtml(withBaseUrl(result.url)) + '">Open Guide</a>' +
      "</article>"
    );
  }

  function renderResults() {
    var ranked = scoreAccelerators();
    var strongest = ranked[0];
    var othersHtml = "";

    for (var i = 1; i < ranked.length; i += 1) {
      othersHtml += resultCardHtml(ranked[i], i);
    }

    app.innerHTML =
      '<p class="survey-progress">Recommendation Ready</p>' +
      '<h2 class="survey-question">Best Match: ' + escapeHtml(strongest.title) + "</h2>" +
      '<article class="result-hero">' +
      '<p class="result-score">Score: <strong>' + strongest.score + "</strong></p>" +
      "<p>" + escapeHtml(reasonText(strongest)) + "</p>" +
      '<a class="result-link" href="' + escapeHtml(withBaseUrl(strongest.url)) + '">Open Recommended Guide</a>' +
      "</article>" +
      "<h3>Other Matches (Ranked)</h3>" +
      '<div class="result-grid">' + othersHtml + "</div>" +
      '<div class="survey-controls">' +
      '<button type="button" class="survey-btn secondary" id="survey-restart">Restart Survey</button>' +
      '<a class="survey-btn" href="' + escapeHtml(withBaseUrl('/start/')) + '">Back to Start Page</a>' +
      "</div>";

    var restart = document.getElementById("survey-restart");
    restart.addEventListener("click", function () {
      answers = {};
      questionIndex = 0;
      renderQuestion();
    });
  }

  if (questions.length === 0 || accelerators.length === 0) {
    app.innerHTML = "<p>Survey content is not configured.</p>";
    return;
  }

  renderQuestion();
})();
