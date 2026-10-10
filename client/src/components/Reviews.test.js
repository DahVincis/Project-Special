import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import Reviews from './Reviews';
import { loadReviews } from '../googleReviews';

jest.mock('../googleReviews', () => ({
  ...jest.requireActual('../googleReviews'),
  loadReviews: jest.fn(),
}));

const long = 'Wonderful craftsmanship from start to finish. '.repeat(8);

test('renders what Google returns, with attribution and a Read more toggle', async () => {
  loadReviews.mockResolvedValue({
    rating: 4.9,
    ratingCount: 31,
    mapsUrl: 'https://maps.google.com/?cid=1',
    reviews: [
      { rating: 5, text: long, author: 'Ann A.', authorUrl: 'https://maps.google.com/contrib/1', when: 'a month ago' },
      { rating: 4, text: 'Great job.', author: 'Bob B.', when: '2 weeks ago' },
    ],
  });
  render(<Reviews />);

  // Summary: text alternative on the stars, count, Google's link.
  expect(await screen.findByLabelText('4.9 out of 5')).toBeInTheDocument();
  expect(screen.getByText('31 reviews')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'See all reviews on Google' }))
    .toHaveAttribute('href', 'https://maps.google.com/?cid=1');

  // Cards: author links out safely when Google gave a URL, plain text otherwise.
  const cards = screen.getAllByRole('listitem');
  expect(cards).toHaveLength(2);
  const author = within(cards[0]).getByRole('link', { name: 'Ann A.' });
  expect(author).toHaveAttribute('target', '_blank');
  expect(author).toHaveAttribute('rel', expect.stringContaining('noopener'));
  expect(within(cards[1]).queryByRole('link')).toBeNull();
  expect(within(cards[1]).getByText('Bob B.')).toBeInTheDocument();
  expect(within(cards[1]).queryByRole('button')).toBeNull(); // short text: no toggle

  // Long text is clamped until the real button expands it.
  const more = within(cards[0]).getByRole('button', { name: 'Read more' });
  expect(more).toHaveAttribute('aria-expanded', 'false');
  fireEvent.click(more);
  expect(within(cards[0]).getByRole('button', { name: 'Show less' })).toHaveAttribute('aria-expanded', 'true');

  expect(screen.getByText('Google Maps')).toHaveAttribute('translate', 'no');
});

test('zero reviews shows only the heading and the two links', async () => {
  loadReviews.mockResolvedValue({ rating: undefined, ratingCount: 0, reviews: [] });
  render(<Reviews />);
  // The links render while loading, so wait for the load itself to finish.
  await waitFor(() => expect(document.querySelector('[aria-busy]')).toBeNull());
  expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  expect(screen.queryByText('Google Maps')).toBeNull();
});
