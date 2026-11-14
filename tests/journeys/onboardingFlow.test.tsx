// @vitest-environment jsdom
import { afterEach, beforeAll, describe, it, expect, vi } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Onboarding, LAGOS_LGAS, DEVELOPMENT_OPTIONS } from '../../views/Onboarding';

beforeAll(() => {
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
  window.requestAnimationFrame = vi.fn((cb: FrameRequestCallback) => window.setTimeout(() => cb(Date.now()), 16)) as unknown as typeof window.requestAnimationFrame;
  window.cancelAnimationFrame = vi.fn((id: number) => window.clearTimeout(id)) as unknown as typeof window.cancelAnimationFrame;
  const noopCtx = new Proxy({}, { get: () => () => {} });
  HTMLCanvasElement.prototype.getContext = vi.fn(() => noopCtx) as unknown as HTMLCanvasElement['getContext'];
});

afterEach(() => {
  cleanup();
  localStorage.clear();
});

async function goToStep3(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('radio', { name: /Individual \/ Property Owner/ }));
  await user.click(screen.getByRole('radio', { name: /Residential/ }));
  await user.click(screen.getByRole('radio', { name: /New construction/ }));
  await user.click(screen.getByRole('button', { name: /Continue to property details/ }));

  await user.type(screen.getByLabelText('Property Address'), '5 Adeola Odeku Street, Victoria Island');
  await user.selectOptions(screen.getByLabelText('LGA (Local Govt Area)'), 'Ikeja');
  await user.selectOptions(screen.getByLabelText('Title Document'), 'Certificate of Occupancy');
  await user.type(screen.getByLabelText('Land Size (Sqm)'), '600');
  await user.type(screen.getByLabelText('Number of Floors'), '2');
  await user.type(screen.getByLabelText('Number of Units / Flats'), '1');
  await user.click(screen.getByRole('button', { name: /Continue to documents/ }));

  await screen.findByRole('heading', { name: /Documents & service needs/ });
}

async function goToStep4(user: ReturnType<typeof userEvent.setup>) {
  await goToStep3(user);
  await user.click(screen.getByRole('button', { name: /View my assessment/ }));
  await screen.findByRole('heading', { name: /Readiness assessment/ });
}

async function fillContactAndComplete(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Phone Number (WhatsApp)'), '0803 123 4567');
  await user.type(screen.getByLabelText('Email Address'), 'client@example.com');
  await user.click(screen.getByRole('button', { name: /Submit Application/ }));
}

function renderOnboarding() {
  render(
    <MemoryRouter initialEntries={['/onboarding']}>
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/" element={<div>Home</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('onboarding completion journey', () => {
  it(
    'shows the confirmation screen and stops persisting project records',
    async () => {
      const user = userEvent.setup();
      renderOnboarding();

      await goToStep4(user);
      await fillContactAndComplete(user);

      expect(await screen.findByRole('heading', { name: /Application summary ready/ })).toBeInTheDocument();
      expect(screen.getByText('5 Adeola Odeku Street, Victoria Island')).toBeInTheDocument();
      expect(screen.getByText('Ikeja')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Send Summary on WhatsApp/ })).toHaveAttribute(
        'href',
        expect.stringContaining('https://wa.me/'),
      );

      expect(localStorage.getItem('userProjects')).toBeNull();
      expect(localStorage.getItem('currentProject')).toBeNull();
      expect(localStorage.getItem('permitflow_onboarding_draft')).toBeNull();
    },
    60000,
  );

  it('returns to step 1 when the user starts another application', async () => {
    const user = userEvent.setup();
    renderOnboarding();

    await goToStep4(user);
    await fillContactAndComplete(user);

    await user.click(screen.getByRole('button', { name: /Start Another Application/ }));

    expect(await screen.findByRole('heading', { name: /Project type & scope/ })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /Application summary ready/ })).not.toBeInTheDocument();
  }, 60000);

  it('blocks progression on step 1 until all three choices are made', async () => {
    const user = userEvent.setup();
    renderOnboarding();

    await user.click(screen.getByRole('button', { name: /Continue to property details/ }));

    expect(await screen.findAllByRole('alert')).toHaveLength(3);
    expect(screen.getByRole('heading', { name: /Project type & scope/ })).toBeInTheDocument();

    await waitFor(() => {
      expect(localStorage.getItem('permitflow_onboarding_draft')).not.toBeNull();
    });
  });

  it('lists the official EPPES supporting documents and clearance letters', async () => {
    const user = userEvent.setup();
    renderOnboarding();

    await goToStep3(user);

    expect(screen.getByText('LIRS Clearance')).toBeInTheDocument();
    expect(screen.getByText('Clearance letter from LSDPC')).toBeInTheDocument();
    expect(
      screen.getByText('Clearance letter from Power Distribution Company / Fire Services / Police Report'),
    ).toBeInTheDocument();
    expect(screen.getByText(/Buildings above 3 floors/)).toBeInTheDocument();
  }, 60000);

  it('blocks completion if the phone number is invalid', async () => {
    const user = userEvent.setup();
    renderOnboarding();

    await goToStep4(user);

    const phone = screen.getByLabelText('Phone Number (WhatsApp)');
    await user.type(phone, '123');
    await user.click(screen.getByRole('button', { name: /Submit Application/ }));

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /Application summary ready/ })).not.toBeInTheDocument();
  }, 60000);
});

describe('onboarding option lists', () => {
  it('exposes exactly the ten required development options in order', () => {
    expect(DEVELOPMENT_OPTIONS.map((o) => o.label)).toEqual([
      'Agricultural',
      'Commercial',
      'Industrial',
      'Institutional',
      'Mixed Use',
      'Recreational',
      'Religious',
      'Residential',
      'Special Applications',
      'Transportation',
    ]);
    expect(new Set(DEVELOPMENT_OPTIONS.map((o) => o.label)).size).toBe(10);
  });

  it('exposes exactly the fifty-three required LGAs in order and without duplicates', () => {
    expect(LAGOS_LGAS).toEqual([
      'Lagos Island', 'Lagos Mainland', 'Lekki 1', 'Lekki 2', 'Mosan Okunola',
      'Mushin', 'Ojo', 'Ojodu', 'Ojokoro', 'Oke-Odo',
      'Olorunda', 'Ori-Ade', 'Oshodi', 'Papa Ajao', 'Somolu',
      'Surulere', 'Yaba', 'Ibeju Lekki East', 'Ibeju Lekki West', 'Ifako Ijaye',
      'Igando', 'Igogbo Baiyeku', 'Ijede', 'Ikeja', 'Ikorodu Central',
      'Ikorodu North', 'Ikorodu West', 'Ikosi Eredo', 'Ikota', 'Ikotun',
      'Ikoyi Obalende', 'Imota', 'Iru-Victoria Island', 'Isolo', 'Kosofe',
      'Iba/Otto/Awori', 'Addo - Badore', 'Agbado', 'Agboyi Ikosi Ketu', 'Agege',
      'Ajeromi-Ifelodun', 'Alimosho', 'Amuwo-Odofin', 'Apapa', 'Ayobo-Ipaja',
      'Badagry', 'Bariga', 'Coker Aguda', 'Egbe Idimu', 'Epe',
      'Eti-Osa East', 'Eti-Osa North', 'Eti-Osa South',
    ]);
    expect(new Set(LAGOS_LGAS).size).toBe(53);
  });
});
