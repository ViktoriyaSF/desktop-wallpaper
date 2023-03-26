import './css/styles.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import axios from 'axios';
// Описаний в документації
import SimpleLightbox from 'simplelightbox';
// Додатковий імпорт стилів
import 'simplelightbox/dist/simple-lightbox.min.css';

// ---------------- запит HTML
const KEY = '34347073-8f1b60398676bada9d735fc2f';
const restAPI = '&image_type=photo&orientation=horizontal&safesearch=true';
let page = 1;
let namePhoto = ' ';
const perPage = 40;

// const url = 'https://pixabay.com/api/';
// function searchPhoto(namePhoto, page = 1, perPage = 40) {
//   return fetch(
//     `${url}?key=${KEY}&q=${namePhoto}${restAPI}&page=${page}&per_page=${perPage}`
//   ).then(res => {
//     return res.json();
//   });
// }

// спроба зробити через axios
axios.defaults.baseURL = 'https://pixabay.com/api/';

async function searchPhoto(namePhoto, page = 1, perPage = 40) {
  const response = await axios(
    `?key=${KEY}&q=${namePhoto}${restAPI}&page=${page}&per_page=${perPage}`
  );
  return response;
}

// зображення слайд картинки
const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
});

const searchFormPoto = document.querySelector('#search-form');
const galleryPhoto = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

searchFormPoto.addEventListener('submit', onSubmitPhoto);
loadMoreBtn.addEventListener('click', onLoadMore);

// кнопка пошуку
async function onSubmitPhoto(e) {
  e.preventDefault();
  galleryPhoto.innerHTML = '';
  loadMoreBtn.style.display = 'none';

  namePhoto = e.target.elements.searchQuery.value.trim();
  if (!namePhoto) {
    return Notify.failure(
      'Sorry, the search field cannot be empty. Please enter information to search.'
    );
  }
  const { data } = await searchPhoto(namePhoto); // значення що сформоване

  cardPhoto(data); // формування картки
  messageInfo(data); // формування повідомлення
  stopSearch(data); // всі зображення знайденні
  e.target.reset(); // чистка input
}
// кнопка завантаження
async function onLoadMore() {
  page += 1;
  // searchPhoto(namePhoto, page, perPage).then(({ data }) => {
  //   cardPhoto(data);
  //   stopSearch(data);
  // });
  const { data } = await searchPhoto(namePhoto, page, perPage);
  cardPhoto(data);
  stopSearch(data);
  smoothScroll(); // прокрутка зображення
}

// функція для створення картки HTML вибираючи по hits
function cardPhoto(arr) {
  const markUp = arr.hits
    .map(el => {
      return `
    <div class="photo-card">
    <a class="gallery-link" href="${el.largeImageURL}">
    <img src="${el.webformatURL}" alt="${el.tags}" loading="lazy" />
    </a>
    <div class="info">
    <p class="info-item"><b>Likes</b>${el.likes}
    </p>
    <p class="info-item"><b>Views</b>${el.views}
    </p>
    <p class="info-item"><b>Comments</b>${el.comments}
    </p>
    <p class="info-item"><b>Downloads</b>${el.downloads}
    </p>
    </div>
    </div>`;
    })
    .join('');
  galleryPhoto.insertAdjacentHTML('beforeend', markUp);
  // зображення слайд картинки  в один загальний
  lightbox.refresh();
}

// функції всіх повідомлень
function messageInfo(arr) {
  if (arr.hits.length === 0) {
    Notify.warning(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
  if (arr.totalHits !== 0) {
    Notify.success(`Hooray! We found ${arr.totalHits} images.`);
  }
}
function stopSearch(arr) {
  if (arr.hits.length < 40 && arr.hits.length > 0) {
    loadMoreBtn.style.display = 'none';
    Notify.info("We're sorry, but you've reached the end of search results.");
  }
  if (arr.hits.length === 40) {
    loadMoreBtn.style.display = 'block';
  }
}

//плавний перехід
function smoothScroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 3,
    behavior: 'smooth',
  });
}
// кнопка підняття вверх
galleryPhoto.insertAdjacentHTML(
  'beforebegin',
  `<button id="myBtn" title="Go UP">UP</button>`
);

window.onscroll = function () {
  scrollFunction();
};
const myBtn = document.getElementById('myBtn');

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    myBtn.style.display = 'block';
  } else {
    myBtn.style.display = 'none';
  }
}

myBtn.addEventListener('click', topFunction);

function topFunction() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}
