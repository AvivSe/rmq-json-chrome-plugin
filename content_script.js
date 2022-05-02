const createButtonContainer = () => {
	const container = document.createElement('div');
	container.style.display = 'flex';
	return container;
};

function autoGenerateMoveMessagesQueueName(isDeadLetterQueue, originalQueue) {
	if (isDeadLetterQueue) {
		const inputContainer = getMoveMessagesInput();
		inputContainer.value = originalQueue;
	}
}

const createButton = label => {
	const button = document.createElement('div');

	button.style.width = 'fit-content';
	button.style.border = '2px solid purple';
	button.style.color = 'purple';
	button.style.cursor = 'pointer';
	button.style.padding = '2px';
	button.style.borderRadius = '5px';
	button.style.display = 'none';
	button.style.fontWeight = 'bold';
	button.style.margin = '4px';

	button.innerHTML = label;

	return button;
};

const isInValidJsonString = value => {
	try {
		value && JSON.parse(value);
		return null;
	} catch (e) {
		return e;
	}
};

const pretify = json => {
	return JSON.stringify(JSON.parse(json), undefined, 4);
};

const getMoveMessagesInput = () => {
	return document.getElementsByName('dest-queue')[0];
};

const getPayloadElement = () => {
	return document.getElementsByName('payload')[0];
};

const attachPlugin = () => {
	const payload = getPayloadElement();

	if (payload) {
		payload.style.outline = 'unset';

		const pretty = createButton('Beautify');
		const errorSection = document.createElement('div');
		errorSection.style.color = 'red';
		const fixJsonButton = createButton('Fix JS Convention');
		const nestButton = createButton('Pattern');
		nestButton.style.display = 'block';
		const queueName = window.location.hash?.split('/')?.pop();
		const DEAD_LETTER_QUEUE = '.dead-letters';
		const isDeadLetterQueue = queueName.includes(DEAD_LETTER_QUEUE);
		const originalQueue = queueName.split(DEAD_LETTER_QUEUE)[0];

		function onChange() {
			const error = isInValidJsonString(payload.value);
			if (error) {
				const position = Number(error.message.split('at position ')[1]);
				let hint;
				if (!isNaN(position)) {
					hint = getPayloadElement().value.slice(position - 10, position);
				}
				errorSection.innerHTML = `${error.message}${
					hint &&
					`: <span style="color: black">${hint.slice(
						0,
						hint.length - 1,
					)}</span><span style="font-weight: bold">${hint[hint.length - 1]}</span>`
				}`;
				payload.style.border = `2px solid red`;
				pretty.style.display = 'none';
				fixJsonButton.style.display = 'block';
			} else {
				errorSection.innerHTML = '';
				payload.style.border = `2px solid green`;
				pretty.style.display = 'block';
				fixJsonButton.style.display = 'none';
			}
		}

		payload.onkeyup = onChange;

		pretty.onclick = function () {
			payload.value = pretify(payload.value);
		};

		fixJsonButton.onclick = function () {
			const jsontemp = payload.value.replace(/([\w]+)(:)/g, '"$1"$2');
			const correctjson = jsontemp.replace(/'/g, '"');
			payload.value = pretify(correctjson);
			onChange();
		};

		nestButton.onclick = function () {
			payload.value = pretify(
				JSON.stringify({
					pattern: window.location.hash?.split('/')?.pop() || '',
					data: {},
				}),
			);
			onChange();
		};

		autoGenerateMoveMessagesQueueName(isDeadLetterQueue, originalQueue);

		const plugin = document.createElement('div');
		plugin.id = 'rmqJsonPlugin';

		plugin.append(errorSection);

		const buttonContainer = createButtonContainer();
		buttonContainer.append(pretty);
		buttonContainer.append(fixJsonButton);
		buttonContainer.append(nestButton);

		plugin.append(buttonContainer);
		payload.parentNode.append(plugin);
	}
};

window.addEventListener('load', event => {
	setTimeout(attachPlugin, 100);
	setInterval(() => {
		if (!document.getElementById('rmqJsonPlugin')) {
			attachPlugin();
		}
	}, 3000);
});
