/* ===========================
   POINT D'ENTRÉE
=========================== */
document.addEventListener('DOMContentLoaded', () => {

  // Register page
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const firstName = document.getElementById('first-name').value.trim();
      const lastName = document.getElementById('last-name').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();

      if (!firstName || !lastName || !email || !password) {
        showError(registerForm, 'Please fill in all fields.');
        return;
      }

      await registerUser(firstName, lastName, email, password);
    });
  }

  // Login page
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();

      if (!email || !password) {
        showError(loginForm, 'Please fill in all fields.');
        return;
      }

      await loginUser(email, password);
    });
  }

  setupLogoutButton();

  // Index page
  if (document.getElementById('places-list')) {
    checkAuthentication();
    setupPriceFilter();
  }

  if (document.getElementById('place-details')) {
    const placeId = getPlaceIdFromURL();

    if (!placeId) {
      window.location.href = 'index.html';
    } else {
      checkPlaceAuthentication(placeId);

      const reviewForm = document.getElementById('review-form');
      if (reviewForm) {
        reviewForm.addEventListener('submit', async (event) => {
          event.preventDefault();

          const token = getCookie('token');
          if (!token) {
            window.location.href = 'login.html';
            return;
          }

          const reviewText = document.getElementById('review-text').value.trim();
          const rating = document.getElementById('rating').value;

          if (!reviewText || !rating) {
            showReviewMessage('Please fill in all fields.', 'error');
            return;
          }

          await submitReview(token, placeId, reviewText, rating);
        });
      }
    }
  }

  // Review
  if (document.getElementById('review-form') &&
      document.getElementById('place-name')) {
    const token = checkReviewAuthentication();
    const placeId = getPlaceIdFromURL();

    if (!placeId) {
      window.location.href = 'index.html';
      return;
    }

    // Afficher le nom du lieu si on est sur add_review.html
    const placeNameTitle = document.getElementById('place-name');
    if (placeNameTitle) {
      fetchPlaceName(token, placeId, placeNameTitle);
    }

    const reviewForm = document.getElementById('review-form');
    reviewForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const reviewText = document.getElementById('review-text').value.trim();
      const rating = document.getElementById('rating').value;

      if (!reviewText || !rating) {
        showReviewMessage('Please fill in all fields.', 'error');
        return;
      }

      await submitReview(token, placeId, reviewText, rating);
    });
  }

});

/* ===========================
   FETCH REGISTER
=========================== */
async function registerUser(firstName, lastName, email, password) {
  try {
    const response = await fetch('http://localhost:5000/api/v1/users/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        email,
        password
      })
    });

    if (response.ok) {
      window.location.href = 'login.html';
    } else {
      let message = 'Registration failed.';
      try {
        const data = await response.json();
        if (data.error) message = data.error;
        else if (data.message) message = data.message;
      } catch (_) {}
      showError(document.getElementById('register-form'), message);
    }

  } catch (error) {
    showError(
      document.getElementById('register-form'),
      'Unable to reach the server. Check your connection.'
    );
    console.error('Erreur register:', error);
  }
}

/* ===========================
   FETCH LOGIN
=========================== */
async function loginUser(email, password) {
  try {
    const response = await fetch('http://localhost:5000/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (response.ok) {
      const data = await response.json();

      const expires = new Date();
      expires.setDate(expires.getDate() + 1);
      document.cookie = `token=${data.access_token}; path=/; expires=${expires.toUTCString()}`;

      window.location.href = 'index.html';

    } else {
      let message = 'Incorrect email or password.';
      try {
        const errorData = await response.json();
        if (errorData.message) message = errorData.message;
      } catch (_) {}

      showError(document.getElementById('login-form'), message);
    }

  } catch (error) {
    showError(
      document.getElementById('login-form'),
      'Unable to reach the server. Check your connection.'
    );
    console.error('Erreur login:', error);
  }
}


/* ===========================
   AFFICHAGE DES DÉTAILS
=========================== */
function displayPlaceDetails(place) {
  const detailsSection = document.getElementById('place-details');
  const reviewsSection = document.getElementById('reviews');

  // Détails du lieu
  detailsSection.innerHTML = `
    <div class="place-info">
      <h1>${place.title}</h1>
      <p><strong>Price per night:</strong> ${place.price} €</p>
      <p><strong>Description:</strong> ${place.description ?? 'No description.'}</p>
      <p><strong>Latitude:</strong> ${place.latitude}</p>
      <p><strong>Longitude:</strong> ${place.longitude}</p>
      <p><strong>Amenities:</strong> ${
        place.amenities && place.amenities.length > 0
          ? place.amenities.join(', ')
          : 'No amenities listed.'
      }</p>
    </div>
  `;

  // Nom du lieu dans le titre de la page add_review
  // (stocké pour être réutilisé)
  document.title = place.title + ' - HBnB';

  // Avis
  reviewsSection.innerHTML = '<h2>Reviews</h2>';

  if (!place.reviews || place.reviews.length === 0) {
    reviewsSection.innerHTML += '<p>No reviews for this place.</p>';
    return;
  }

  place.reviews.forEach(review => {
    const card = document.createElement('div');
    card.classList.add('review-card');
    card.innerHTML = `
      <p>${review.text}</p>
      <p><strong>User:</strong> ${review.user_name ?? 'Anonymous'}</p>
      <p><strong>Rating:</strong> ${'⭐'.repeat(review.rating)} (${review.rating}/5)</p>
    `;
    reviewsSection.appendChild(card);
  });
}

/* ===========================
   DÉCONNEXION
=========================== */
function logoutUser() {
  deleteCookie('token');
  window.location.href = 'login.html';
}

function setupLogoutButton() {
  const logoutBtn = document.getElementById('logout-button');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logoutUser);
  }
}

/* ===========================
   AUTHENTIFICATION LOGIN
=========================== */
function checkAuthentication() {
  const token = getCookie('token');
  const loginLink = document.getElementById('login-link');
  const logoutBtn = document.getElementById('logout-button');

  if (!token) {
    loginLink.style.display = 'block';
    if (logoutBtn) logoutBtn.style.display = 'none';
  } else {
    loginLink.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'block';
    fetchPlaces(token);
    showWelcomeBanner(token);
  }
}

/* ===========================
   BIENVENUE
=========================== */
function getUserIdFromToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub;
  } catch (_) {
    return null;
  }
}

async function showWelcomeBanner(token) {
  const banner = document.getElementById('welcome-banner');
  if (!banner) return;

  const userId = getUserIdFromToken(token);
  if (!userId) return;

  try {
    const response = await fetch(`http://localhost:5000/api/v1/users/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      const user = await response.json();
      banner.textContent = `Welcome back, ${user.first_name} ✦`;
      banner.style.display = 'block';
    }
  } catch (_) {}
}


/* ===========================
   VÉRIFICATION AUTH (place.html)
=========================== */
function checkPlaceAuthentication(placeId) {
  const token = getCookie('token');
  const addReviewSection = document.getElementById('add-review');
  const loginLink = document.getElementById('login-link');
  const logoutBtn = document.getElementById('logout-button');

  if (!token) {
    // Pas connecté → on cache le formulaire d'avis
    addReviewSection.style.display = 'none';
    if (loginLink) loginLink.style.display = 'block';
    if (logoutBtn) logoutBtn.style.display = 'none';
  } else {
    // Connecté → on montre le formulaire d'avis
    addReviewSection.style.display = 'block';
    if (loginLink) loginLink.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'block';
  }

  // On charge les détails dans tous les cas
  // (connecté ou non, on peut voir les détails)
  fetchPlaceDetails(token, placeId);
}


/* ===========================
   VÉRIFICATION AUTH (add_review)
=========================== */
function checkReviewAuthentication() {
  const token = getCookie('token');

  if (!token) {
    // Pas connecté → redirection immédiate vers l'accueil
    window.location.href = 'index.html';
    return null;
  }

  return token;
}


/* ===========================
   SOUMISSION DE L'AVIS
=========================== */
async function submitReview(token, placeId, reviewText, rating) {
  try {
    const response = await fetch(
      `http://localhost:5000/api/v1/reviews/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          text: reviewText,
          rating: parseInt(rating),
          place_id: placeId
        })
      }
    );

    await handleReviewResponse(response);

  } catch (error) {
    showReviewMessage('Unable to reach the server.', 'error');
    console.error('Erreur submitReview:', error);
  }
}


/* ===========================
   NOM DU LIEU
=========================== */
async function fetchPlaceName(token, placeId, element) {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(
      `http://localhost:5000/api/v1/places/${placeId}/`,
      { method: 'GET', headers }
    );

    if (response.ok) {
      const place = await response.json();
      element.textContent = `Review for: ${place.title}`;
    }
  } catch (error) {
    console.error('Erreur fetchPlaceName:', error);
  }
}


/* ===========================
   RÉCUPÉRATION ID DANS L'URL
=========================== */
function getPlaceIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}


/* ===========================
   GESTION DE LA RÉPONSE
=========================== */
async function handleReviewResponse(response) {
  if (response.ok) {
    // Succès → message + reset du formulaire
    showReviewMessage('Your review has been submitted!', 'success');
    document.getElementById('review-form').reset();

    // Redirection vers la page du lieu après 2 secondes
    const placeId = getPlaceIdFromURL();
    setTimeout(() => {
      window.location.href = `place.html?id=${placeId}`;
    }, 2000);

  } else {
    let message = 'Failed to submit your review.';
    try {
      const errorData = await response.json();
      console.log('Erreur serveur:', response.status, errorData);
      if (errorData.error) message = errorData.error;
      else if (errorData.message) message = errorData.message;
    } catch (_) {}

    showReviewMessage(message, 'error');
  }
}


/* ===========================
   FETCH PLACES
=========================== */
async function fetchPlaces(token) {
  try {
    const response = await fetch('http://localhost:5000/api/v1/places/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const places = await response.json();
      displayPlaces(places);
    } else {
      showListError('Unable to load places.');
    }

  } catch (error) {
    showListError('Unable to reach the server.');
    console.error('Erreur fetchPlaces:', error);
  }
}


/* ===========================
   FETCH DÉTAILS DU LIEU
=========================== */
async function fetchPlaceDetails(token, placeId) {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(
      `http://localhost:5000/api/v1/places/${placeId}/`,
      { method: 'GET', headers }
    );

    if (response.ok) {
      const place = await response.json();
      displayPlaceDetails(place);
    } else {
      showPlaceError('Unable to load place details.');
    }

  } catch (error) {
    showPlaceError('Unable to reach the server.');
    console.error('Erreur fetchPlaceDetails:', error);
  }
}


/* ===========================
   AFFICHAGE DES PLACES
=========================== */
function displayPlaces(places) {
  const placesList = document.getElementById('places-list');
  placesList.innerHTML = '';

  if (places.length === 0) {
    placesList.innerHTML = '<p>No places available.</p>';
    return;
  }

  places.forEach(place => {
    const card = document.createElement('div');
    card.classList.add('place-card');
    card.dataset.price = place.price;

    card.innerHTML = `
      <h2>${place.title}</h2>
      <p>Price per night: <strong>${place.price} €</strong></p>
      <a href="place.html?id=${place.id}" class="details-button">View Details</a>
      `;

    placesList.appendChild(card);
  });
}


/* ===========================
   FILTRE PAR PRIX
=========================== */
function setupPriceFilter() {
  const filter = document.getElementById('price-filter');

  filter.innerHTML =
    '<option value="all">All</option>' +
    '<option value="10">Up to 10 €</option>' +
    '<option value="50">Up to 50 €</option>' +
    '<option value="100">Up to 100 €</option>';

  filter.addEventListener('change', (event) => {
    const selectedPrice = event.target.value;
    const cards = document.querySelectorAll('.place-card');

    cards.forEach(card => {
      const cardPrice = parseFloat(card.dataset.price);

      if (selectedPrice === 'all') {
        // Tout afficher
        card.style.display = 'block';
      } else if (cardPrice <= parseFloat(selectedPrice)) {
        // Prix inférieur ou égal → on affiche
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  });
}


/* ===========================
   COOKIES
=========================== */
function getCookie(name) {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [key, value] = cookie.trim().split('=');
    if (key === name) return value;
  }
  return null;
}

function isAuthenticated() {
  return getCookie('token') !== null;
}

function deleteCookie(name) {
  document.cookie = name +'=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC';
}


/* ===========================
   UTILITAIRES ERREURS
=========================== */
function showError(form, message) {
  const existing = form.querySelector('.error-message');
  if (existing) existing.remove();

  const error = document.createElement('p');
  error.classList.add('error-message');
  error.textContent = message;
  error.style.cssText = `
    color: #c0392b;
    background-color: #fdf0f0;
    border: 1px solid #e0b0b0;
    border-radius: 8px;
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
    margin-top: 0.5rem;
  `;
  form.appendChild(error);
}

function showListError(message) {
  const placesList = document.getElementById('places-list');
  placesList.innerHTML = `
    <p style="
      color: #c0392b;
      background-color: #fdf0f0;
      border: 1px solid #e0b0b0;
      border-radius: 8px;
      padding: 0.6rem 1rem;
      font-size: 0.9rem;
    ">${message}</p>
  `;
}

function showPlaceError(message) {
  const detailsSection = document.getElementById('place-details');
  detailsSection.innerHTML = `
    <p style="
      color: #c0392b;
      background-color: #fdf0f0;
      border: 1px solid #e0b0b0;
      border-radius: 8px;
      padding: 0.6rem 1rem;
      font-size: 0.9rem;
    ">${message}</p>
  `;
}

function showReviewMessage(message, type) {
  const form = document.getElementById('review-form');

  // Supprimer un message existant
  const existing = form.querySelector('.review-message');
  if (existing) existing.remove();

  const msg = document.createElement('p');
  msg.classList.add('review-message');
  msg.textContent = message;

  const isSuccess = type === 'success';
  msg.style.cssText = `
    color: ${isSuccess ? '#2e7d32' : '#c0392b'};
    background-color: ${isSuccess ? '#f0f7f0' : '#fdf0f0'};
    border: 1px solid ${isSuccess ? '#a5d6a7' : '#e0b0b0'};
    border-radius: 8px;
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
    margin-top: 0.5rem;
  `;

  form.appendChild(msg);
}
