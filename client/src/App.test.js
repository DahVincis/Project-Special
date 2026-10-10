import { render, screen, within } from '@testing-library/react';
import App from './App';

test('renders the Services section with all 13 services', async () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: 'Services' })).toBeInTheDocument();
  const section = document.getElementById('services');
  expect(within(section).getAllByRole('listitem')).toHaveLength(13);
  // Let the mock fetches in About/OurWork/MeetOwner settle so their state
  // updates land inside the test instead of leaking act() warnings.
  await screen.findByText(/Outstanding work/);
  await screen.findByText(/over 20 years of experience/);
});
