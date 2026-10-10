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
  loadReviews.mockResolvedValue({ rating: null, ratingCount: 0, reviews: [] });
  render(<Reviews />);
  // The links render while loading, so wait for the load itself to finish.
  await waitFor(() => expect(document.querySelector('[aria-busy]')).toBeNull());
  expect(screen.getByRole('heading', { name: /say about us/ })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'See all reviews on Google' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Leave a review' })).toBeInTheDocument();
  expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  expect(screen.queryByText('Google Maps')).toBeNull();
});

test('a null overall rating renders the cards without a summary row', async () => {
  loadReviews.mockResolvedValue({
    rating: null,
    ratingCount: null,
    reviews: [{ rating: null, text: 'Fine work.', author: 'Cy C.', when: 'a week ago' }],
  });
  render(<Reviews />);
  expect(await screen.findByText('Fine work.')).toBeInTheDocument();
  expect(document.querySelector('.reviews-summary')).toBeNull();
  expect(screen.queryByRole('img')).toBeNull(); // no Stars anywhere
});

test('a star-only review has no empty paragraph', async () => {
  loadReviews.mockResolvedValue({
    rating: 5,
    ratingCount: 1,
    reviews: [{ rating: 5, text: '', author: 'Di D.', when: 'today' }],
  });
  render(<Reviews />);
  const card = (await screen.findAllByRole('listitem'))[0];
  expect(card.querySelector('p')).toBeNull();
  expect(within(card).getByText('Di D.')).toBeInTheDocument();
});

test('a non-https author URL is rendered as plain text', async () => {
  loadReviews.mockResolvedValue({
    rating: 5,
    ratingCount: 1,
    reviews: [{ rating: 5, text: 'Great.', author: 'Ed E.', authorUrl: 'javascript:alert(1)', when: 'today' }],
  });
  render(<Reviews />);
  const card = (await screen.findAllByRole('listitem'))[0];
  expect(within(card).queryByRole('link')).toBeNull();
  expect(within(card).getByText('Ed E.')).toBeInTheDocument();
});

test('short text with many line breaks still gets Read more', async () => {
  loadReviews.mockResolvedValue({
    rating: 5,
    ratingCount: 1,
    reviews: [{ rating: 5, text: 'a\nb\nc\nd\ne\nf\ng', author: 'Fi F.', when: 'today' }],
  });
  render(<Reviews />);
  expect(await screen.findByRole('button', { name: 'Read more' })).toBeInTheDocument();
});
