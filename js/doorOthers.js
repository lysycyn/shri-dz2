// ===================== Пример кода первой двери =======================
/**
 * @class Door0
 * @augments DoorBase
 * @param {Number} number
 * @param {Function} onUnlock
 */
function Door0(number, onUnlock) {
    DoorBase.apply(this, arguments);

    var buttons = [
        this.popup.querySelector('.door-riddle__button_0'),
        this.popup.querySelector('.door-riddle__button_1'),
        this.popup.querySelector('.door-riddle__button_2')
    ];

    buttons.forEach(function (b) {
        b.addEventListener('pointerdown', _onButtonPointerDown.bind(this));
        b.addEventListener('pointerup', _onButtonPointerUp.bind(this));
        b.addEventListener('pointercancel', _onButtonPointerUp.bind(this));
        b.addEventListener('pointerleave', _onButtonPointerUp.bind(this));
    }.bind(this));

    function _onButtonPointerDown(e) {
        e.target.classList.add('door-riddle__button_pressed');
        checkCondition.apply(this);
    }

    function _onButtonPointerUp(e) {
        e.target.classList.remove('door-riddle__button_pressed');
    }

    /**
     * Проверяем, можно ли теперь открыть дверь
     */
    function checkCondition() {
        var isOpened = true;
        buttons.forEach(function (b) {
            if (!b.classList.contains('door-riddle__button_pressed')) {
                isOpened = false;
            }
        });

        // Если все три кнопки зажаты одновременно, то откроем эту дверь
        console.log(this);
        if (isOpened) {

            this.unlock();
        }
    }
}

// Наследуемся от класса DoorBase
Door0.prototype = Object.create(DoorBase.prototype);
Door0.prototype.constructor = DoorBase;
// END ===================== Пример кода первой двери =======================


/**
 * @class Door1
 * @augments DoorBase
 * @param {Number} number
 * @param {Function} onUnlock
 */
function Door1(number, onUnlock) {
    DoorBase.apply(this, arguments);

    var buttonsStatic = [
        this.popup.querySelector('.door-riddle_1__button_0'),
        this.popup.querySelector('.door-riddle_1__button_1')
    ];

    var buttonGear = this.popup.querySelector('.door-riddle_1__button_gear');
    var isCanTouchGear = false;

    buttonsStatic.forEach(function (b) {
        b.addEventListener('pointerdown', _onButtonPointerDown.bind(this));
        b.addEventListener('pointerup', _onButtonPointerUp.bind(this));
        b.addEventListener('pointercancel', _onButtonPointerUp.bind(this));
        b.addEventListener('pointerleave', _onButtonPointerUp.bind(this));
    }.bind(this));

    function _onButtonPointerDown(e) {
        e.target.setPointerCapture(e.pointerId);
        e.target.classList.add('door-riddle__button_pressed');
        checkConditionStatic.apply(this);
    }

    function _onButtonPointerUp(e) {
        e.target.releasePointerCapture(e.pinterId);
        e.target.classList.remove('door-riddle__button_pressed');
        checkConditionStatic.apply(this);
    }

    function checkConditionStatic() {
        isCanTouchGear = true;
        buttonsStatic.forEach(function (b) {
            if (!b.classList.contains('door-riddle__button_pressed')) {
                isCanTouchGear = false;
            }
        });

        if (isCanTouchGear) {
            buttonGear.classList.add('door-riddle_1__button_gear_canPress');
            buttonGear.addEventListener('pointerdown', _onButtonGearDown.bind(this));
        } else {
            buttonGear.classList.remove('door-riddle_1__button_gear_canPress');
            buttonGear.removeEventListener('pointerdown', _onButtonGearDown);
        }
    }

    function _onButtonGearDown(e) {
        e.target.classList.add('door-riddle_1__button_gear_rotate');
        setTimeout(this.unlock(), 1500);
    }
}
Door1.prototype = Object.create(DoorBase.prototype);
Door1.prototype.constructor = DoorBase;


// координаты центра элемента - нужны для правильного движения указателя
function getElementCenter(e) {
    var rect = e.getBoundingClientRect();
    return {
        y: rect.top + rect.height / 2,
        x: rect.left + rect.width / 2
    };
}

// при событии move передвигает элемент вслед за пальцем
function updatePosition(element, x, y) {
    requestAnimationFrame(function () {
        element.style.transform = `translate(${x}, ${y})`;
    });
}

// возвращаем максимальное значение по x или y
function getElementsCenterDiff(el1, el2) {
    var rect1 = el1.getBoundingClientRect();
    var rect2 = el2.getBoundingClientRect();
    return Math.max(
        Math.abs(rect1.left - rect2.left),
        Math.abs(rect1.top - rect2.top)
    );
}

/**
 * @class Door2
 * @augments DoorBase
 * @param {Number} number
 * @param {Function} onUnlock
 */
function Door2(number, onUnlock) {
    DoorBase.apply(this, arguments);
    var doorCounters = this.popup.querySelector('.door-counters');
    var counter = this.popup.querySelector('.door-counter');
    var timer = this.popup.querySelector('.door-timer');

    var buttonMove = this.popup.querySelector('.door-riddle_2__button_0');
    var buttonStatic = this.popup.querySelector('.door-riddle_2__button_1');

    buttonMove.addEventListener('pointerdown', _onButtonMovePointerDown.bind(this));
    buttonMove.addEventListener('pointerup', _onButtonMovePointerUp.bind(this));
    buttonMove.addEventListener('pointercancel', _onButtonMovePointerUp.bind(this));
    buttonMove.addEventListener('pointerleave', _onButtonMovePointerUp.bind(this));

    var buttonMovePosition = getElementCenter(buttonMove);
    var countButtonsCheck = 0;
    var time = 10;
    var isTimeOver = false;
    var isEndChallenge = false;
    var isVisitButtonStatic = false;
    var timerIdChangePosition = null;
    var timerIdRunChallenge = null;
    var timerIdCounter = null;

    function _onButtonMovePointerDown(e) {
        buttonMove.setPointerCapture(e.pointerId);
        buttonMove.addEventListener('pointermove', _onButtonMovePointerMove);
        e.target.classList.add('door-riddle__button_green');
        buttonStatic.classList.add('door-riddle__button_visible');
        doorCounters.classList.add('door-counters_visible');
        isEndChallenge = false;
        time = 10;
        countButtonsCheck = 0;
        timer.textContent = time;
        counter.textContent = countButtonsCheck;
        timerIdChangePosition = setInterval(setButtonStaticPosition.bind(this), 800);
        timerIdRunChallenge = setTimeout(endChallenge.bind(this), 10000);
        timerIdCounter = setInterval(changeTime.bind(this), 1000);
    }

    function _onButtonMovePointerUp(e) {
        buttonMove.removeEventListener('pointermove', _onButtonMovePointerMove);
        e.target.classList.remove('door-riddle__button_green');
        buttonStatic.classList.remove('door-riddle__button_visible');
        doorCounters.classList.remove('door-counters_visible');


        buttonMove.releasePointerCapture(e.pointerId);
        updatePosition(buttonMove, 0, 0);
        updatePosition(buttonStatic, 0, 0);

        endChallenge.apply(this);

    }

    function _onButtonMovePointerMove(e) {
        console.log('перемещение');
        updatePosition(e.target,
            e.clientX - buttonMovePosition.x + 'px',
            e.clientY - buttonMovePosition.y + 'px');
        if (getElementsCenterDiff(e.target, buttonStatic) < 30 && !isVisitButtonStatic) {
            countButtonsCheck = countButtonsCheck + 1;
            console.log('сумма ' + countButtonsCheck);
            isVisitButtonStatic = true;
            counter.textContent = countButtonsCheck;
        }
    }

    function setButtonStaticPosition() {
        isVisitButtonStatic = false;
        console.log(Math.random());
        buttonStatic.classList.remove('door-riddle__button_pressed');
        var xRand = `calc(20px + ${Number(Math.random().toFixed(2) * 250)}px)`;
        var yRand = `calc(10px + ${Number(Math.random().toFixed(2) * 300)}px)`;
        console.log(xRand);
        console.log(yRand);

        updatePosition(buttonStatic, xRand, yRand);
    }

    function checkCondition() {
        console.log('проверка условия');

        if (!isEndChallenge) {
            if (countButtonsCheck < 12) {
                alert('Вы не набрали 12 очков, попробуйте заново');
                this.closePopup();
            } else {
                this.unlock();
            }
        }
    }

    function endChallenge() {
        if (!isEndChallenge) {
            checkCondition.apply(this);
            isEndChallenge = true;
            clearTimeout(timerIdRunChallenge);
            clearInterval(timerIdChangePosition);
            clearTimeout(timerIdCounter);
        }
        console.log('изменение isEndChallenge на true');
    }


    function changeTime() {
        time = time - 1;
        timer.textContent = time;
        console.log('изменение времени');
    }

    // ==== Напишите свой код для открытия третей двери здесь ====
    // Для примера дверь откроется просто по клику на неё

    // ==== END Напишите свой код для открытия третей двери здесь ====
}
Door2.prototype = Object.create(DoorBase.prototype);
Door2.prototype.constructor = DoorBase;

/**
 * Сундук
 * @class Box
 * @augments DoorBase
 * @param {Number} number
 * @param {Function} onUnlock
 */
function Box(number, onUnlock) {
    DoorBase.apply(this, arguments);


    function pairButtons(buttonMove, buttonStatic, checkConditionCallback) {
        console.log(this);
        buttonMove.addEventListener('pointerdown', _onButtonMovePointerDown);
        buttonMove.addEventListener('pointerup', _onButtonMovePointerUp);
        buttonMove.addEventListener('pointerleave', _onButtonMovePointerUp);
        buttonMove.addEventListener('pointercancel', _onButtonMovePointerUp);

        var buttonMovePosition = getElementCenter(buttonMove);

        function _onButtonMovePointerDown(e) {
            buttonMove.setPointerCapture(e.pointerId);
            buttonMove.addEventListener('pointermove', _onButtonMovePointerMove);
            e.target.classList.add('door-riddle__button_pressed');
            buttonStatic.classList.add('door-riddle__button_visible');
        }

        function _onButtonMovePointerUp(e) {
            buttonMove.removeEventListener('pointermove', _onButtonMovePointerMove);
            e.target.classList.remove('door-riddle__button_pressed');
            e.target.classList.remove('door-riddle__button_green');
            buttonStatic.classList.remove('door-riddle__button_visible');
            buttonMove.classList.remove('door-riddle__button_green');
            buttonMove.releasePointerCapture(e.pointerId);
            updatePosition(buttonMove, 0, 0);
        }

        function _onButtonMovePointerMove(e) {
            updatePosition(e.target,
                e.clientX - buttonMovePosition.x + 'px',
                e.clientY - buttonMovePosition.y + 'px');
            if (getElementsCenterDiff(e.target, buttonStatic) < 20) {
                buttonStatic.classList.add('door-riddle__button_pressed');
                buttonMove.classList.add('door-riddle__button_green');
                checkConditionCallback();
            } else {
                if (buttonStatic.classList.contains('door-riddle__button_pressed')) {
                    buttonStatic.classList.remove('door-riddle__button_pressed');
                    buttonMove.classList.remove('door-riddle__button_green');
                }
            }
        }
    }

    var buttons = [
        this.popup.querySelector('.door-riddle_3__button_0'),
        this.popup.querySelector('.door-riddle_3__button_1'),
        this.popup.querySelector('.door-riddle_3__button_2'),
        this.popup.querySelector('.door-riddle_3__button_3'),
        this.popup.querySelector('.door-riddle_3__button_4'),
        this.popup.querySelector('.door-riddle_3__button_5'),
        this.popup.querySelector('.door-riddle_3__button_6'),
        this.popup.querySelector('.door-riddle_3__button_7')
    ];

    var lock = this.popup.querySelector('.door-riddle_3__button_lock');

    var fourthPair = pairButtons(buttons[0], buttons[1], checkCondition.bind(this));
    var thirdPair = pairButtons(buttons[2], buttons[3], checkCondition.bind(this));
    var secondPair = pairButtons(buttons[4], buttons[5], checkCondition.bind(this));
    var firstPair = pairButtons(buttons[6], buttons[7], checkCondition.bind(this));

    function checkCondition() {
        var isOpened = true;
        buttons.forEach(function (button) {
            if (!button.classList.contains('door-riddle__button_pressed')) {
                isOpened = false;
            }
        });
        if (isOpened) {
            this.unlock();
        }
    }

    // ==== Напишите свой код для открытия сундука здесь ====
    // Для примера сундук откроется просто по клику на него

    // ==== END Напишите свой код для открытия сундука здесь ====

    this.showCongratulations = function () {
        alert('Поздравляем! Игра пройдена!');
    };
}
Box.prototype = Object.create(DoorBase.prototype);
Box.prototype.constructor = DoorBase;
