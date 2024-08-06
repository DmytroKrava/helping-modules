import './style.css';


function setDisplayForElement(element, value) {
	let allElements = document.getElementsByClassName(element);
    for (let i = 0; i < allElements.length;	i++) {
       	allElements[i].style.display = value;
    }
}


export function changeRegime(checkBoxValue) {
	if (!checkBoxValue) {
		setDisplayForElement('fas fa-play', 'none');
		setDisplayForElement('fas fa-stop', 'none');
		setDisplayForElement('modal-window-button', 'none');
		setDisplayForElement('show-help', 'none');
    } else {
    	setDisplayForElement('fas fa-play', 'block');
		setDisplayForElement('fas fa-stop', 'block');
		setDisplayForElement('modal-window-button', 'block');
		setDisplayForElement('show-help', 'block');
    }
}


let hovered = false;
let titleCopy = "";


function outFromMouse() {
	const tooltip = document.querySelector(".tooltip-style");
    if (tooltip) {
      	hovered = false;
      	document.body.removeChild(tooltip);
    }
}


export function tooltip(event) {
    if (!document.getElementsByName("interactive-mode")[0].checked | hovered) {
    	return;
    }

    hovered = true;
    const button = event.target;
    let tooltip = document.createElement('span');
    tooltip.innerText = button.dataset.content;
    tooltip.className = 'tooltip-style';
    document.body.appendChild(tooltip);

    let buttonRect = button.getBoundingClientRect();
    let tooltipRect = tooltip.getBoundingClientRect();

	if (buttonRect.bottom + tooltipRect.height < window.innerHeight) {
		tooltip.style.top = buttonRect.bottom + window.pageYOffset + 'px';
	}
	else {
		tooltip.style.top = buttonRect.top + window.pageYOffset - tooltipRect.height + 'px';
	}

	if (buttonRect.left + tooltipRect.width < window.innerWidth) {
		tooltip.style.left = buttonRect.left + 'px';
	}
	else {
		tooltip.style.left = buttonRect.left + buttonRect.width - tooltipRect.width + 'px';
	}

    button.addEventListener("mouseout", outFromMouse);
}


function dropModalWindow(event) {
	let close = document.querySelector(".close-modal");

	if (close.contains(event.target)) {
		const tooltip = document.querySelector(".modal-window");
	    document.body.removeChild(tooltip);
	}
}


export function modalWindow(event) {
    var button = event.target.closest('button');;

    let modalElement = document.createElement("div");
    modalElement.className = "modal-window";

    let modalContent = document.createElement("div");
    modalContent.className = "modal-window-content";

    let close = document.createElement("span");
    close.className = "close-modal";
    close.innerHTML  = "&times;";

    let p = document.createElement("div");
    p.innerHTML = button.dataset.content;

    document.body.appendChild(modalElement);
    modalElement.appendChild(modalContent);
    modalContent.appendChild(close);
    modalContent.appendChild(p);
    modalElement.style.display = 'block';

    close.addEventListener('click', function() {
    	document.body.removeChild(document.querySelector(".modal-window"));
    });
}


export function audio(name) {
	const playButton = document.getElementsByName(name)[0];
	let audio = new Audio(playButton.dataset.arg1);

	playButton.addEventListener('click', function() {
	  if (audio.paused) {
	    playButton.classList.remove('fa-play');
	    playButton.classList.toggle('fa-stop');
	    audio.load();
	    audio.play();
	  }
	  else {
		  playButton.classList.remove('fa-stop');
		  playButton.classList.toggle('fa-play');
		  audio.pause();
	  }
	});

	document.addEventListener('keydown', function(event) {
		event.preventDefault();
	});

	audio.addEventListener('ended', function() {
		playButton.classList.remove('fa-stop');
		playButton.classList.toggle('fa-play');
		audio.load();
	});
}
