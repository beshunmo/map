ymaps.ready(init);

const inputForTitle = document.querySelector('.title-placemark');
const listPlacemark = document.querySelector('.list-placemark');
const points = [];
const coordsArr = [];
let myMap;
let polyline;

Sortable.create(listPlacemark, {
  onEnd: function (evt) {
    [points[evt.newIndex], points[evt.oldIndex]] = [points[evt.oldIndex], points[evt.newIndex]];
    updatePolyline();
  }
});

function init() {
  myMap = new ymaps.Map("map", {
    center: [55.76, 37.64],
    zoom: 11
  }, {
      searchControlProvider: 'yandex#search'
    });

  document.addEventListener('keyup', ({ code }) => {
    if (code === 'Enter') {
      const btnDelete = createLi();
      const point = addNewPoint();

      addEventRemovePoint(btnDelete, point);
    }
  })
}

function createLi() {
  const li = document.createElement('li');
  li.innerText = inputForTitle.value;
  li.className = 'list-group-item';

  const btnDelete = document.createElement('button');
  btnDelete.classList.add('btn-delete', 'btn', 'btn-info');
  btnDelete.innerText = 'X';
  listPlacemark.appendChild(li);
  li.appendChild(btnDelete);

  return btnDelete;
}

function addNewPoint() {
  const point = {
    name: inputForTitle.value,
    placemark: createNewPlacemark()
  }

  points.push(point);
  inputForTitle.value = '';

  updatePolyline();

  return point;
}

function addEventRemovePoint(btn, point) {
  btn.addEventListener('click', () => {
    const index = points.indexOf(point);
    const placemark = point.placemark;

    myMap.geoObjects.remove(placemark);
    btn.parentElement.remove();
    points.splice(index, 1);
    updatePolyline();
  });
}

function createNewPlacemark() {
  const placeMark = new ymaps.GeoObject({
    // Описание геометрии.
    geometry: {
      type: "Point",
      coordinates: myMap.getCenter()
    },
    // Свойства.
    properties: {
      // Контент метки.
      iconContent: inputForTitle.value,
      hintContent: 'Ну давай уже тащи'
    }
  }, {
      // Опции.
      // Иконка метки будет растягиваться под размер ее содержимого.
      preset: 'islands#blackStretchyIcon',
      // Метку можно перемещать.
      draggable: true
    });


  myMap.geoObjects.add(placeMark);

  placeMark.events.add('dragend', updatePolyline);

  return placeMark;
}

function updatePolyline() {
  if (points.length < 2) {
    myMap.geoObjects.remove(polyline);
    polyline = undefined;
    return;
  }

  // Создаем ломаную линию.
  const line = new ymaps.Polyline(points.map(point => point.placemark.geometry.getCoordinates()
  ), {}, {
      // Задаем опции геообъекта.
      // Цвет с прозрачностью.
      strokeColor: "#00000088",
      // Ширину линии.
      strokeWidth: 4
    });

  if (polyline) {
    myMap.geoObjects.remove(polyline);
  }

  // Добавляем линию на карту.
  myMap.geoObjects.add(line);

  polyline = line;
}

