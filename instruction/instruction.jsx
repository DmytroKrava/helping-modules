import React, { useState, useEffect, useRef } from 'react';
import './instruction.css';
import {tooltip, changeRegime} from "../interactive-hints/interactive-hints.js";


export const Instruction = () => {
  useEffect(() => {
    changeRegime(document.getElementById("interactive-mode").checked);
  }, []);

  useEffect(() => {
    class Radio {
      constructor(value, text) {
        this.id = "check_" + value;
        this.value = value;
        this.text = text;
      }
    }

    class PartOfChapter {
      constructor(id) {
        this.id = id;
        this.text = document.getElementById(id);
        this.radio = new Radio(id, document.getElementById(id).querySelectorAll("h3")[0].textContent);
      }
    }

    class Chapter {
      constructor(id) {
        this.id = id;
        let div = document.getElementById(id);
        this.header = div.querySelectorAll("h2")[0];
        this.parts = [];
        div.querySelectorAll("div").forEach(element => {
          this.parts.push(new PartOfChapter(element.id));
        });
      }
    }


    let chooseSection = document.getElementById("choose-section");
    let copyText = "";
    let copyAside = "";
    let chapters = [];
    let allText = document.getElementById("text").children;

    for (let i = 0; i < allText.length; i++) {
      chapters.push(new Chapter(allText[i].id));
    }

    showText("appointment");
    showCheckedRadio();

    function showText(radioValue) {
      copyText = "";
      document.getElementById("text").innerHTML = '';
      document.getElementById('text').appendChild(getPartOfChapter(radioValue).text);
    }


    function showCheckedRadio() {
      const radios = document.querySelectorAll('input[name="chapter"]');
      let selectElement = document.getElementById("choose-section");

      for (let i = 0; i < radios.length;  i++) {
        radios[i].addEventListener('change', function() {
          if (radios[i].checked) {
            showText(radios[i].value)
          }
        });
      }
    }


    function getChapter(id) {
      for (let i = 0; i < chapters.length;  i++) {
        if (chapters[i].id == id) {
          return chapters[i];
        }
      }
      return null;
    }


    function getPartOfChapter(partId) {
      for (let i in chapters) {
        for (let j in chapters[i].parts) {
          if (chapters[i].parts[j].id == partId) {
            return chapters[i].parts[j];
          }
        }
      }
      return null;
    }
    

    function choose_chapter() {
      const selectElement = document.getElementById("choose-section");

      selectElement.addEventListener("change", (event) => {
          const selectedOption = event.target.value;
        document.getElementById("radios").textContent = '';
          let radios = document.getElementById('radios')
          radios.innerHTML = '';

          let chapter = getChapter(selectElement.value);
          for (let i in chapter.parts) {
            radios.innerHTML += '<p><input type="radio" name="chapter" ' + chapter.parts[i].radio.id + '" value="' + chapter.parts[i].radio.value + '">' 
              + chapter.parts[i].radio.text + '</p>';
          } 

        document.querySelectorAll('input[type="radio"]')[0].checked = true;
        showText(document.querySelectorAll('input[type="radio"]')[0].value);
        showCheckedRadio();
      });
    }


    function scroll() {
      let parentBlock = document.getElementById('main');
      parentBlock.onscroll = function() {
        if (parentBlock.scrollTop > 50) {
          document.getElementById("arrow-top").className = "up-arrow";
        }
        else {
          document.getElementById("arrow-top").className = "none";
        }
      };  
    }


    let current_found = -1;
    let found_elements = null;


    function scrollToWord() {
      if (window.innerWidth > 1000) {
        document.getElementById("main").scrollTop -= 50;
      }
      else {
        document.getElementById("main").scrollTop -= 100;
      }
    }


    function search() {
      let findButton = document.getElementById('find');
      findButton.addEventListener('click', find);
      let searchInput = document.getElementById("search");
      searchInput.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            find();
        }
      });

      let nextWordButton = document.getElementById('next-word');
      nextWordButton.addEventListener('click', function() {
        if (current_found < found_elements.length-1) {
          found_elements[current_found].classList.remove("highlight-on-current");
          current_found++;
          let current = found_elements[current_found];
          current.scrollIntoView();
          current.classList.add("highlight-on-current");
          scrollToWord();
          show_result_of_search(current_found + 1 + "/" + found_elements.length);
        }
        if (current_found - 1 <= 0) {
          document.getElementById("last-word").disabled = false;
        }
        if (current_found >= found_elements.length-1) {
          document.getElementById("next-word").disabled = true;
        }
      });

      let lastWordButton = document.getElementById('last-word');
      lastWordButton.addEventListener('click', function() {
        if (current_found > 0) {
          found_elements[current_found].classList.remove("highlight-on-current");
          current_found--;
          let current = found_elements[current_found];
          current.scrollIntoView();
          current.classList.add("highlight-on-current");
          scrollToWord();
          show_result_of_search(current_found + 1 + "/" + found_elements.length);
        }
        if (current_found + 1 >= found_elements.length-1) {
          document.getElementById("next-word").disabled = false;
        }
        if (current_found <= 0) {
          document.getElementById("last-word").disabled = true;
        }
      });

      let stopSearchButton = document.getElementById('stop-search');
      stopSearchButton.addEventListener('click', function() {
        let element = document.getElementById("text");
        element.innerHTML = copyText;
        copyText = "";
        current_found = -1;
        found_elements = null;

        stopSearchButton.disabled = true;
        document.getElementById("last-word").disabled = true;
        document.getElementById("next-word").disabled = true;
        show_result_of_search("");

        document.getElementById("search-of-part").disabled = false;
        document.getElementById("find-part").disabled = false;

        if (copyAside != "") {
          document.getElementById("stop-search-of-part").disabled = false;
        }

        if (document.getElementById("choose-section")) {
          document.getElementById("choose-section").disabled = false;
        }
        const radioButtons = document.querySelectorAll("input[type='radio']");
        radioButtons.forEach(button => {
          button.disabled = false;
        });
      });
    }


    function show_result_of_search(value) {
      let res = document.getElementById('result-of-search');
      if (typeof res.innerText !== 'undefined') {
        res.innerText = value;
      }
      else {
        res.textContent = value;
      }
    }


    function escapeRegExp(text) {
      return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }


    function removeText(element, textToFind) {
      if (textToFind.length < 1) {
        return;
      } 

      if (element.nodeType === Node.TEXT_NODE) {
        let regex = new RegExp(escapeRegExp(textToFind), 'gi');
        let parent = element.parentNode;
        let wrapper = document.createElement('span');
        wrapper.innerHTML = element.nodeValue.replace(regex, "<a name=found class='highlight'>$&</a>");
        parent.replaceChild(wrapper, element);
      }

      if (element.nodeType === Node.ELEMENT_NODE) {
        for (let child of element.childNodes) {
          removeText(child, textToFind);
        }
      }
    }


    function find() {
      let textToFind = window.document.getElementById("search").value;
      let element = document.getElementById("text");

      if (found_elements) {
        found_elements = null;
        document.getElementById("last-word").disabled = true;
        document.getElementById("next-word").disabled = true;
      }

      document.getElementById("search-of-part").disabled = true;
      document.getElementById("find-part").disabled = true;
      document.getElementById("stop-search-of-part").disabled = true;

      if (document.getElementById("choose-section")) {
        document.getElementById("choose-section").disabled = true;
      }
      document.querySelectorAll("input[type='radio']").forEach(button => {
          button.disabled = true;
      }); 
      document.getElementById("stop-search").disabled = false;

      if (copyText.length < 1) {
        copyText = element.innerHTML;
      }
      else {
        element.innerHTML = copyText;
      }

      removeText(element, textToFind);
      found_elements = document.getElementsByName('found');
      document.getElementById("last-word").disabled = true;

      if (found_elements.length > 1) {
        document.getElementById("next-word").disabled = false;
      }

      if (found_elements.length > 0) {
        current_found = 0;
        found_elements[current_found].scrollIntoView();
        show_result_of_search(1 + "/" + found_elements.length);
        scrollToWord();
        found_elements[current_found].classList.add("highlight-on-current");
      }
      else {
        show_result_of_search("Не знайдено нічого");
      }
    }

    
    function findWordInParts() {
      let textToFind = window.document.getElementById("search-of-part");
      let element = document.getElementById("sections");
      if (copyAside == "") {
        copyAside = element.innerHTML;
      }
      element.innerHTML = "";

      for (let i in chapters) {
        for (let j in chapters[i].parts) {
          if (chapters[i].parts[j].radio.text.toLowerCase().includes(textToFind.value.toLowerCase())) {
            element.innerHTML += '<p><input type="radio" name="chapter" ' + chapters[i].parts[j].radio.id + '" value="' + chapters[i].parts[j].radio.value + '">'
                + chapters[i].parts[j].radio.text + '</p>';            
          }
        }
      };

      removeText(element, textToFind.value);
      document.getElementById("stop-search-of-part").disabled = false;
      showCheckedRadio();
    } 


    function searchInAside() {
      let findPartButton = document.getElementById('find-part');
      findPartButton.addEventListener('click', findWordInParts);

      let searchInput = document.getElementById("search-of-part");
      searchInput.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            findWordInParts();
        }
      });

      let stopSearchOfPartButton = document.getElementById('stop-search-of-part');
      stopSearchOfPartButton.addEventListener('click', function() {
        let element = document.getElementById("sections");
        element.innerHTML = copyAside;
        copyAside = "";
        document.getElementById("stop-search-of-part").disabled = true;
        choose_chapter();
        showCheckedRadio();
      });
    }

    scroll();
    search();
    choose_chapter();
    searchInAside();
  }, []);

  return (
    <div className="container">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" />

      <aside>
        <div id="top-panel" className="top-panel-aside">
          <div id="left-search-container" className="search-container">
            <input 
              type="text" 
              id="search-of-part" 
              name="search-of-part" 
              className="search" 
              placeholder="Пошук..." 
              data-content="Введіть слово, за яким ви хочете знайти підрозділ" 
              onMouseMove={tooltip}/>
            <button id="find-part" className="find">
              <i className="fa fa-search search-icon" data-content="Знайти підрозділи із вказаним словом" onMouseMove={tooltip}></i> 
            </button>
            <button id="stop-search-of-part" className="stop-search" disabled>
              <i className="fa fa-times close-icon" data-content="Зупинити пошук" onMouseMove={tooltip}></i> 
            </button>
          </div>
        </div>

        <div id="sections" className="sections">
          <select id="choose-section" data-content="Вибрати розділ" onMouseMove={tooltip}>
            <option value="about-system">Про систему комплексного еко-енерго-економічного моніторингу</option>
            <option value="instruction-of-user">Інструкція користувача</option>
          </select>
          <br /><br />
          <div id="radios">
            <p><input type="radio" name="chapter" id="check_appointment" value="appointment" defaultChecked />Призначення </p>
            <p><input type="radio" name="chapter" id="check_setOfSystemExperts" value="setOfSystemExperts" />Набір експертів системи та їх функції </p>
            <p><input type="radio" name="chapter" id="check_algorithm" value="algorithm" />Загальний алгоритм функціонування КЕЕЕМ </p>
            <p><input type="radio" name="chapter" id="check_princips" value="princips" />Основні принципи КЕЕЕМ </p>
            <p><input type="radio" name="chapter" id="check_conceptsAndAbbreviations" value="conceptsAndAbbreviations" />Основні поняття та скорочення </p>
            <p><input type="radio" name="chapter" id="check_scenaries" value="scenaries" />Сценарії роботи з системою </p>
          </div>
        </div>
      </aside> 

      <main id="main">
        <div id="start"></div>
        <div className="top-panel">
          <div className="transition-between-found-words">
            <button id="last-word" className="fa fa-arrow-up" data-content="Попереднє слово" onMouseMove={tooltip} disabled>
            </button>
            <div id="result-of-search" className="result-of-search" data-content="Навігація по знайдених словах" onMouseMove={tooltip}></div>
            <button id="next-word" className="fa fa-arrow-down" disabled></button>
          </div>

          <div className="gap"></div>

          <div id="search-container-2">
            <input type="text" id="search" name="search" className="search" placeholder="Пошук..." data-content="Введіть слово, яке ви хочете знайти в тексті" onMouseMove={tooltip} />
            <button id="find" className="find">
              <i className="fa fa-search search-icon" data-content="Виконати пошук" onMouseMove={tooltip}></i> 
            </button>
            <button id="stop-search" className="stop-search" disabled>
              <i className="fa fa-times close-icon" data-content="Припинити пошук" onMouseMove={tooltip}></i> 
            </button>
          </div>
        </div>

        <a id="arrow-top" href="#start"></a>
        <div id="text" className="text">
          <div id="about-system">
            <h2>Про систему комплексного еко-енерго-економічного моніторингу</h2>
            <div id="appointment">
              <h3>Призначення</h3>
              <p>Система комплексного еко-енерго-економічного моніторингу (КЕЕЕМ) запропонована в рамках виконання науково-технічної програми «Розробка науково-методичних основ системи прогнозування генетичного ризику впровадження нових технологій та забруднення навколишнього середовища «ГРАНІТ», яка розроблена на виконання Указу Президента України від 17 січня 1995 року № 53/95 «Про систему прогнозування генетичного ризику впровадження нових технологій та забруднення навколишнього середовища» та призначена для прийняття ефективних соціальних, екологічних та економічних рішень на рівнях державної, регіональної та місцевої влади, що потребує проведення всебічного моніторингу території фахівцями різних галузей, тому запропонована система забезпечує підтримку робочих місць експертів, що здійснюють спостереження за станом навколишнього середовища, досліджують антропогенний вплив та надають рекомендації щодо мінімізації ризику для здоров’я населення, що потратило до зони забруднення довкілля шкідливими речовинами. </p>
              <p>Розробники системи науково-педагогічні співробітники та студенти кафедри автоматизації проектування енергетичних процесів і систем Національного технічного університету України «Київський політехнічний інститут імені Ігоря Сікорського».</p>
            </div>

            <div id="setOfSystemExperts">
              <h3>Набір експертів системи та їх функції</h3>
              <p>Система КЕЕЕМ забезпечує взаємодію між собою та з системою наступні категорії експертів (рис. 1):</p>
              <p><strong>Еколог</strong> – забезпечує збір первинної інформації про стан компонентів навколишнього середовища (атмосфери, гідросфери та літосфери), актуалізує інформацію про забруднювачі довкілля, оцінює рівень небезпеки (зокрема, нормування по гранично-допустимим концентраціям, визначення індексів забруднення тощо), прогнозує розвиток екологічної ситуації в зоні забруднення, формує перелік екологічних заходів для нейтралізації наслідків забруднення.</p>
              <p><strong>Лікар</strong>  – формує базу даних про стан здоров’я населення, визначає ступень ризику розвитку захворювань в залежності від екологічного стану в контрольованій зоні, прогнозує захворюваності в майбутньому та пропонує комплекс медичних та соціальних заходів щодо профілактики, лікування та реабілітації населення.</p>
              <p><strong>Енергетик</strong>  – формує базу даних про енергетичне забезпечення населення, проводить енергоаудит, формує зведений та прогнозний енергобаланс, проводить аналіз зони на можливість мінімізації використання природніх ресурсів, пропонує заходи для нейтралізації негативного впливу на стан довкілля паливно-енергетичного комплексу.</p>
              <p><strong>Економіст</strong>  – проводить розрахунки збитків від наднормових викидів, скидів, надзвичайних ситуацій, а також визначає оптимальний за вартістю варіант виконання заходів, запропонованих іншими експертами (еколог, лікар, енергетик), на основі відомостей про наявні ресурси у відповідних міністерствах та відомствах.</p>
              <p><strong>Юрист</strong>  – формує нормативно-законодавчу базу в сфері екологічного моніторингу та соціального захисту населення, надає пропозиції щодо покарання порушників екологічного законодавства та підтверджує законність запропонованих заходів іншими експертами.</p>
              <p><strong>Аналітик</strong>  – особа, що приймає рішення щодо формування плану проведення комплексу заходів на основі аналізу рекомендацій інших експертів (еколог, енергетик, лікар, економіст), проводить аналіз сформованої ситуації і надає остаточні рішення.</p>
              <p><strong>Адміністратор</strong>  – забезпечує функціонування бази даних, актуалізацію та захист інформації.</p>
              <img src={require('./images/about-system/schemme.png')} alt="Зображення" />
              <p align="center">Рисунок 1 – Схема взаємодії експертів системи.</p>
              <p>Запропонований перелік експертів дозволяє охопити всі важливі аспекти екологічного, економічного та соціального розвитку громади та забезпечити ефективне прийняття управлінських рішень для сталого розвитку території та покращення стану здоров’я населення.</p>
            </div>

            <div id="algorithm">
              <h3>Загальний алгоритм функціонування КЕЕЕМ </h3>
              <p>Функціонування КЕЕЕМ здійснюється за таким алгоритмом:</p>
                <ol>
                  <li>Експерт-аналітик реєструє задачу у системі, визначає на карті регіон, який охоплює задача, зберігає її назву та опис.</li>
                  <li>Юрист прикріплює до задачі законодавчі документи, які регламентують обов’язкові заходи.</li>

                  <li>Еколог, лікар, енергетик, економіст збирають всі необхідні параметри, наносять на карту (або обирають на карті) об’єкти, які відносяться 
                    до задачі (підприємства, точки збору інформації, області забруднення тощо) і проводять розрахунок показників-маркерів, спираючись на дані один одного. При цьому набір формул для розрахунку формується відповідно до актуальної методики та вибраного експерта, який проводить розрахунки.
                  </li>

                  <li>Всі експерти, крім аналітика, на основі отриманої інформації про задачу та проведеного аналізу пропонують заходи для покращення 
                    екологічної ситуації та мінімізації негативного впливу на стан здоров’я населення.</li>

                  <li>Юрист розглядає кожен запропонований захід на відповідність законодавству України, підтверджує законність та додає до заходу 
                    нормативно-правові документи, на основі яких було винесене відповідне рішення.</li>

                  <li>Аналітик формує програму вирішення поставленої задачі, на основі запропонованих експертами заходів, оцінки законності, наявності 
                    необхідних ресурсів, вартості виконання заходів, їх пріоритету та оцінки ефективності.</li>
                </ol>
            </div>

            <div id="princips">
              <h3>Основні принципи КЕЕЕМ</h3>
              <p>Комплексний еко-енерго-економічний моніторинг (КЕЕЕМ) базується на таких основних принципах:</p>
              <ol>
                <li>Збір різнорідної екологічної інформації з різних точок регіону.</li>
                <li>Оброблення великих масивів даних різними експертами.</li>
                <li>Одночасна робота різних експертів з екологічною інформацією та інформацією від інших експертів.</li>
                <li>Відображення екологічної інформації на карті місцевості для наочності.</li>
                <li>Дослідження екологічної інформації за допомогою різних видів математичного аналізу. </li>
                <li>Оцінка ситуації у визначеному регіоні з точки зору закону та визначення законності набору заходів по покращенню екологічного стану регіону або ліквідації наслідків надзвичайних ситуацій.</li>
              </ol>
            </div>

            <div id="conceptsAndAbbreviations">
              <h3>Основні поняття та скорочення</h3>
              <p><strong>КЕЕЕМ</strong> - комплексний еко-енерго-економічний моніторинг.</p>
              <p><strong>Задача</strong> – це будь-яка екологічна та соціальна ситуація, яка потребує аналізу. Екологічна ситуація може бути викликана екстреними обставинами (викиди, аварії тощо) або плановими перевірками (екологічний звіт регіону за деякий період). Наприклад, «Наслідки аварії на Дарницькому шовковому комбінаті» або «Аналіз екологічної ситуації у Києві за 2020 рік».</p>
              <p><strong>Розрахунки по задачі</strong> – це набір вихідних параметрів, які характеризують екологічну та соціальну ситуацію і є результатом серії розрахунків, яку здійснюють різні експерти на основі інформації про вхідні (відомі) екологічні, економічні, енергетичні та медичні параметри регіону. Вхідні параметри екологічного характеру отримують за допомогою різних датчиків, розміщених у контрольних точках регіону або при виконанні позапланових замірів. Наприклад, на основі інформації про концентрацію забруднюючої речовини у контрольних точках регіону експерт еколог може здійснити розрахунок розмірів зони ураження та ступінь небезпечності, експерт економіст може оцінити фактичні або можливі збитки, експерт лікар може розрахувати прогнозовані показники рівня захворювання на серцево-судинні хвороби серед населення або інші хвороби.</p>
              <p><strong>Заходи</strong> – це набір дій, направлених на ліквідацію наслідків або просто покращення ситуації. Кожен захід характеризується необхідним для виконання часом та розміром грошових витрат. Заходи можна умовно поділити на дві категорії: обов’язкові (визначені законодавством країни) та рекомендовані експертами як додаткові заходи. Усі заходи повинні бути перевірені та підтвердженні експертом юристом, оскільки будь-які дії у системах такого рівня повинні у межах чинного законодавства. Приклади заходів, рекомендованих експертами: «Провести утилізацію відходів у вказаному районі, які негативно впливають на екологічну ситуацію» (призначається експертом екологом на основі інформації про стан забруднення у районі) або «Провести інформаційну кампанію про заходи профілактики серцево-судинних захворювань» у регіоні з підвищеним ризиком хвороб серця (призначається експертом медиком на основі статистичних даних та прогнозованих показників).</p>
              <p><strong>Ресурс</strong> – це матеріальні речі, людські або грошові ресурси, необхідні для виконання заходу. Зазвичай, захід має набір ресурсів, а кожен ресурс має грошовий еквівалент. Наприклад, для заходу «Проведення очисних робіт у водоймищі» необхідно визначити скільки дезактивуючого реагента потрібно використати та скільки людей потрібно для реалізації цієї дії у визначений час. Як реагент так і людський ресурс мають свою вартість. Сума усіх грошових витрат, визначених набором ресурсів, складає вартість заходу, а сума грошових витрат по усім заходам складає вартість задачі. Набір ресурсів також регламентується і розраховується згідно із відповідними законодавчими документами щодо нормування праці та витрат.</p>
            </div>

            <div id="scenaries">
              <h3>Сценарії роботи з системою</h3>
              <br/>
              <h5>Сценарій створення маркерів</h5>

              <p>Для створення маркерів на карті необхідно натиснути на відповідну кнопку (див. рис. 1)</p>

              <img src={require('./images/about-system/image 1.png')} alt="Зображення" />
              <p align="center">Рисунок 1 – кнопка створення маркерів на карті</p>

              <p>Для додавання необхідно натиснути на кнопку додавання точки та обрати місце на карті після чого буде відкрито 
              модальне вікно (див. рис. 2) в якому необхідно обрати вид діяльності підприємства, форму власності , ім’я та опис 
              об’єкту, після чого натиснути доадти об’єкт після чого якщо всі дані внесені правильно об’єкт буде додан на карту.</p>

              <img src={require('./images/about-system/image-2.png')} alt="Зображення" />
              <p align="center">Рисунок 2 - приклад додавання точки на мапу.</p>

              <p>Для виключення режиму додавання необхідно натиснути на кнопку виключення режиму додавання на нижній панелі навігації.
              (див. рис. 3)</p>

              <img src={require('./images/about-system/image-3.png')} alt="Зображення" />
              <p align="center">Рисунок 3 – виключення режиму додавання.</p>
              <br/>
              
              <h5>Сценарій створення полігонів на карті</h5>
              <p>Для додавання полігону необхідно включити режим додавння полігона (див. рис. 4) та натиснути декілька разів на карту 
              для дого аби поставити точки які будуть утворювати полігон (наразі точки не відображаються візуально), після чого на 
              панелі навігації необхідно натиснути на кнопку закінчення полігону.</p>

              <img src={require('./images/about-system/image-4.png')} alt="Зображення" />
              <p align="center">Рисунок 4 – включення режиму додавання полігону.</p>

              <p>Для позначення полігону необхідно поставити точки на карті що будуть зображувати цей полігон, у разі неправильно зайвої 
              точки на неї можна натиснути після чого в popup меню видалити її натиснувши на “Видалити точку”, також поставлені точки 
              полігону можна переміщувати по карті до його збереження(див. рис. 5).</p>

              <img src={require('./images/about-system/image-5.png')} alt="Зображення" />
              <p align="center">Рисунок 5 – побудування полігону перед додаванням</p>

              <p>Після чого необхідно натиснути кнопку “Закінчити полігон” на нижній навігаційній панелі та заповнити таку інформацію у 
              модальному вікні: колір, товщину лінії назву полігону  та його опис.(див. рис 25)</p>

              <img src={require('./images/about-system/image-6.png')} alt="Зображення" />
              <p align="center">Рисунок 6 – приклад додавання полігону</p>

              <p>Після правильно введених даних необхідно натиснути зберегти і на карту буде додан новий полігон.</p>
              <br/>
            </div>
          </div>

          <div id="instruction-of-user">
            <h2>Інструкція користувача</h2>
            <div id="conception">
              <h3>Концепція</h3>
              <p>Користувач за допомогою браузера та посилання заходить на сайт веб застосунку де він може за 
              допомогою мапи переглянути інформацію про останні викиди в атмосферу, питну воду, грунт або інші 
              екологічні середовища на полігонах, або точках кожна з яких прив’язана до одного з середовищ, 
              експерти та адміністратори можуть входити в систему після чого їм надається більше можливостей 
              серед яких редагування об’єктів та додавання об’єктів на мапу., якщо в систему ввійде адміністратор 
              йому буде доступна можливість переміщення на сторінку редагування інформації у базі даних.</p>
            </div>

            <div id="instruction-punct">
              <h3>Інструкція</h3>
              <p>Веб версія представляє собою систему яка складається з BackEnd та FrontEnd(клієнтської) частини, 
              користувач лише бачить FrontEnd частину за допомогою запитів на сервер, база даних підключається до 
              віддаленої бази даних, але у разі необхідності дані для підключення можна змінити в файлі db-config/ mysql-config.js. </p>
            </div>

            <div id="index-page">
              <h3>Головна сторінка</h3>
              <p>Структура сторінок ділиться на дві частини, навігаційне меню (див. рис. 1) та контентна частина 
              яка може поділятися на під частини. Навігаційне меню складається з розміщених на ньому посилань, 
              на головну сторінку, довідника(доступний лише адміністратору), картою викидів та кнопкою входу 
              призначеною для експертів інформація про яких зберігається у базі даних яку використовує система.</p>
              <br/>
              <img src={require('./images/instruction-of-user/image-1.png')} alt="Зображення" />
              <br/>
              <p align="center">Рисунок 1 – Навігаційне меню</p>
              <p>На головній сторінці контента частина(див. рис. 2)  складається з  каруселі зображені та описом 
              основних принципів еколого-економічного моніторингу, які описують головне призначення системи.</p>

              <img src={require('./images/instruction-of-user/image-2.png')} alt="Зображення" />
              <p align="center">Рисунок 2 – контента частина головної сторінки</p>

              <p>При натисканні на карту викидів користувачу буде відображений список середовищ(див. рис. 3) по 
              яким він може переглянути інформацію на мапі.</p>
              <img src={require('./images/instruction-of-user/image-3.png')} alt="Зображення" />
              <p align="center">Рисунок 3 – доступні екологічні середовища</p>

              <p>Натиснувши на один з елементів списку користувача перенесе на сторінку з картою  де йому буде надана 
              інформація згідно того середовища яке буде обрано користувачем.</p>
            </div>

            <div id="emissions-map">
              <h3>Карта викидів</h3>
              <p>Контентна частина сторінки з картою викидів складається з карти та нижньої навігаційної панелі, також 
              є додаткові бокові панелі як відкриваються лише при натисканні та містять окремий функціонал (див. рис. 4)</p>
              <img src={require('./images/instruction-of-user/image-4.png')} alt="Зображення" />
              <p align="center">Рисунок 4 – контентна частина сторінки карти викидів</p>

              <p>Після переходу на мапу користувач побачить що там де був список викидів середовище яке він обрав було 
              виділено синім кольором.</p>
              <p>На карті користувач побачить велику кількість різних компонентів з якими він може взаємодіяти, серед яких:</p>
              <ul>
                <li>карта та її компоненти</li>
                <li>меню навігації</li>
                <li>меню фільтрації</li>
                <li>нижня панель</li>
              </ul>
              <p>Розглянемо кожен компонент більш докладно:</p>

              <h4>Карта та її компоненти (див. рис. 5)</h4>
              <img src={require('./images/instruction-of-user/image-5.png')} alt="Зображення" />
              <p align="center">Рисунок 5 – демонстрація компонентів карти</p>
              <p>Під час роботи з картою можна побачити такі компоненти:</p>
              <ul>
                <li>POI маркери</li>
                <li>Полігони</li>
              </ul>

              <p>Маркери використовуються для позначення конкретних точок на карті, до таких точок відносяться очисні станції, 
              заводи, точки які збирають інформацію про забруднення навколишнього середовища, та інші. Полігони використовуються 
              для позначення певної області на карті яка може бути забруднена або може розглядатися як ділянка за якою ведеться 
              спостереження.</p>

              <p>Кожен з цих компонентів є інтерактивним і на нього можна натиснути, після чого користувачу буде відображена 
              загальна інформація про об’єкт у вигляді popup меню (див. рис. 6). До такої інформації належить назва об’єкту, 
              опис, форма власності, та останні 4 викиди. </p>
              <img src={require('./images/instruction-of-user/image-6.png')} alt="Зображення" />
              <p align="center">Рисунок 6 – приклад popup меню</p>

              <p>На цій формі ми можемо побачити декілька кнопок, кнопка під номером 1 закриває це меню, кнопка під номером 2 
              позначає чи повинен об’єкт використовуватись при порівнянні з іншими об’єктами при натисканні на нього він 
              змінює свій колір (<img className="image-in-line" src={require('./images/instruction-of-user/sign-1.png')} alt="Зображення" />) що означає 
              що цей об’єкт обран та використовується при порівнянні. </p>
              <p>При натисканні на кнопку 3 відкриється модальне вікно (див. рис. 7) де він може більш детально переглянути 
              інформацію про забруднення.</p>

              <img src={require('./images/instruction-of-user/image-7.png')} alt="Зображення" />
              <p align="center">Рисунок 7 – модальне вікно перегляду детальної інформації</p>

              <p>Користувачу надається календар використовуючи який він може обрати дату або період за який він хоче переглянути 
              викиди. У разі  якщо інформація відсутня користувач пуде сповіщений що інформації за обраний період нема, але якщо 
              за обраний період є забруднення тоді користувачу під календарем буде показана таблиця яка відображає інформацію 
              про забруднення(див. рис. 8), а саме назву елементу, дату, одиницю виміру, середнє значення , середнє значення 
              ГДК, середнє значення викидів, перевищення ГДК , максимальне можливе ГДК.</p>

              <img src={require('./images/instruction-of-user/image-8.png')} alt="Зображення" />
              <p align="center">Рисунок 8 – детальна інформація за обраний період</p>

              <p>Також під таблицею будуть відображені графіки які візуально відображують відношення показників забруднення один 
              до одно з легендою яка описує що саме позначає цей колір.</p>
              <p>Користувач може натиснути на кнопку обрати елемент де йому буде запропонован на вибір забруднюючий елемент згідно 
              якого буде відображен графік зміни забруднень відповідно до дат.(див. рис. 9)</p>

              <img src={require('./images/instruction-of-user/image-9.png')} alt="Зображення" />
              <p align="center">Рисунок 9 – графік викидів</p>

              <p>Повернемось на карту та розглянемо інтерфейс порівняння, після того як ви позначили усі об’єкти які хочете 
              порівнювати між собою на панелі знизу ви можете натиснути на кнопку “Результати  порівняння”, яка знаходиться на 
              нижній допоміжній панелі навігації(див. рис. 10)</p>

              <img src={require('./images/instruction-of-user/image-10.png')} alt="Зображення" />
              <p align="center">Рисунок 10 – нижня панель навігації</p>

              <p>Після натискання нам відкриється вже знайоме модальне вікно на якому ми можемо обрати дати після чого нам буде уся 
              інформація про обрані нами об’єкти у вигляді таблиці (див. рис. 11).</p>

              <img src={require('./images/instruction-of-user/image-11.png')} alt="Зображення" />
              <p align="center">Рисунок 11 – приклад модального вікна для порівняння компонентів</p>

              <p>Рядками цієї таблиці виступають параметри максимальне та середнє значення викидів, дата коли це забруднення було 
              зафіксоване ,одиниця виміру та назва елементу забруднення , а стовпцями назви обраних об’єктів.</p>
              <p>Користувач  може обрати за яким елементом він хоче виконати порівняння використавши кнопку-список “Елемент 
              забруднення ” (див. рис. 12) де він і може обрати цей елемент.</p>

              <img src={require('./images/instruction-of-user/image-12.png')} alt="Зображення" />
              <p align="center">Рисунок 12 – приклад кнопки-списку з елементами забруднення</p>

              <p>Стандартно відображаються усі можливі данні але обравши елемент забруднення данні будуть відфільтровані відповідно 
              до обраного елементу та буде відображений графік (див. рис. 13) який відображає динаміку забруднення по датам для 
              різних об’єктів, а при наведенні на графік буде відображено яка саме лінія відповідає якому об’єкту та яке йому 
              встановлене значення забруднення. Відповідно до дати.</p>

              <img src={require('./images/instruction-of-user/image-13.png')} alt="Зображення" />
              <p align="center">Рисунок 13 – приклад відфільтрованих даних при порівнянні викидів</p>

              <p>Для виходу з модальних вікон достатньо натиснути на хрестик що знаходиться у правому верхньому углу, на кнопку 
              що знаходиться в самому низу форми, або натиснути на область яка не є частиною модального вікна</p>
              <p>Також на сторінці карти розміщені два бокові вікна(див. рис. 14) які відкриваються якщо натиснути на прапорці 
              що знаходяться по бокам екрану, зліва та справа, натиснувши на них, відкриється одне з вікон, вікно фільтрації яке 
              розміщене з лівої сторони  екрану або пошуку яке розміщено з правої сторони екрану, одночасно може бути відкрито 
              лише одне бокове вікно.</p>

              <img src={require('./images/instruction-of-user/image-14.png')} alt="Зображення" />
              <p align="center">Рисунок 14 – бокові вікна фільтрації та пошуку в розгорнутому стані.</p>

              <p>На вікні фільтрації користувач може обрати експертів яких хоче відобразити, після того як він натисне кнопку 
              застосувати ,на карті будуть відображені лише ті об’єкти які були додані обраними експертами.</p>
              <p>На панелі пошуку користувач може обрати типи полігонів які він хоче відображувати, після обрання типу полігонів 
              буде змінено відображення деяких об’єктів, так обравши “Області” користувач побачить полігони які відображають 
              контури областей(див. рис. 15). </p>

              <img src={require('./images/instruction-of-user/image-15.png')} alt="Зображення" />
              <p align="center">Рисунок 15 – приклад відображення областей.</p>

              <p>У другій секції користувач за допомогою випадаючого меню, де може обрати місто з списку, та відфільтрувати список
               ввівши назву міста(див. рис. 16), після натискання на назву міста карта сфокусується на обраному місті, а список буде 
               сховано.</p>

              <img src={require('./images/instruction-of-user/image-16.png')} alt="Зображення" />
              <p align="center">Рисунок 16 – приклад пошуку міста на карті</p>

              <p>За допомогою третьої секції користувач ввівши зможе на них сфокусуватися, значення можуть бути як цілі так і з 
              використанням плаваючої точки, але не можуть приймати текст, в такому разі користувач буде повідемлений про помилку, 
              якщо данні були введені правильно карта сфокусується на введених координатах(див. рис. 17).</p>

              <img src={require('./images/instruction-of-user/image-17.png')} alt="Зображення" />
              <p align="center">Рисунок 17 – приклад валідних координат для пошуку.</p>

              <p>Використовуючи третю секцію користувач може сфокусуватись на певному проміжку карти використовуючи пошук за адресом. 
              Якщо адрес буде знайдений тоді карта сфокусується на цій адресі, у разі неправильно введених даних буде показане 
              повідомлення про помилку яке буде автоматично сховано через декілька секунд(див. рис. 18).</p>

              <img src={require('./images/instruction-of-user/image-18.png')} alt="Зображення" />
              <p align="center">Рисунок 18 – процес відображення повідомлення про помилку.</p>

              <p>Після в ходу в систему на компоненті фільтрації було  додано ще один пункт “Мої об’єкти”(див. рис. 19) який 
              використовується для відображення лише тих об’єктів які додані користувачем який їх поставив.</p>

              <img src={require('./images/instruction-of-user/image-19.png')} alt="Зображення" />
              <p align="center">Рисунок 19 – розширення списку фільтрації після входу</p>

              <p>Також на нижній панелі було додано дві нові кнопки які дозволяють користувачу який ввійшов систему додавати на 
              карту маркери та полігони, та змінювати вже існуючі об’єкти карти.(див. рис. 20)</p>

              <img src={require('./images/instruction-of-user/image-20.png')} alt="Зображення" />
              <p align="center">Рисунок 20 – розширення нижньої панелі навігації</p>

              <p>Для додавання необхідно натиснути на кнопку додавання точки та обрати місце на карті після чого буде відкрито 
              модальне вікно(див. рис. 21) в якому необхідно обрати вид діяльності підприємства, форму власності , ім’я та опис 
              об’єкту, після чого натиснути доадти об’єкт після чого якщо всі дані внесені правильно об’єкт буде додан на карту.</p>

              <img src={require('./images/instruction-of-user/image-21.png')} alt="Зображення" />
              <p align="center">Рисунок 21 - приклад додавання точки на мапу.</p>

              <p>Для виключення режиму додавання необхідно натиснути на кнопку виключення режиму додавання на нижній панелі навігації.
              (див. рис. 22)</p>

              <img src={require('./images/instruction-of-user/image-22.png')} alt="Зображення" />
              <p align="center">Рисунок 22 – виключення режиму додавання.</p>

              <p>Для додавання полігону необхідно включити режим додавння полігона (див. рис. 23) та натиснути декілька разів на карту 
              для дого аби поставити точки які будуть утворювати полігон (наразі точки не відображаються візуально), після чого на 
              панелі навігації необхідно натиснути на кнопку закінчення полігону.</p>

              <img src={require('./images/instruction-of-user/image-23.png')} alt="Зображення" />
              <p align="center">Рисунок 23 – включення режиму додавання полігону.</p>

              <p>Для позначення полігону необхідно поставити точки на карті що будуть зображувати цей полігон, у разі неправильно зайвої 
              точки на неї можна натиснути після чого в popup меню видалити її натиснувши на “Видалити точку”, також поставлені точки 
              полігону можна переміщувати по карті до його збереження(див. рис. 24).</p>

              <img src={require('./images/instruction-of-user/image-24.png')} alt="Зображення" />
              <p align="center">Рисунок 24 – побудування полігону перед додаванням</p>

              <p>Після чого необхідно натиснути кнопку “Закінчити полігон” на нижній навігаційній панелі та заповнити таку інформацію у 
              модальному вікні: колір, товщину лінії назву полігону  та його опис.(див. рис 25)</p>

              <img src={require('./images/instruction-of-user/image-25.png')} alt="Зображення" />
              <p align="center">Рисунок 25 – приклад додавання полігону</p>

              <p>Після правильно введених даних необхідно натиснути зберегти і на карту буде додан новий полігон.</p>
            </div>

            <div id="handbook">
              <h3>Довідка</h3>
              <p>Сторінка довідки використовується адміністратором для редагування даних в базі даних і вона не доступна іншим експертам 
              та звичайним користувачам.</p>
              <p>Для входу експерта в систему необхідно натиснути кнопку Війти в навігаційному меню після чого буде відображено модальне 
              вікно.(див. рис. 26)</p>

              <img src={require('./images/instruction-of-user/image-26.png')} alt="Зображення" />
              <p align="center">Рисунок 26 - кнопка входу на навігаційній панелі.</p>

              <p>Після чого відкриється модальне вікно(див. рис. 27) де користувачу необхідно буде ввести логін і пароль, у разі успішного 
              входу в систему на навігаційній панелі буде відображене ім’я користувача та його звання у системі.</p>

              <img src={require('./images/instruction-of-user/image-27.png')} alt="Зображення" />
              <p align="center">Рисунок 27- модальне вікно входу</p>

              <p>Також після успішного входу адміністратора в систему на навігаційній панелі буде додано нове посилання “Довідники”
              (див. рис 28) з якими може працювати лише  адміністратор , не гість не інший експерт який не має прав доступу адміністратора 
              не побачить даної кнопки.</p>

              <img src={require('./images/instruction-of-user/image-28.png')} alt="Зображення" />
              <p align="center">Рисунок 28 – випадаючий список довідника.</p>

              <p>Довідки використовуються адміністратором для перегляду інформації в базі даних , її видалення, додавання та редагування 
              в інтерфейсі довідника.(див. рис 29)</p>

              <img src={require('./images/instruction-of-user/image-29.png')} alt="Зображення" />
              <p align="center">Рисунок 29 – сторінка роботи з довідником</p>

              <p>Для пошуку достатньо ввести значення після чого будуть підібрані усі значення які відповідають введеному значенню 
              користувачем.</p>
              <p>Для додавання необхідно заповнити усі поля які будуть сгенеровані автоматично де кожне поле відповідає стовпцю і 
              натиснути “додати запис”.(див рис. 30)</p>

              <img src={require('./images/instruction-of-user/image-30.png')} alt="Зображення" />
              <p align="center">Рисунок 30 – поля для додавання інформації.</p>

              <p>Для редагування необхідно обрати запис у таблиці з включеним режимом редагування та змінити значення на нові після 
              чого натиснути кнопку ‘редагувати”.(див. рис. 31)</p>

              <img src={require('./images/instruction-of-user/image-31.png')} alt="Зображення" />
              <p align="center">Рисунок 31- приклад полей при редагуванні інформації.</p>

              <p>Для видалення необхідно з включеним режимом видалення обрати рядок після чого підтвердити видалення елементу.</p>
              <p>Кнопка Export у CSV завантажує інформацію з обраної адміністратором таблиці у вигляді CSV файлу.(див. рис. 32)</p>

              <img src={require('./images/instruction-of-user/image-32.png')} alt="Зображення" />
              <p align="center">Рисунок 32 – приклад згенерованого CSV файлу </p>
            </div>
          </div>
        </div>    
      </main>
    </div>
  );
};
