import { render, screen, waitFor, within } from '@testing-library/react';
import App from './App';

// Let the async work settle so its state updates land inside the test instead
// of leaking act() warnings: the mock fetches in About/MeetOwner, and the
// Reviews load, which ends once loadReviews() rejects (no key in the test env).
const settled = async () => {
  await screen.findByText(/over 20 years of experience/);
  await waitFor(() => expect(document.querySelector('#reviews [aria-busy]')).toBeNull());
};

test('renders the Services section with all 13 services', async () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: 'Services' })).toBeInTheDocument();
  const section = document.getElementById('services');
  expect(within(section).getAllByRole('listitem')).toHaveLength(13);
  await settled();
});

test('Reviews falls back to the two Google links when there is no API key', async () => {
  render(<App />);
  const section = document.getElementById('reviews');
  await settled();

  expect(within(section).getByRole('heading', { name: /say about us/ })).toBeInTheDocument();
  expect(within(section).getByRole('link', { name: 'See all reviews on Google' }))
    .toHaveAttribute('href', expect.stringContaining('place_id:ChIJk0gR5uMP6IkRsc_qKOkMSEk'));
  expect(within(section).getByRole('link', { name: 'Leave a review' }))
    .toHaveAttribute('href', expect.stringContaining('writereview?placeid=ChIJk0gR5uMP6IkRsc_qKOkMSEk'));
  // Nothing else: no cards, no Google attribution, and no script injected.
  expect(within(section).queryAllByRole('listitem')).toHaveLength(0);
  expect(section).not.toHaveTextContent('Google Maps');
  expect(document.querySelector('script[src*="googleapis"]')).toBeNull();
});
