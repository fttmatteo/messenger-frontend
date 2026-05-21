/// <reference types="google.maps" />
const pinElement = new google.maps.marker.PinElement({
    background: 'red',
});
const container = document.createElement('div');
container.appendChild(pinElement.element);
