const movies = [
  { id: 'stars', title: 'Stars in the Dark', meta: 'Drama · 2h 08m', genre: 'Drama', art: 'linear-gradient(140deg,#f28c66,#653f60 45%,#171d37)' },
  { id: 'drift', title: 'Neon Drift', meta: 'Action · 1h 54m', genre: 'Action', art: 'linear-gradient(140deg,#b8e2d5,#4b77a7 48%,#172541)' },
  { id: 'wild', title: 'Wild Kingdom', meta: 'Adventure · 2h 16m', genre: 'Adventure', art: 'linear-gradient(140deg,#eecf73,#9e763b 40%,#33452b)' },
  { id: 'midnight', title: 'Midnight Call', meta: 'Thriller · 1h 49m', genre: 'Thriller', art: 'linear-gradient(140deg,#c84953,#54213b 47%,#171625)' }
];
const storageKey = 'cinewave-bookings-v1';
let current = null;
const $ = (selector) => document.querySelector(selector);
const getBookings = () => JSON.parse(localStorage.getItem(storageKey) || '[]');
const saveBookings = (items) => localStorage.setItem(storageKey, JSON.stringify(items));
const money = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

function renderMovies() {
  $('#movie-grid').innerHTML = movies.map(movie => `<button class="movie-card" data-movie="${movie.id}" aria-label="Book ${movie.title}"><div class="movie-art" style="background:${movie.art}">${movie.title.replace(' ', '<br />')}</div><div class="movie-info"><div><h3>${movie.title}</h3><span class="tag">${movie.genre}</span></div><p>${movie.meta}</p></div></button>`).join('');
  $('#movie').innerHTML = movies.map(movie => `<option value="${movie.id}">${movie.title}</option>`).join('');
  document.querySelectorAll('[data-movie]').forEach(button => button.addEventListener('click', () => { $('#movie').value = button.dataset.movie; $('#booking').scrollIntoView(); }));
}

function renderBookings() {
  const bookings = getBookings();
  $('#booking-list').innerHTML = bookings.length ? bookings.map(item => `<article class="booking-item"><header><h3>${item.movieName}</h3><span class="status ${item.status === 'Confirmed' ? 'confirmed' : 'awaiting'}">${item.status.toUpperCase()}</span></header><p>${item.showDate} · ${item.showTime}<br />${item.tickets} ticket${item.tickets > 1 ? 's' : ''} · ${item.format} · ${money(item.total)}${item.seats ? `<br />Seats: <strong>${item.seats}</strong>` : ''}</p><small>Case ${item.caseId} · ${item.queue}</small></article>`).join('') : '<div class="empty">No booking requests yet. Pick a movie above to start your cinema night.</div>';
}

function showToast(message) { const toast = $('#toast'); toast.textContent = message; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 3000); }
function makeCaseId() { return `CW-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`; }
function dateLabel(date) { return new Date(`${date}T12:00:00`).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }); }
function selectedMovie() { return movies.find(movie => movie.id === $('#movie').value); }

function availabilityDialog() {
  const form = new FormData($('#booking-form'));
  const tickets = Number(form.get('tickets'));
  const formatMultiplier = { '2D': 1, IMAX: 1.55, '4DX': 1.8 }[form.get('format')];
  const base = form.get('showType') === 'Premium' ? 420 : 260;
  const total = Math.round(base * formatMultiplier * tickets);
  const available = 28 + (selectedMovie().id.charCodeAt(0) % 37);
  current = { customerName: form.get('customerName'), customerEmail: form.get('customerEmail'), movieName: selectedMovie().title, showType: form.get('showType'), showDate: dateLabel(form.get('showDate')), showTime: form.get('showTime'), tickets, format: form.get('format'), total, available, ticketPrice: Math.round(base * formatMultiplier), queue: form.get('showType') === 'Premium' ? 'PremiumShowQueue' : 'StandardShowQueue', caseId: makeCaseId(), status: 'Awaiting confirmation', createdAt: new Date().toISOString(), slaGoal: '1 day', slaDeadline: '2 days' };
  $('#availability-content').innerHTML = `<div class="dialog-body"><p class="eyebrow">AVAILABILITY CHECK</p><h2>Great news, seats are available.</h2><div class="availability-good"><b>✓</b>${available} seats are open for this show</div><div class="quote"><span>${tickets} × ${money(current.ticketPrice)}<br />${current.format} · ${current.showType}</span><strong>${money(total)}</strong></div><p>Your request will be held while you review the booking. It is routed to <strong>${current.queue}</strong> and has a 1-day confirmation goal.</p><div class="dialog-actions"><button class="secondary-button" data-close="availability-dialog">Edit request</button><button class="primary-button" id="review-booking">Review booking <span>→</span></button></div></div>`;
  $('#availability-dialog').showModal();
  $('[data-close="availability-dialog"]').onclick = () => $('#availability-dialog').close();
  $('#review-booking').onclick = confirmationDialog;
}

function confirmationDialog() {
  $('#availability-dialog').close();
  $('#confirmation-content').innerHTML = `<div class="dialog-body"><p class="eyebrow">CUSTOMER CONFIRMATION</p><h2>Review your booking</h2><p>${current.movieName}<br /><strong>${current.showDate} · ${current.showTime}</strong><br />${current.tickets} ticket${current.tickets > 1 ? 's' : ''} · ${current.format} · ${current.showType}<br />Total <strong>${money(current.total)}</strong></p><p>After you confirm, CineWave assigns your seats and sends your ticket confirmation email.</p><div class="dialog-actions"><button class="secondary-button" id="cancel-booking">Cancel request</button><button class="primary-button" id="confirm-booking">Confirm & get tickets <span>→</span></button></div></div>`;
  $('#confirmation-dialog').showModal();
  $('#cancel-booking').onclick = () => { $('#confirmation-dialog').close(); current = null; showToast('Booking request cancelled.'); };
  $('#confirm-booking').onclick = finalizeBooking;
}

function finalizeBooking() {
  const row = Math.floor(Math.random() * 5) + 4;
  const seats = Array.from({ length: current.tickets }, (_, index) => `${String.fromCharCode(65 + (row % 4))}${row + index}`).join(', ');
  const booking = { ...current, status: 'Confirmed', seats, ticketId: `TKT-${String(Date.now()).slice(-8)}`, notification: `Email sent to ${current.customerEmail}` };
  saveBookings([booking, ...getBookings()]);
  $('#confirmation-dialog').close();
  renderBookings();
  $('#booking-form').reset(); $('#tickets').value = 2;
  showToast(`Confirmed! Ticket ${booking.ticketId} has been emailed to ${booking.customerEmail}.`);
  current = null;
}

function renderStaff() {
  const bookings = getBookings(); const confirmed = bookings.filter(b => b.status === 'Confirmed'); const premium = bookings.filter(b => b.queue === 'PremiumShowQueue');
  $('#metrics').innerHTML = `<div class="metric"><strong>${bookings.length}</strong><span>Cases created</span></div><div class="metric"><strong>${confirmed.length}</strong><span>Confirmed</span></div><div class="metric"><strong>${premium.length}</strong><span>Premium queue</span></div>`;
  $('#staff-list').innerHTML = bookings.length ? bookings.map(b => `<div class="staff-row"><div><strong>${b.caseId}</strong><small>${b.movieName} · ${b.customerName}</small></div><div><span class="status ${b.status === 'Confirmed' ? 'confirmed' : 'awaiting'}">${b.status}</span><small>${b.queue}</small></div></div>`).join('') : '<p class="empty">The queue is currently clear.</p>';
}

function init() {
  renderMovies(); renderBookings();
  const date = new Date(); date.setDate(date.getDate() + 1); $('#show-date').min = date.toISOString().split('T')[0]; $('#show-date').value = date.toISOString().split('T')[0];
  $('#booking-form').addEventListener('submit', event => { event.preventDefault(); availabilityDialog(); });
  $('#staff-toggle').onclick = () => { renderStaff(); $('#staff-dialog').showModal(); };
  $('[data-close="staff-dialog"]').onclick = () => $('#staff-dialog').close();
  $('#clear-bookings').onclick = () => { localStorage.removeItem(storageKey); renderBookings(); showToast('Demo booking data cleared.'); };
}
init();
